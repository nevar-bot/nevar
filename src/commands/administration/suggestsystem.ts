import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { ChannelType, SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default class SuggestsystemCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "suggestsystem",
			description: "Manages the server's idea system",
			localizedDescriptions: {
				de: "Verwaltet das Ideen-System des Servers"
			},
			memberPermissions: ["ManageGuild"],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName("action")
							.setNameLocalizations({
								de: "aktion"
							})
							.setDescription("Choose from the following actions")
							.setDescriptionLocalizations({
								de: "Wähle aus den folgenden Aktionen"
							})
							.setRequired(true)
							.addChoices(
								{
									name: "enable",
									name_localizations: {
										de: "aktivieren"
									},
									value: "enable"
								},
								{
									name: "disable",
									name_localizations: {
										de: "deaktivieren"
									},
									value: "disable"
								},
								{
									name: "channel",
									value: "channel"
								},
								{
									name: "reviewchannel",
									value: "reviewchannel"
								}
							)
					)
					.addChannelOption((option: any) =>
						option
							.setName("channel")
							.setDescription("Choose a channel")
							.setDescriptionLocalizations({
								de: "Wähle einen Channel"
							})
							.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
							.setRequired(false)
					)
			}
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;

		const action: string = interaction.options.getString("action");
		switch (action) {
			case "enable":
				await this.enable(data);
				break;
			case "disable":
				await this.disable(data);
				break;
			case "channel":
				await this.setChannel(interaction.options.getChannel("channel"), data);
				break;
			case "reviewchannel":
				await this.setReviewChannel(interaction.options.getChannel("channel"), data);
				break;
		}
	}

	private async enable(data: any): Promise<void> {
		if (data.guild.settings.suggestions.enabled) {
			const isAlreadyEnabled: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:alreadyEnabled"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [isAlreadyEnabled] });
		}
		data.guild.settings.suggestions.enabled = true;
		data.guild.markModified("settings.suggestions.enabled");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("enabled"),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async disable(data: any): Promise<void> {
		if (!data.guild.settings.suggestions.enabled) {
			const isAlreadyDisabled: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:alreadyDisabled"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [isAlreadyDisabled] });
		}
		data.guild.settings.suggestions.enabled = false;
		data.guild.markModified("settings.suggestions.enabled");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("disabled"),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setChannel(channel: any, data: any): Promise<void> {
		if (!channel) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("basics:errors:missingChannel", {}, true),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}
		data.guild.settings.suggestions.channel = channel.id;
		data.guild.markModified("settings.suggestions.channel");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("channelSet", { channel: channel.toString() }),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setReviewChannel(channel: any, data: any): Promise<void> {
		if (!channel) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("basics:errors:missingChannel", {}, true),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}
		data.guild.settings.suggestions.review_channel = channel.id;
		data.guild.markModified("settings.suggestions.review_channel");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("reviewChannelSet", { channel: channel.toString() }),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}
}
