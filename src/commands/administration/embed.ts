import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default class EmbedCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "embed",
			description: "Ermöglicht das Senden eines angepassten Embeds",
			localizedDescriptions: {
				"en-US": "Allows you to send a customized embed",
				"en-GB": "Allows you to send a customized embed"
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
							.setDescription("Gib den Namen des Autors ein")
							.setDescriptionLocalizations({
								"en-US": "Enter the name of the author",
								"en-GB": "Enter the name of the author"
							})
							.setRequired(true)
					)
					.addAttachmentOption((option: any) =>
						option
							.setName("icon")
							.setDescription("Wähle den Avatar des Autors")
							.setDescriptionLocalizations({
								"en-US": "Choose the avatar of the author",
								"en-GB": "Choose the avatar of the author"
							})
							.setRequired(false))
					.addStringOption((option: any) =>
						option
							.setName("title")
							.setDescription("Gib den Titel des Embeds ein")
							.setDescriptionLocalizations({
								"en-US": "Enter the title of the embed",
								"en-GB": "Enter the title of the embed"
							})
							.setRequired(false))
					.addStringOption((option: any) =>
						option
							.setName("description")
							.setDescription("Gib die Beschreibung des Embeds ein")
							.setDescriptionLocalizations({
								"en-US": "Enter the description of the embed",
								"en-GB": "Enter the description of the embed"
							})
							.setRequired(false)
					)
					.addAttachmentOption((option: any) =>
						option
							.setName("thumbnail")
							.setDescription("Wähle das Thumbnail des Embeds")
							.setDescriptionLocalizations({
								"en-US": "Choose the thumbnail of the embed",
								"en-GB": "Choose the thumbnail of the embed"
							})
							.setRequired(false)
					)
					.addAttachmentOption((option: any) =>
						option
							.setName("image")
							.setDescription("Wähle das Bild des Embeds")
							.setDescriptionLocalizations({
								"en-US": "Choose the image of the embed",
								"en-GB": "Choose the image of the embed"
							})
							.setRequired(false))
					.addStringOption((option: any) =>
						option
							.setName("footertext")
							.setDescription("Gib den Text des Footers ein")
							.setDescriptionLocalizations({
								"en-US": "Enter the text of the footer",
								"en-GB": "Enter the text of the footer"
							})
							.setRequired(false))
					.addAttachmentOption((option: any) =>
						option
							.setName("footericon")
							.setDescription("Wähle das Icon des Footers")
							.setDescriptionLocalizations({
								"en-US": "Choose the icon of the footer",
								"en-GB": "Choose the icon of the footer"
							})
							.setRequired(false)
					)
					.addStringOption((option: any) =>
						option
							.setName("color")
							.setDescription("Gib die Farbe des Embeds im HEX-Format ein")
							.setDescriptionLocalizations({
								"en-US": "Enter the color of the embed in HEX format",
								"en-GB": "Enter the color of the embed in HEX format"
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
		const color: any = this.interaction.options.getString("color") || this.client.config.embeds["DEFAULT_COLOR"];

		if (color && !this.client.utils.stringIsHexColor(color)) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/embed:errors:colorHasToBeHex"), "error", "error");
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (authorIcon && !authorIcon.contentType.startsWith("image/")) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/embed:errors:authorIconHasToBeImage"), "error", "error");
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (thumbnail && !thumbnail.contentType.startsWith("image/")) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/embed:errors:thumbnailHasToBeImage"), "error", "error");
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (image && !image.contentType.startsWith("image/")) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/embed:errors:imageHasToBeImage"), "error", "error");
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (footerIcon && !footerIcon.contentType.startsWith("image/")) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/embed:errors:footerIconHasToBeImage"), "error", "error");
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
			.catch((e: any): void => {console.log(e)});

		if (webhook) {
			webhook.send({ embeds: [embed] }).catch(() => {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("basics:errors:unexpected", { support: this.client.support }),
					"error",
					"error"
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			});
			webhook.delete().catch((e: any): void => {});
			const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/embed:sent"), "success", "success");
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(this.translate("basics:errors:unexpected", { support: this.client.support }), "error", "error");
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}
}