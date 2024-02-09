import BaseCommand from "@structures/BaseCommand.js";
import BaseClient from "@structures/BaseClient.js";
import { ChannelType, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import path from "path";

export default class SuggestsystemCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "suggestsystem",
			description: "Give your users the opportunity to submit ideas",
			localizedDescriptions: {
				de: "Gib deinen Nutzern die Möglichkeit, Ideen einzureichen",
			},
			memberPermissions: ["ManageGuild"],
			cooldown: 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName("action")
							.setNameLocalization("de", "aktion")
							.setDescription("Choose from the following actions")
							.setDescriptionLocalization("de", "Wähle eine Aktion")
							.setRequired(true)
							.addChoices({
									name: "enable",
									name_localizations: { de: "aktivieren" },
									value: "enable",
								},
								{
									name: "disable",
									name_localizations: { de: "deaktivieren" },
									value: "disable",
								},
								{
									name: "channel",
									name_localizations: { de: "kanal" },
									value: "channel",
								},
								{
									name: "reviewchannel",
									name_localizations: { de: "bearbeitungskanal" },
									value: "reviewchannel",
								},
							),
					)
					.addChannelOption((option: any) =>
						option
							.setName("channel")
							.setNameLocalization("de", "kanal")
							.setDescription("Select one of the following channels")
							.setDescriptionLocalization("de", "Wähle einen der folgenden Kanäle")
							.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
							.setRequired(false),
					),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;

		const action: string = interaction.options.getString("action");
		switch (action) {
			case "enable":
				await this.enable();
				break;
			case "disable":
				await this.disable();
				break;
			case "channel":
				await this.setChannel(interaction.options.getChannel("channel"));
				break;
			case "reviewchannel":
				await this.setReviewChannel(interaction.options.getChannel("channel"));
				break;
		}
	}

	private async enable(): Promise<any> {
		if (this.data.guild.settings.suggestions.enabled) {
			const isAlreadyEnabled: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:suggestionSystemIsAlreadyEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [isAlreadyEnabled] });
		}
		this.data.guild.settings.suggestions.enabled = true;
		this.data.guild.markModified("settings.suggestions.enabled");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("suggestionSystemEnabled"), "success", "success");
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async disable(): Promise<any> {
		if (!this.data.guild.settings.suggestions.enabled) {
			const isAlreadyDisabled: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:suggestionSystemIsAlreadyDisabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [isAlreadyDisabled] });
		}
		this.data.guild.settings.suggestions.enabled = false;
		this.data.guild.markModified("settings.suggestions.enabled");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("suggestionSystemDisabled"), "success", "success");
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setChannel(channel: any): Promise<any> {
		if (!channel) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:channelIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}
		this.data.guild.settings.suggestions.channel = channel.id;
		this.data.guild.markModified("settings.suggestions.channel");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("suggestionInputChannelSet", { channel: channel.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setReviewChannel(channel: any): Promise<any> {
		if (!channel) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:channelIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}
		this.data.guild.settings.suggestions.review_channel = channel.id;
		this.data.guild.markModified("settings.suggestions.review_channel");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("suggestionReviewChannelSet", { channel: channel.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}
}
