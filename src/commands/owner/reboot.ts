import BaseCommand from "@structures/BaseCommand.js";
import BaseClient from "@structures/BaseClient.js";
import { EmbedBuilder } from "discord.js";
import path from "path";

export default class RebootCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "reboot",
			description: "Restart the bot",
			localizedDescriptions: {
				de: "Starte den Bot neu"
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
		await this.reboot();
	}

	private async reboot(): Promise<void> {
		const rebootEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("reboot", { client: this.client.user!.displayName }),
			"warning",
			"warning",
		);
		await this.message.reply({ embeds: [rebootEmbed] });
		process.exit(1);
	}
}
