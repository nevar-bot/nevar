import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default class SuggestCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "suggest",
			description: "Submit an idea",
			localizedDescriptions: {
				de: "Reiche eine Idee ein",
			},
			cooldown: 2 * 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName("idea")
							.setNameLocalizations({
								de: "idee"
							})
							.setDescription("Enter your idea")
							.setDescriptionLocalizations({
								de: "Gib deine Idee ein"
							})
							.setRequired(true),
					)
					.addAttachmentOption((option: any) =>
						option
							.setName("image")
							.setNameLocalizations({
								de: "bild"
							})
							.setDescription("Add an image if you want")
							.setDescriptionLocalizations({
								de: "Füge ggf. ein Bild hinzu"
							})
							.setRequired(false),
					),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.suggest(interaction.options.getString("idea"), interaction.options.getAttachment("image"), data);
	}

	private async suggest(idea: string, image: any, data: any): Promise<any> {
		if (!data.guild.settings.suggestions.enabled) {
			const isNotEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:notEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [isNotEnabledEmbed] });
		}

		const channel: any = this.client.channels.cache.get(data.guild.settings.suggestions.channel);
		if (!channel) {
			const channelNotFoundEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:channelNotFound"),
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
			this.translate("submitted"),
			"success",
			"success",
		);
		await this.interaction.followUp({ embeds: [successEmbed] });
		return this.client.emit("SuggestionSubmitted", this.interaction, data, this.interaction.guild, idea, url);
	}
}
