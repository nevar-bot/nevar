import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default class XpForCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "xpfor",
			description:
				"Zeigt, wieviel XP für ein bestimmtes Level benötigt wird",
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addIntegerOption(
					(option: any) =>
						option
							.setName("level")
							.setDescription("Gib das Level an")
							.setMinValue(1)
							.setRequired(true)
				)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		await this.sendXpFor(interaction.options.getInteger("level"), data);
	}

	private async sendXpFor(level: number, data: any): Promise<void> {
		function secondsToTime(secs: number): string {
			secs = Math.round(secs);
			const hours: number = Math.floor(secs / (60 * 60));

			const divisor_minutes: number = secs % (60 * 60);
			const minutes: number = Math.floor(divisor_minutes / 60);

			const divisor_seconds: number = divisor_minutes % 60;
			const seconds: number = Math.ceil(divisor_seconds);

			return hours + "h " + minutes + "m " + seconds + "s";
		}

		const minXp = data.guild.settings.levels.xp.min;
		const maxXp = data.guild.settings.levels.xp.max;
		const averageXp: number = Math.round((minXp + maxXp) / 2);
		const neededXp: string = this.client.format(
			this.client.levels.xpFor(level)
		);
		const timeoutLengthInSeconds: 15 = 15;
		const neededTime: string = secondsToTime(
			(this.client.levels.xpFor(level) / averageXp) *
				timeoutLengthInSeconds
		);
		const neededMessages: string = this.client.format(
			Math.round(this.client.levels.xpFor(level) / averageXp)
		);

		const text: string =
			"Um Level **" +
			level +
			"** zu erreichen, werden **" +
			neededXp +
			" XP** benötigt.\n" +
			this.client.emotes.arrow +
			" Auf diesem Server werden " +
			minXp +
			" bis " +
			maxXp +
			" XP pro Nachricht vergeben, der Durchschnitt liegt bei " +
			averageXp +
			" XP pro Nachricht.\n" +
			this.client.emotes.arrow +
			" Bei einem Timeout von 15 Sekunden, entspricht dies etwa **" +
			neededMessages +
			" Nachrichten**, und einem Zeitaufwand von **" +
			neededTime +
			"**.";

		const xpForEmbed: EmbedBuilder = this.client.createEmbed(
			"{0}",
			"arrow",
			"normal",
			text
		);
		return this.interaction.followUp({ embeds: [xpForEmbed] });
	}
}
