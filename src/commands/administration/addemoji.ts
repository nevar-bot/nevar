import BaseCommand from "@structures/BaseCommand";
import { EmbedBuilder, parseEmoji, SlashCommandBuilder } from "discord.js";
import Utils from "@helpers/Utils";
import BaseClient from "@structures/BaseClient";

export default class AddemojiCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "addemoji",
			description:
				"Erstellt einen neuen Emoji anhand eines gegebenen Emojis oder eines Links zu einem Bild",
			localizedDescriptions: {
				"en-GB":
					"Creates a new emoji based on a given emoji or a link to an image",
				"en-US":
					"Creates a new emoji based on a given emoji or a link to an image"
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
							.setDescription(
								"Gib einen Emoji oder einen Link zu einem Bild ein"
							)
							.setDescriptionLocalization(
								"en-US",
								"Enter an emoji or a link to an image"
							)
							.setDescriptionLocalization(
								"en-GB",
								"Enter an emoji or a link to an image"
							)
					)
					.addStringOption((option: any) =>
						option
							.setRequired(false)
							.setName("name")
							.setDescription(
								"Gib ein, wie der neue Emoji heißen soll"
							)
							.setDescriptionLocalization(
								"en-US",
								"Enter what you want the new emoji to be called"
							)
							.setDescriptionLocalization(
								"en-GB",
								"Enter what you want the new emoji to be called"
							)
							.setMaxLength(32)
					)
			}
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;

		await this.addEmoji(
			interaction.options.getString("emoji"),
			interaction.options.getString("name"),
			interaction.guild
		);
	}

	private async addEmoji(
		emoji: string,
		name: string,
		guild: any
	): Promise<void> {
		const emote: any = { name: undefined, url: undefined };
		const { stringIsCustomEmoji, stringIsUrl, urlIsImage } = Utils;

		/* No emoji or link given */
		if (!stringIsCustomEmoji(emoji) && !stringIsUrl(emoji)) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate(
					"administration/addemoji:errors:invalidEmojiOrLink"
				),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Given link is not an image */
		if (stringIsUrl(emoji) && !urlIsImage(emoji)) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate(
					"administration/addemoji:errors:invalidLinkExtension"
				),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Image link given but no name */
		if (stringIsUrl(emoji) && urlIsImage(emoji) && !name) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/addemoji:errors:missingName"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		if (stringIsCustomEmoji(emoji)) {
			const parsedEmoji: any = parseEmoji(emoji);
			emote.name = name || parsedEmoji.name;
			emote.url =
				"https://cdn.discordapp.com/emojis/" +
				parsedEmoji.id +
				(parsedEmoji.animated ? ".gif" : ".png");
		} else if (stringIsUrl(emoji) && urlIsImage(emoji)) {
			emote.name = name;
			emote.url = emoji;
		}

		try {
			const createdEmote = await guild.emojis.create({
				attachment: emote.url,
				name: emote.name,
				reason: "/addemoji Command"
			});
			/* Created emoji */
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/addemoji:created", {
					emoji: createdEmote.toString()
				}),
				"success",
				"success"
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} catch (exception) {
			/* Error while creating emoji */
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate(
					"administration/addemoji:errors:errorWhileCreating"
				),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}
}
