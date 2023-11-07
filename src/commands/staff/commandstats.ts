import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";
import mongoose from "mongoose";

export default class CommandstatsCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "commandstats",
			description: "Zeigt wie oft ein Befehl ausgeführt wurde",
			staffOnly: true,
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
		await this.sendStats(args);
	}

	private async sendStats(args: any[]): Promise<void> {
		if (!args[0]) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				"Du musst einen Befehl angeben.",
				"error",
				"normal"
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		const command: any = this.client.commands.get(args[0]);
		if (!command) {
			const invalidCommandEmbed: EmbedBuilder = this.client.createEmbed(
				"Der Befehl existiert nicht.",
				"error",
				"normal"
			);
			return this.message.reply({ embeds: [invalidCommandEmbed] });
		}

		const executedCommands: any = (
			await (
				await mongoose.connection.db.collection("logs").find({ command: command.help.name })
			).toArray()
		).length;

		const statsEmbed: EmbedBuilder = this.client.createEmbed(
			"Der {0}-Command wurde {1}x ausgeführt.",
			"arrow",
			"normal",
			command.help.name,
			executedCommands
		);
		return this.message.reply({ embeds: [statsEmbed] });
	}
}
