import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";
import { EmbedBuilder } from "discord.js";
import mongoose from "mongoose";
import path from "path";

export default class CommandstatsCommand extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "commandusage",
			description: "Look at usage statistics for a command",
			localizedDescriptions: {
				de: "Schau dir Nutzungsstatistiken für einen Befehl an",
			},
			staffOnly: true,
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

		const commandLogs: any = await mongoose.connection.db.collection("logs").find({ command: command.help.name }).toArray();

		/* Get stats */
		const today: Date = new Date();
		const currentYear: Number = today.getFullYear();
		const currentMonth: Number = today.getMonth();
		const currentDay: Number = today.getDay();
		const currentHour: Number = today.getHours();

		/* Executions total */
		const executionsTotal: number = commandLogs.length;

		/* Executions this year */
		const executionsThisYear: number = commandLogs.filter((log: any): boolean => new Date(log.date).getFullYear() === currentYear).length;

		/* Executions this month */
		const executionsThisMonth: number = commandLogs.filter((log: any): boolean => new Date(log.date).getFullYear() === currentYear && new Date(log.date).getMonth() === currentMonth).length;

		/* Executions today */
		const executionsToday: number = commandLogs.filter((log: any): boolean => new Date(log.date).getFullYear() === currentYear && new Date(log.date).getMonth() === currentMonth && new Date(log.date).getDay() === currentDay).length;

		/* Executions this hour */
		const executionsThisHour: number = commandLogs.filter((log: any): boolean => new Date(log.date).getFullYear() === currentYear && new Date(log.date).getMonth() === currentMonth && new Date(log.date).getDay() === currentDay && new Date(log.date).getHours() === currentHour).length;

		const statisticsString: string =
			this.translate("statisticsTitle", { command: command.help.name }) + "\n\n" +
			this.client.emotes.calendar + " " + this.translate("executedTotal", { total: executionsTotal }) + "\n" +
			this.client.emotes.calendar + " " + this.translate("executedYear", { year: executionsThisYear }) + "\n" +
			this.client.emotes.calendar + " " + this.translate("executedMonth", { month: executionsThisMonth }) + "\n" +
			this.client.emotes.calendar + " " + this.translate("executedToday", { day: executionsToday }) + "\n" +
			this.client.emotes.calendar + " " + this.translate("executedHour", { hour: executionsThisHour });
		const statsEmbed: EmbedBuilder = this.client.createEmbed(
			statisticsString,
			"arrow",
			"normal",
		);
		return this.message.reply({ embeds: [statsEmbed] });
	}
}
