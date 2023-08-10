import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Utils from "@helpers/Utils";
import * as nodeEmoji from "node-emoji";

export default class AddstickerCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "addsticker",
			description: "Erstellt einen neuen Sticker anhand eines Links zu einem Bild",
			localizedDescriptions: {
				"en-US": "Creates a new sticker from a link to an image",
				"en-GB": "Creates a new sticker from a link to an image"
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
							.setName("url")
							.setDescription("Gib einen Link zu einem Bild ein")
							.setDescriptionLocalizations({
								"en-US": "Enter a link to an image",
								"en-GB": "Enter a link to an image"
							})
							.setRequired(true)
					)
					.addStringOption((option: any) =>
						option
							.setName("name")
							.setDescription("Gib ein, wie der neue Sticker heißen soll")
							.setDescriptionLocalizations({
								"en-US": "Enter what you want the new sticker to be called",
								"en-GB": "Enter what you want the new sticker to be called"
							})
							.setRequired(true)
							.setMaxLength(32)
					)
					.addStringOption((option: any) =>
						option
							.setName("emoji")
							.setDescription("Gib einen Standard-Discord-Emoji ein, welches den Sticker repräsentiert")
							.setDescriptionLocalizations({
								"en-US": "Enter a standard Discord emoji that represents the sticker",
								"en-GB": "Enter a standard Discord emoji that represents the sticker"
							})
							.setRequired(true)
					)
					.addStringOption((option: any) =>
						option
							.setName("description")
							.setDescription("Gib eine kurze Beschreibung für den Sticker ein")
							.setDescriptionLocalizations({
								"en-US": "Enter a short description for the sticker",
								"en-GB": "Enter a short description for the sticker"
							})
							.setRequired(false)
							.setMaxLength(100)
					)
			}
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;

		await this.addSticker(
			interaction.options.getString("url"),
			interaction.options.getString("name"),
			interaction.options.getString("emoji"),
			interaction.options.getString("description")
		);
	}

	private async addSticker(url: string, name: string, emoji: string, description: string): Promise<void> {
		const sticker: any = {
			file: undefined,
			name: undefined,
			tags: undefined,
			description: undefined,
			reason: "/addsticker Command"
		};
		const { stringIsUrl, urlIsImage, stringIsEmoji } = Utils;

		/* No emoji or link given */
		if (!stringIsUrl(url) || !urlIsImage(url) || !stringIsEmoji(emoji) || !nodeEmoji.find(emoji)) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/addsticker:errors:invalidEmojiOrLink"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		sticker.file = url;
		sticker.name = name;
		sticker.tags = nodeEmoji.find(emoji)!.key;
		sticker.description = description;

		try {
			await this.interaction.guild.stickers.create(sticker);
			/* Created sticker */
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/addsticker:created", {
					sticker: name
				}),
				"success",
				"success"
			);
			successEmbed.setThumbnail(url);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} catch (e) {
			/* Error while creating sticker */
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("basics:errors:unexpected", { support: this.client.support }),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}
}
