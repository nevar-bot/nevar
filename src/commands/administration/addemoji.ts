import BaseCommand from "@structures/BaseCommand";
import { EmbedBuilder, parseEmoji, SlashCommandBuilder } from "discord.js";
import Utils from "@helpers/Utils";
const { stringIsCustomEmoji, stringIsUrl, urlIsImage } = Utils;
import BaseClient from "@structures/BaseClient";

export default class AddemojiCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "addemoji",
			description: "Create a new emoji based on an emoji or link",
			localizedDescriptions: {
				de: "Erstelle einen neuen Emoji anhand eines Emojis oder Links",
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
							.setNameLocalization("de", "emoji")
							.setDescription("Enter an existing emoji or a link to an image")
							.setDescriptionLocalization("de", "Gib einen bestehenden Emoji oder einen Link zu einem Bild an")
					)
					.addStringOption((option: any) =>
						option
							.setRequired(false)
							.setName("name")
							.setNameLocalization("de", "name")
							.setDescription("Choose a name for the new emoji")
							.setDescriptionLocalization("de", "Wähle einen Namen für den neuen Emoji")
							.setMaxLength(32),
					),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;

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
				this.translate("errors:emojiOrLinkIsInvalid"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Given link is not an image */
		if (stringIsUrl(emoji) && !urlIsImage(emoji)) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:linkExtensionIsInvalid"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Image link given but no name */
		if (stringIsUrl(emoji) && urlIsImage(emoji) && !name) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:emojiNameIsMissing"),
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
				this.translate("emojiCreated", {
					emoji: createdEmote.toString(),
				}),
				"success",
				"success",
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} catch (exception) {
			/* Error while creating emoji */
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:unexpected", { support: this.client.support }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}
}
