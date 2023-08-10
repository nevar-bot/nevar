import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Utils from "@helpers/Utils";
import * as nodeEmoji from "node-emoji";

export default class AddstickerCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "addsticker",
			description: "Creates a new sticker from a link to an image",
			localizedDescriptions: {
				"de": "Erstellt einen neuen Sticker anhand eines Links zu einem Bild"
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
							.setDescription("Enter a link to an image")
							.setDescriptionLocalizations({
								"de": "Gib einen Link zu einem Bild ein"
							})
							.setRequired(true)
					)
					.addStringOption((option: any) =>
						option
							.setName("name")
							.setDescription("Enter what you want the new sticker to be called")
							.setDescriptionLocalizations({
								"de": "Gib ein, wie der neue Sticker heißen soll"
							})
							.setRequired(true)
							.setMaxLength(32)
					)
					.addStringOption((option: any) =>
						option
							.setName("emoji")
							.setDescription("Enter a standard Discord emoji that represents the sticker")
							.setDescriptionLocalizations({
								"de": "Gib einen Standard-Discord-Emoji ein, welches den Sticker repräsentiert"
							})
							.setRequired(true)
					)
					.addStringOption((option: any) =>
						option
							.setName("description")
							.setDescription("Enter a short description for the sticker")
							.setDescriptionLocalizations({
								"de": "Gib eine kurze Beschreibung für den Sticker ein"
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
