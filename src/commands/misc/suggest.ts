import BaseCommand from "@structures/BaseCommand.js";
import BaseClient from "@structures/BaseClient.js";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import path from "path";

export default class SuggestCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "suggest",
			description: "Submit an idea",
			localizedDescriptions: {
				de: "Reiche eine Idee ein",
			},
			cooldown: 2 * 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName("idea")
							.setNameLocalization("de", "idee")
							.setDescription("Enter your idea")
							.setDescriptionLocalization("de", "Gib deine Idee ein")
							.setRequired(true),
					)
					.addAttachmentOption((option: any) =>
						option
							.setName("image")
							.setNameLocalization("de", "bild")
							.setDescription("Add an image if you want")
							.setDescriptionLocalization("de", "Wähle ggf. ein Bild aus")
							.setRequired(false),
					),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
		await this.suggest(interaction.options.getString("idea"), interaction.options.getAttachment("image"));
	}

	private async suggest(idea: string, image: any): Promise<any> {
		if (!this.data.guild.settings.suggestions.enabled) {
			const isNotEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:suggestionSystemIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [isNotEnabledEmbed] });
		}

		const channel: any = this.client.channels.cache.get(this.data.guild.settings.suggestions.channel);
		if (!channel) {
			const channelNotFoundEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:suggestionChannelNotFound"),
				"error",
				"error",
			);
			return this.interaction.followUp({
				embeds: [channelNotFoundEmbed],
			});
		}

		if (image && !image.contentType.startsWith("image/")) {
			const notAnImageEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:attachmentMustBeImage"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [notAnImageEmbed] });
		}
		const url = image ? image.proxyURL : null;

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("suggestionSubmitted"),
			"success",
			"success",
		);
		await this.interaction.followUp({ embeds: [successEmbed] });
		return this.client.emit("SuggestionSubmitted", this.interaction, this.data, this.interaction.guild, idea, url);
	}
}
