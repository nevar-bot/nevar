import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";
import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder } from "discord.js";
import moment from "moment-timezone";
import path from "path";

export default class TimestampCommand extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "timestamp",
			description: "Create a Discord timestamp from a date",
			localizedDescriptions: {
				de: "Erstelle einen Discord-Timestamp aus einem Datum",
			},
			cooldown: 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName("date")
							.setNameLocalization("de", "datum")
							.setDescription("Enter the date in German format (DD.MM.YYYY HH:mm) (date & time, only date or only time)")
							.setDescriptionLocalization("de", "Gib hier das Datum im deutschen Format an (Datum & Zeit, nur Datum oder nur Zeit)")
							.setRequired(true),
					)
					.addStringOption((option: any) =>
						option
							.setName("format")
							.setNameLocalization("de", "format")
							.setDescription("Choose how the timestamp should be displayed")
							.setDescriptionLocalization("de", "Wähle, wie der Timestamp angezeigt werden soll")
							.setRequired(true)
							.addChoices(
								{
									name: "Short time (e.g. 9:01 p.m.)",
									name_localizations: { de: "Kurze Zeit (bspw. 09:01)" },
									value: "t",
								},
								{
									name: "Long time (e.g. 9:01:00 AM)",
									name_localizations: { de: "Lange Zeit (bspw. 09:01:00)" },
									value: "T",
								},
								{
									name: "Short date (e.g. 11/28/2024)",
									name_localizations: { de: "Kurzes Datum (bspw. 28.11.2024)" },
									value: "d",
								},
								{
									name: "Long date (e.g. November 28, 2024)",
									name_localizations: { de: "Langes Datum (bspw. 28. November 2024)" },
									value: "D",
								},
								{
									name: "Short date and short time (e.g. November 28, 2024 9:01 AM)",
									name_localizations: { de: "Kurzes Datum und kurze Zeit (bspw. 28. November 2024 09:01)" },
									value: "f",
								},
								{
									name: "Long date and long time (e.g. Thursday, November 28, 2024 9:01 AM)",
									name_localizations: { de: "Langes Datum und lange Zeit (bspw. Donnerstag, 28. November 2024 09:01)" },
									value: "F",
								},
								{
									name: "Relative time (e.g. 3 years ago)",
									name_localizations: { de: "Relative Zeit (bspw. vor 3 Jahren)" },
									value: "R",
								},
							),
					),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
		await this.createTimestamp(interaction.options.getString("date"), interaction.options.getString("format"));
	}

	private async createTimestamp(date: string, type: string): Promise<any> {
		const unix: number | null = this.parseGermanDateTime(date);
		if (!unix) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:dateIsInvalid"),
				"error",
				"normal",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
		const timestamp: string = "<t:" + unix + ":" + type + ">";
		const rawTimestamp: string = "`<t:" + unix + ":" + type + ">`";
		const timestampEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("timestampGenerated", { e: this.client.emotes, timestamp, rawTimestamp}),
			"success",
			"normal"
		);

		const custom_id: string = "timestamp_copy" + Date.now();
		const copyButton: ButtonBuilder = this.client.createButton(
			custom_id,
			this.translate("copyTimestamp"),
			"Secondary",
			"text",
		);
		const row: any = this.client.createMessageComponentsRow(copyButton);
		await this.interaction.followUp({
			embeds: [timestampEmbed],
			components: [row],
		});

		const filter: any = (i: any): boolean => i.customId === custom_id;
		const collector: any = this.interaction.channel!.createMessageComponentCollector({
			filter,
		});
		collector.on("collect", async (i: any): Promise<void> => {
			await i.deferUpdate();
			await i.followUp({ content: rawTimestamp, ephemeral: true });
		});
	}

	private parseGermanDateTime(inputString: string): number | null {
		let format: string = "";

		if (inputString.includes(":")) {
			if (inputString.includes(".")) {
				format = "DD.MM.YYYY HH:mm";
			} else {
				format = "HH:mm";
			}
		} else if (inputString.includes(".")) {
			format = "DD.MM.YYYY";
		}

		const parsedDate: moment.Moment = moment.tz(inputString, format, "Europe/Berlin");

		if (parsedDate.isValid()) {
			return parsedDate.unix();
		}

		return null;
	}
}
