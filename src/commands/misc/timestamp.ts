/** @format */

import BaseCommand from '@structures/BaseCommand';
import BaseClient from '@structures/BaseClient';
import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder } from 'discord.js';
import moment from 'moment-timezone';

export default class TimestampCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'timestamp',
			description: 'Erstellt einen Discord-Timestamp aus einem Datum',
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName('datum')
							.setDescription(
								'Gib hier das Datum im deutschen Format an (Datum & Zeit, nur Datum oder nur Zeit)'
							)
							.setRequired(true)
					)
					.addStringOption((option: any) =>
						option
							.setName('format')
							.setDescription(
								'Wähle, wie der Timestamp angezeigt werden soll'
							)
							.setRequired(true)
							.addChoices(
								{
									name: 'Kurze Zeit (bspw. 17:30)',
									value: 't'
								},
								{
									name: 'Lange Zeit (bspw. 17:30:12)',
									value: 'T'
								},
								{
									name: 'Kurzes Datum (bspw. 01.01.2023)',
									value: 'd'
								},
								{
									name: 'Langes Datum (bspw. 01. Januar 2023)',
									value: 'D'
								},
								{
									name: 'Kurzes Datum und kurze Zeit (bspw. 01.01.2023 17:30)',
									value: 'f'
								},
								{
									name: 'Langes Datum und lange Zeit (bspw. 01. Januar 2023 17:30)',
									value: 'F'
								},
								{
									name: 'Relative Zeit (bspw. vor 5 Minuten)',
									value: 'R'
								}
							)
					)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		await this.createTimestamp(
			interaction.options.getString('datum'),
			interaction.options.getString('format')
		);
	}

	private async createTimestamp(date: string, type: string): Promise<void> {
		const unix: number | null = this.parseGermanDateTime(date);
		if (!unix) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				'Du hast kein gültiges Datum angegeben! Dieses muss aus einem Datum und einer Uhrzeit, nur einem Datum oder nur einer Uhrzeit bestehen.',
				'error',
				'normal'
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
		const timestamp: string = '<t:' + unix + ':' + type + '>';
		const rawTimestamp: string = '`<t:' + unix + ':' + type + '>`';
		const timestampEmbed: EmbedBuilder = this.client.createEmbed(
			'Hier ist dein generierter Zeitstempel:\n{0} {1}\n{2} {3}',
			'success',
			'normal',
			this.client.emotes.calendar,
			timestamp,
			this.client.emotes.text,
			rawTimestamp
		);

		const custom_id: string = 'timestamp_copy' + Date.now();
		const copyButton: ButtonBuilder = this.client.createButton(
			custom_id,
			'Zeitstempel kopieren',
			'Secondary',
			'text'
		);
		const row: any = this.client.createMessageComponentsRow(copyButton);
		await this.interaction.followUp({
			embeds: [timestampEmbed],
			components: [row]
		});

		const filter: any = (i: any): boolean => i.customId === custom_id;
		const collector: any =
			this.interaction.channel.createMessageComponentCollector({
				filter
			});
		collector.on('collect', async (i: any): Promise<void> => {
			await i.deferUpdate();
			await i.followUp({ content: rawTimestamp, ephemeral: true });
		});
	}

	private parseGermanDateTime(inputString: string): number | null {
		let format: string = '';

		if (inputString.includes(':')) {
			if (inputString.includes('.')) {
				format = 'DD.MM.YYYY HH:mm';
			} else {
				format = 'HH:mm';
			}
		} else if (inputString.includes('.')) {
			format = 'DD.MM.YYYY';
		}

		const parsedDate: moment.Moment = moment.tz(
			inputString,
			format,
			'Europe/Berlin'
		);

		if (parsedDate.isValid()) {
			return parsedDate.unix();
		}

		return null;
	}
}
