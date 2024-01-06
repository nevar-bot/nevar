import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";
import { exec } from "child_process";

export default class PullCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "update",
			description: "Bringt den Bot auf den aktuellen Stand des GitHub Repositories",
			staffOnly: true,
			dirname: __dirname,
			slashCommand: {
				addCommand: false,
				data: null,
			},
		});
	}

	private message: any;

	public async dispatch(message: any, args: any[], data: any): Promise<void> {
		this.message = message;
		await this.update();
	}

	private async update(): Promise<void> {
		const updateEmbed: EmbedBuilder = this.client.createEmbed("Starte Aktualisierung...", "warning", "warning");
		const repliedMessage = await this.message.reply({
			embeds: [updateEmbed],
		});

		exec("git pull", (err: any, stdout: string, stderr: string): void => {
			if (err) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					`Beim Aktualisieren ist ein Fehler aufgetreten:\`\`\`${err}\`\`\``,
					"error",
					"error",
				);
				return repliedMessage.edit({ embeds: [errorEmbed] });
			}
			exec("npm run build", (err: any, stdout: string, stderr: string): void => {
				if (err) {
					const errorEmbed: EmbedBuilder = this.client.createEmbed(
						`Beim Aktualisieren ist ein Fehler aufgetreten:\`\`\`${err}\`\`\``,
						"error",
						"error",
					);
					return repliedMessage.edit({ embeds: [errorEmbed] });
				}
			});
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				"Aktualisierung erfolgreich, starte neu...",
				"success",
				"success",
			);
			repliedMessage.edit({ embeds: [successEmbed] }).then((): void => {
				process.exit(1);
			});
		});
	}
}
