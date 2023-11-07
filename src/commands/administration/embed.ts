import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default class EmbedCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "embed",
			description: "Allows you to send a customized embed",
			localizedDescriptions: {
				de: "Ermöglicht das Senden eines angepassten Embeds"
			},
			memberPermissions: ["ManageGuild"],
			botPermissions: ["ManageWebhooks"],
			cooldown: 5 * 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName("author")
							.setNameLocalizations({
								de: "autor"
							})
							.setDescription("Enter the name of the author")
							.setDescriptionLocalizations({
								de: "Gib den Namen des Autors ein"
							})
							.setRequired(true)
					)
					.addAttachmentOption((option: any) =>
						option
							.setName("icon")
							.setDescription("Choose the avatar of the author")
							.setDescriptionLocalizations({
								de: "Wähle den Avatar des Autors"
							})
							.setRequired(false)
					)
					.addStringOption((option: any) =>
						option
							.setName("title")
							.setNameLocalizations({
								de: "titel"
							})
							.setDescription("Enter the title of the embed")
							.setDescriptionLocalizations({
								de: "Gib den Titel des Embeds ein"
							})
							.setRequired(false)
					)
					.addStringOption((option: any) =>
						option
							.setName("description")
							.setNameLocalizations({
								de: "beschreibung"
							})
							.setDescription("Enter the description of the embed")
							.setDescriptionLocalizations({
								de: "Gib die Beschreibung des Embeds ein"
							})
							.setRequired(false)
					)
					.addAttachmentOption((option: any) =>
						option
							.setName("thumbnail")
							.setDescription("Choose the thumbnail of the embed")
							.setDescriptionLocalizations({
								de: "Wähle das Thumbnail des Embeds"
							})
							.setRequired(false)
					)
					.addAttachmentOption((option: any) =>
						option
							.setName("image")
							.setNameLocalizations({
								de: "bild"
							})
							.setDescription("Choose the image of the embed")
							.setDescriptionLocalizations({
								de: "Wähle das Bild des Embeds"
							})
							.setRequired(false)
					)
					.addStringOption((option: any) =>
						option
							.setName("footertext")
							.setDescription("Enter the text of the footer")
							.setDescriptionLocalizations({
								de: "Gib den Text des Footers ein"
							})
							.setRequired(false)
					)
					.addAttachmentOption((option: any) =>
						option
							.setName("footericon")
							.setDescription("Choose the icon of the footer")
							.setDescriptionLocalizations({
								de: "Wähle das Icon des Footers"
							})
							.setRequired(false)
					)
					.addStringOption((option: any) =>
						option
							.setName("color")
							.setNameLocalizations({
								de: "farbe"
							})
							.setDescription("Enter the color of the embed in HEX format")
							.setDescriptionLocalizations({
								de: "Gib die Farbe des Embeds im HEX-Format ein"
							})
							.setRequired(false)
					)
			}
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.createEmbed();
	}

	private async createEmbed() {
		const author: string = this.interaction.options.getString("author");
		const authorIcon: any = this.interaction.options.getAttachment("icon");
		const title: string = this.interaction.options.getString("title");
		const description: string = this.interaction.options.getString("description");
		const thumbnail: any = this.interaction.options.getAttachment("thumbnail");
		const image: any = this.interaction.options.getAttachment("image");
		const footerText: string = this.interaction.options.getString("footertext");
		const footerIcon: any = this.interaction.options.getAttachment("footericon");
		const color: any =
			this.interaction.options.getString("color") ||
			this.client.config.embeds["DEFAULT_COLOR"];

		if (color && !this.client.utils.stringIsHexColor(color)) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:colorHasToBeHex"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (authorIcon && !authorIcon.contentType.startsWith("image/")) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:authorIconHasToBeImage"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (thumbnail && !thumbnail.contentType.startsWith("image/")) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:thumbnailHasToBeImage"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (image && !image.contentType.startsWith("image/")) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:imageHasToBeImage"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (footerIcon && !footerIcon.contentType.startsWith("image/")) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:footerIconHasToBeImage"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		// Generate embed
		const embed: EmbedBuilder = new EmbedBuilder()
			.setAuthor({
				name: author,
				iconURL: authorIcon ? authorIcon.proxyURL : null,
				url: this.client.config.general["WEBSITE"]
			})
			.setTitle(title)
			.setDescription(description)
			.setThumbnail(thumbnail ? thumbnail.proxyURL : null)
			.setImage(image ? image.proxyURL : null)
			.setFooter({
				text: footerText,
				iconURL: footerIcon ? footerIcon.proxyURL : null
			})
			.setColor(color);

		const webhook = await this.interaction.channel
			.createWebhook({
				name: author,
				avatar: authorIcon ? authorIcon.proxyURL : null
			})
			.catch((e: any): void => {});

		if (webhook) {
			webhook.send({ embeds: [embed] }).catch(() => {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate(
						"basics:errors:unexpected",
						{ support: this.client.support },
						true
					),
					"error",
					"error"
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			});
			webhook.delete().catch((e: any): void => {});
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("sent"),
				"success",
				"success"
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("basics:errors:unexpected", { support: this.client.support }, true),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}
}
