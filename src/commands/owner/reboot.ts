import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";

export default class RebootCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "reboot",
			description: "Startet den Bot neu",
			ownerOnly: true,
			dirname: __dirname,
			slashCommand: {
				addCommand: false,
				data: null
			}
		});
	}

	private message: any;

	public async dispatch(message: any, args: any[], data: any): Promise<void> {
		this.message = message;
		await this.reboot();
	}

	private async reboot(): Promise<void> {
		const rebootEmbed: EmbedBuilder = this.client.createEmbed("Der Bot wird neu gestartet...", "warning", "warning");
		await this.message.reply({ embeds: [rebootEmbed] });
		process.exit(1);
	}
}
