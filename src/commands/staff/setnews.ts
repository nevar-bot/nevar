import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";
import fs from "fs";

export default class SetnewsCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "setnews",
			description: "Setzt die Ankündigung im Help-Befehl",
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
		await this.setmessage(args.join(" "));
	}
	private async setmessage(message: string): Promise<void> {
		const json: any = {
			timestamp: Date.now(),
			text: message,
		};

		if (!fs.existsSync("./assets/news.json")) {
			const invalidFileEmbed: EmbedBuilder = this.client.createEmbed(
				'Die Datei "assets/news.json" wurde nicht gefunden.',
				"error",
				"error",
			);
			return this.message.reply({ embeds: [invalidFileEmbed] });
		}

		fs.writeFileSync("./assets/news.json", JSON.stringify(json, null, 4));
		const successEmbed: EmbedBuilder = this.client.createEmbed(
			"Die Ankündigung wurde erfolgreich geändert.",
			"success",
			"success",
		);
		return this.message.reply({ embeds: [successEmbed] });
	}
}
