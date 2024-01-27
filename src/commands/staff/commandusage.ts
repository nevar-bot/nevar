import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";
import mongoose from "mongoose";

export default class CommandstatsCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "commandusage",
			description: "Look at usage statistics for a command",
			localizedDescriptions: {
				de: "Schau dir Nutzungsstatistiken für einen Befehl an",
			},
			staffOnly: true,
			dirname: __dirname,
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
		await this.sendStats(args);
	}

	private async sendStats(args: any[]): Promise<any> {
		if (!args[0]) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:commandIsMissing"),
				"error",
				"normal",
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		const command: any = this.client.commands.get(args[0]);
		if (!command) {
			const invalidCommandEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:commandNotFound"),
				"error",
				"normal",
			);
			return this.message.reply({ embeds: [invalidCommandEmbed] });
		}

		const executedCommands: any = (
			await (await mongoose.connection.db.collection("logs").find({ command: command.help.name })).toArray()
		);

		const executedTotal: any = executedCommands.length;
		const executedToday: any = executedCommands.filter((c: any) => c.date > Date.now() - 86400000).length;
		const executedWeek: any = executedCommands.filter((c: any) => c.date > Date.now() - 604800000).length;
		const executedMonth: any = executedCommands.filter((c: any) => c.date > Date.now() - 2592000000).length;
		const executedYear: any = executedCommands.filter((c: any) => c.date > Date.now() - 31536000000).length;
		const executedHour: any = executedCommands.filter((c: any) => c.date > Date.now() - 3600000).length;
		// usage in current year
		const executedThisYear: any = executedCommands.filter((c: any) => new Date(c.date).getFullYear() === new Date().getFullYear()).length;

		const statisticsString: string =
			this.translate("statisticsTitle", { command: command.help.name }) + "\n\n" +
			this.client.emotes.calendar + " " + this.translate("executedTotal", { total: executedTotal }) + "\n" +
			this.client.emotes.calendar + " " + this.translate("executedYear", { year: executedThisYear }) + "\n" +
			this.client.emotes.calendar + " " + this.translate("executedMonth", { month: executedMonth }) + "\n" +
			this.client.emotes.calendar + " " + this.translate("executedWeek", { week: executedWeek }) + "\n" +
			this.client.emotes.calendar + " " + this.translate("executedToday", { day: executedToday }) + "\n" +
			this.client.emotes.calendar + " " + this.translate("executedHour", { hour: executedHour });
		const statsEmbed: EmbedBuilder = this.client.createEmbed(
			statisticsString,
			"arrow",
			"normal",
		);
		return this.message.reply({ embeds: [statsEmbed] });
	}
}
