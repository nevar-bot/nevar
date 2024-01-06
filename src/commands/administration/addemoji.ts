import BaseCommand from "@structures/BaseCommand";
import { EmbedBuilder, parseEmoji, SlashCommandBuilder } from "discord.js";
import Utils from "@helpers/Utils";
const { stringIsCustomEmoji, stringIsUrl, urlIsImage } = Utils;
import BaseClient from "@structures/BaseClient";

export default class AddemojiCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "addemoji",
			description: "Creates a new emoji based on a given emoji or a link to an image",
			localizedDescriptions: {
				de: "Erstellt einen neuen Emoji anhand eines gegebenen Emojis oder eines Links zu einem Bild",
			},
			memberPermissions: ["ManageGuildExpressions"],
			botPermissions: ["ManageGuildExpressions"],
			cooldown: 5 * 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setRequired(true)
							.setName("emoji")
							.setDescription("Enter an emoji or a link to an image")
							.setDescriptionLocalizations({
								de: "Gib einen Emoji oder einen Link zu einem Bild ein",
							}),
					)
					.addStringOption((option: any) =>
						option
							.setRequired(false)
							.setName("name")
							.setDescription("Enter what you want the new emoji to be called")
							.setDescriptionLocalizations({
								de: "Gib ein, wie der neue Emoji heißen soll",
							})
							.setMaxLength(32),
					),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;

		await this.addEmoji(
			interaction.options.getString("emoji"),
			interaction.options.getString("name"),
			interaction.guild,
		);
	}

	private async addEmoji(emoji: string, name: string, guild: any): Promise<any> {
		const emote: any = { name: undefined, url: undefined };

		/* No emoji or link given */
		if (!stringIsCustomEmoji(emoji) && !stringIsUrl(emoji)) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:invalidEmojiOrLink"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Given link is not an image */
		if (stringIsUrl(emoji) && !urlIsImage(emoji)) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:invalidLinkExtension"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Image link given but no name */
		if (stringIsUrl(emoji) && urlIsImage(emoji) && !name) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:missingName"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		if (stringIsCustomEmoji(emoji)) {
			const parsedEmoji: any = parseEmoji(emoji);
			emote.name = name || parsedEmoji.name;
			emote.url =
				"https://cdn.discordapp.com/emojis/" + parsedEmoji.id + (parsedEmoji.animated ? ".gif" : ".png");
		} else if (stringIsUrl(emoji) && urlIsImage(emoji)) {
			emote.name = name;
			emote.url = emoji;
		}

		try {
			/* Create emoji */
			const createdEmote = await guild.emojis.create({
				attachment: emote.url,
				name: emote.name,
				reason: "/addemoji Command",
			});
			/* Created emoji */
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("created", {
					emoji: createdEmote.toString(),
				}),
				"success",
				"success",
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} catch (exception) {
			/* Error while creating emoji */
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("basics:errors:unexpected", { support: this.client.support }, true),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}
}
