import BaseCommand from "@structures/BaseCommand.js";
import BaseClient from "@structures/BaseClient.js";
import { EmbedBuilder } from "discord.js";
import { exec } from "child_process";
import path from "path";

export default class UpdateCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "update",
			description: "Brings the code up to date with the GitHub repository",
			localizedDescriptions: {
				de: "Bringt den Code auf Stand des GitHub Repositories"
			},
			ownerOnly: true,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: false,
				data: null,
			},
		});
	}


	public async dispatch(message: any, args: any[], data: any): Promise<void> {
		this.message = message;
		this.guild = message.guild;
		this.data = data;
		await this.update();
	}

	private async update(): Promise<any> {
		const updateEmbed: EmbedBuilder = this.client.createEmbed(this.translate("startUpdate"), "warning", "warning");
		const repliedMessage = await this.message.reply({
			embeds: [updateEmbed],
		});

		exec("git pull", (err: any, stdout: string, stderr: string): any => {
			if (err) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("errors:cantPullFromGithub") + `\`\`\`${err}\`\`\``,
					"error",
					"error",
				);
				return repliedMessage.edit({ embeds: [errorEmbed] });
			}
			exec("npm run build", (err: any, stdout: string, stderr: string): any => {
				if (err) {
					const errorEmbed: EmbedBuilder = this.client.createEmbed(
						this.translate("errors:cantCompileTypescript") + `\`\`\`${err}\`\`\``,
						"error",
						"error",
					);
					return repliedMessage.edit({ embeds: [errorEmbed] });
				}
			});
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("codeUpdated"),
				"success",
				"success",
			);
			repliedMessage.edit({ embeds: [successEmbed] });
		});
	}
}
