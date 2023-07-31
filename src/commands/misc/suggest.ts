/** @format */

import BaseCommand from '@structures/BaseCommand';
import BaseClient from '@structures/BaseClient';
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default class SuggestCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'suggest',
			description: 'Reicht eine Idee ein',
			cooldown: 2 * 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName('idee')
							.setDescription('Gib deine Idee ein')
							.setRequired(true)
					)
					.addAttachmentOption((option: any) =>
						option
							.setName('bild')
							.setDescription('Füge ggf. ein Bild hinzu')
							.setRequired(false)
					)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		await this.suggest(
			interaction.options.getString('idee'),
			interaction.options.getAttachment('bild'),
			data
		);
	}

	private async suggest(idea: string, image: any, data: any): Promise<any> {
		if (!data.guild.settings.suggestions.enabled) {
			const isNotEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				'Da das Ideen-System nicht aktiviert ist, können keine Ideen eingereicht werden.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [isNotEnabledEmbed] });
		}

		const channel: any = this.client.channels.cache.get(
			data.guild.settings.suggestions.channel
		);
		if (!channel) {
			const channelNotFoundEmbed: EmbedBuilder = this.client.createEmbed(
				'Der Ideen-Channel wurde nicht gefunden.',
				'error',
				'error'
			);
			return this.interaction.followUp({
				embeds: [channelNotFoundEmbed]
			});
		}

		if (image && !image.contentType.startsWith('image/')) {
			const notAnImageEmbed: EmbedBuilder = this.client.createEmbed(
				'Die angehängte Datei muss ein Bild sein.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [notAnImageEmbed] });
		}
		const url = image ? image.proxyURL : null;

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			'Deine Idee wurde eingereicht.',
			'success',
			'success'
		);
		await this.interaction.followUp({ embeds: [successEmbed] });
		return this.client.emit(
			'SuggestionSubmitted',
			this.interaction,
			data,
			this.interaction.guild,
			idea,
			url
		);
	}
}
