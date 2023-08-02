import BaseCommand from '@structures/BaseCommand';
import BaseClient from '@structures/BaseClient';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import Utils from '@helpers/Utils';
import * as nodeEmoji from 'node-emoji';

export default class AddstickerCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'addsticker',
			description:
				'Erstellt einen neuen Sticker anhand eines Links zu einem Bild',
			memberPermissions: ['ManageGuildExpressions'],
			botPermissions: ['ManageGuildExpressions'],
			cooldown: 5 * 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName('url')
							.setDescription('Gib einen Link zu einem Bild ein')
							.setRequired(true)
					)
					.addStringOption((option: any) =>
						option
							.setName('name')
							.setDescription(
								'Gib ein, wie der neue Sticker heißen soll'
							)
							.setRequired(true)
							.setMaxLength(32)
					)
					.addStringOption((option: any) =>
						option
							.setName('emoji')
							.setDescription(
								'Gib einen Standard-Discord-Emoji ein, welches den Sticker repräsentiert'
							)
							.setRequired(true)
					)
					.addStringOption((option: any) =>
						option
							.setName('beschreibung')
							.setDescription(
								'Gib eine kurze Beschreibung für den Sticker ein'
							)
							.setRequired(false)
							.setMaxLength(100)
					)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		await this.addSticker(
			interaction.options.getString('url'),
			interaction.options.getString('name'),
			interaction.options.getString('emoji'),
			interaction.options.getString('beschreibung')
		);
	}

	private async addSticker(
		url: string,
		name: string,
		emoji: string,
		description: string
	): Promise<void> {
		const sticker: any = {
			file: undefined,
			name: undefined,
			tags: undefined,
			description: undefined,
			reason: '/addsticker Befehl'
		};

		const { stringIsUrl, urlIsImage, stringIsEmoji } = Utils;
		if (
			!stringIsUrl(url) ||
			!urlIsImage(url) ||
			!stringIsEmoji(emoji) ||
			!nodeEmoji.find(emoji)
		) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Du musst einen Link zu einem Bild und einen Standard-Emoji eingeben. Beachte zusätzlich, dass derzeit nicht alle Emojis unterstützt werden.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		sticker.file = url;
		sticker.name = name;
		sticker.tags = nodeEmoji.find(emoji)!.key;
		sticker.description = description;

		try {
			await this.interaction.guild.stickers.create(sticker);
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				'Der neue Sticker {0} wurde erstellt.',
				'success',
				'success',
				name
			);
			successEmbed.setThumbnail(url);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} catch (e) {
			/* Error */
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				'Beim Erstellen des Stickers ist ein unerwarteter Fehler aufgetreten.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}
}
