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
				'administration/addsticker:general:description',
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
							.setDescription('administration/addsticker:slash_command:options:0:description')
							.setRequired(true)
					)
					.addStringOption((option: any) =>
						option
							.setName('name')
							.setDescription(
								'administration/addsticker:slash_command:options:1:description'
							)
							.setRequired(true)
							.setMaxLength(32)
					)
					.addStringOption((option: any) =>
						option
							.setName('emoji')
							.setDescription(
								'administration/addsticker:slash_command:options:2:description'
							)
							.setRequired(true)
					)
					.addStringOption((option: any) =>
						option
							.setName('description')
							.setDescription(
								'administration/addsticker:slash_command:options:3:description'
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
			interaction.options.getString('description')
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
			reason: '/addsticker Command'
		};

		const { stringIsUrl, urlIsImage, stringIsEmoji } = Utils;
		if (
			!stringIsUrl(url) ||
			!urlIsImage(url) ||
			!stringIsEmoji(emoji) ||
			!nodeEmoji.find(emoji)
		) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.interaction.guild.translate("administration/addsticker:handling:errors:invalidEmojiOrLink"),
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
				this.interaction.guild.translate("administration/addsticker:handling:created", { sticker: name }),
				'success',
				'success'
			);
			successEmbed.setThumbnail(url);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} catch (e) {
			/* Error */
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.interaction.guild.translate("administration/addsticker:handling:errors:errorWhileCreating"),
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}
}
