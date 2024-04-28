import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import path from "path";

export default class EmbedCommand extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "embed",
			description: "Send your personalised embed",
			localizedDescriptions: {
				de: "Sende dein persönlich angepasstes Embed",
			},
			memberPermissions: ["ManageGuild"],
			botPermissions: ["ManageWebhooks"],
			cooldown: 5 * 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName("author")
							.setNameLocalization("de", "autor")
							.setDescription("Select the name of the embed author")
							.setDescriptionLocalization("de", "Wähle den Namen des Embed-Autors")
							.setRequired(true),
					)
					.addAttachmentOption((option: any) =>
						option
							.setName("icon")
							.setDescription("Choose the avatar of the embed author")
							.setDescriptionLocalization("de", "Wähle den Avatar des Embed-Autors")
							.setRequired(false),
					)
					.addStringOption((option: any) =>
						option
							.setName("title")
							.setNameLocalization("de", "titel")
							.setDescription("Enter the title of your embed")
							.setDescriptionLocalization("de", "Gib den Titel deines Embeds an")
							.setRequired(false),
					)
					.addStringOption((option: any) =>
						option
							.setName("description")
							.setNameLocalization("de", "beschreibung")
							.setDescription("Choose a description for your embed")
							.setDescriptionLocalization("de", "Wähle eine Beschreibung für dein Embed")
							.setRequired(false),
					)
					.addAttachmentOption((option: any) =>
						option
							.setName("thumbnail")
							.setDescription("Select the thumbnail image of your embed")
							.setDescriptionLocalization("de", "Wähle das Thumbnail-Bild deines Embeds")
							.setRequired(false),
					)
					.addAttachmentOption((option: any) =>
						option
							.setName("image")
							.setNameLocalization("de", "bild")
							.setDescription("Choose an image for your embed")
							.setDescriptionLocalization("de", "Wähle ein Bild für dein Embed")
							.setRequired(false),
					)
					.addStringOption((option: any) =>
						option
							.setName("footer")
							.setNameLocalization("de", "fußzeile")
							.setDescription("Enter the text of the footer of your embed")
							.setDescriptionLocalization("de", "Gib den Text der Fußzeile deines Embeds an")
							.setRequired(false),
					)
					.addAttachmentOption((option: any) =>
						option
							.setName("footericon")
							.setNameLocalization("de", "fußzeilenbild")
							.setDescription("Choose an image for the footer of your embed")
							.setDescriptionLocalization("de", "Wähle ein Bild für die Fußzeile deines Embeds")
							.setRequired(false),
					)
					.addStringOption((option: any) =>
						option
							.setName("color")
							.setNameLocalization("de", "farbe")
							.setDescription("Select the colour of your embed in hex format")
							.setDescriptionLocalization("de", "Wähle die Farbe deines Embeds im Hex-Format")
							.setRequired(false),
					),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
		await this.createEmbed();
	}

	private async createEmbed(): Promise<any> {
		const author: string = this.interaction.options.getString("author");
		const authorIcon: any = this.interaction.options.getAttachment("icon");
		const title: string = this.interaction.options.getString("title");
		const description: string = this.interaction.options.getString("description");
		const thumbnail: any = this.interaction.options.getAttachment("thumbnail");
		const image: any = this.interaction.options.getAttachment("image");
		const footerText: string = this.interaction.options.getString("footer");
		const footerIcon: any = this.interaction.options.getAttachment("footericon");
		const color: any = this.interaction.options.getString("color") || this.client.config.embeds["DEFAULT_COLOR"];

		if (color && !this.client.utils.stringIsHexColor(color)) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:colorIsNotHex"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (authorIcon && !authorIcon.contentType.startsWith("image/")) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:authorIconIsNoImage"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (thumbnail && !thumbnail.contentType.startsWith("image/")) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:thumbnailIsNoImage"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (image && !image.contentType.startsWith("image/")) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:imageIsNoImage"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (footerIcon && !footerIcon.contentType.startsWith("image/")) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:footerIconIsNoImage"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		/* Generate embed */
		const embed: EmbedBuilder = new EmbedBuilder()
			.setAuthor({
				name: author,
				iconURL: authorIcon ? authorIcon.proxyURL : null,
				url: this.client.config.general["WEBSITE"],
			})
			.setTitle(title)
			.setDescription(description)
			.setThumbnail(thumbnail ? thumbnail.proxyURL : null)
			.setImage(image ? image.proxyURL : null)
			.setFooter({
				text: footerText,
				iconURL: footerIcon ? footerIcon.proxyURL : null,
			})
			.setColor(color);

		const webhook = await this.interaction.channel!
			.createWebhook({
				name: author,
				avatar: authorIcon ? authorIcon.proxyURL : null,
			})
			.catch((e: any): void => {});

		if (webhook) {
			webhook.send({ embeds: [embed] })
				.catch((): any => {
					const errorEmbed: EmbedBuilder = this.client.createEmbed(
						this.getBasicTranslation("errors:unexpected", { support: this.client.support }),
						"error",
						"error",

					);
					return this.interaction.followUp({ embeds: [errorEmbed] });
				})
				.then((): any => {
					webhook.delete().catch((e: any): void => {});
					const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("embedCreatedAndSent"), "success", "success");
					return this.interaction.followUp({ embeds: [successEmbed] });
				});
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:unexpected", { support: this.client.support }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}
}
