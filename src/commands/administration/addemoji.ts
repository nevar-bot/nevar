import BaseCommand from '@structures/BaseCommand';
import { EmbedBuilder, parseEmoji, SlashCommandBuilder } from 'discord.js';
import Utils from '@helpers/Utils';
import BaseClient from '@structures/BaseClient';

export default class AddemojiCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'addemoji',
			description:
				'administration/addemoji:general:description',
			memberPermissions: ['ManageGuildExpressions'],
			botPermissions: ['ManageGuildExpressions'],
			cooldown: 5 * 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setRequired(true)
							.setName("emoji")
							.setDescription(
								'administration/addemoji:slash_command:options:0:description'
							)
					)
					.addStringOption((option: any) =>
						option
							.setRequired(false)
							.setName("name")
							.setDescription(
								'administration/addemoji:slash_command:options:1:description'
							)
							.setMaxLength(32)
					)
			}
		});
	}

	private interaction: any;
	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;

		await this.addEmoji(
			interaction.options.getString('emoji'),
			interaction.options.getString('name'),
			interaction.guild,
			interaction.user
		);
	}

	private async addEmoji(
		emoji: string,
		name: string,
		guild: any,
		user: any
	): Promise<void> {
		const emote: any = { name: undefined, url: undefined };

		/* Invalid options */
		const { stringIsCustomEmoji, stringIsUrl, urlIsImage } = Utils;
		if (!stringIsCustomEmoji(emoji) && !stringIsUrl(emoji)) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				guild.translate("administration/addemoji:handling:errors:invalidEmojiOrLink"),
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}
		if (stringIsUrl(emoji) && !urlIsImage(emoji)) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				guild.translate("administration/addemoji:handling:errors:invalidLinkExtension"),
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}
		if (stringIsUrl(emoji) && urlIsImage(emoji) && !name) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				guild.translate("administration/addemoji:handling:errors:missingName"),
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		if (stringIsCustomEmoji(emoji)) {
			const parsedEmoji: any = parseEmoji(emoji);
			emote.name = name || parsedEmoji.name;
			emote.url =
				'https://cdn.discordapp.com/emojis/' +
				parsedEmoji.id +
				(parsedEmoji.animated ? '.gif' : '.png');
		} else if (stringIsUrl(emoji) && urlIsImage(emoji)) {
			emote.name = name;
			emote.url = emoji;
		}

		try {
			const createdEmote = await guild.emojis.create({
				attachment: emote.url,
				name: emote.name,
				reason: '/addemoji Command'
			});
			/* Successfully created emoji */
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				guild.translate("administration/addemoji:handling:created", { emoji: createdEmote }),
				'success',
				'success'
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} catch (exception) {
			/* Error while creating emoji */
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				guild.translate("administration/addemoji:handling:errors:errorWhileCreating"),
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}
}
