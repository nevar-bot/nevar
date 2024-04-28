import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";
import { google } from "googleapis";
import path from "path";

export default class Youtubenotifier extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "youtubenotifier",
			description: "Receive notifications when a YouTube channel publishes a new video",
			localizedDescriptions: {
				de: "Erhalte Benachrichtigungen, wenn ein YouTube Kanal ein neues Video veröffentlicht",
			},
			cooldown: 1000,
			memberPermissions: ["ManageGuild"],
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName("action")
							.setNameLocalization("de", "aktion")
							.setDescription("Select an action")
							.setDescriptionLocalization("de", "Wähle eine Aktion")
							.setRequired(true)
							.addChoices({
									name: "add",
									name_localizations: { de: "hinzufügen" },
									value: "add",
								},
								{
									name: "remove",
									name_localizations: { de: "entfernen" },
									value: "remove",
								},
								{
									name: "list",
									name_localizations: { de: "liste" },
									value: "list",
								},
								{
									name: "status",
									value: "status",
								},
								{
									name: "channel",
									value: "channel",
								},
							),
					)
					.addStringOption((option: any) =>
						option
							.setName("youtubechannel")
							.setNameLocalization("de", "youtubekanal")
							.setDescription("Enter the ID of the YouTube channel")
							.setDescriptionLocalization("de", "Gib die ID des YouTube-Kanals an")
							.setRequired(false),
					)
					.addStringOption((option: any) =>
						option
							.setName("status")
							.setDescription("Select a status")
							.setDescriptionLocalizations({
								de: "Wähle einen Status",
							})
							.setRequired(false)
							.addChoices({
									name: "on",
									name_localizations: { de: "an" },
									value: "on",
								},
								{
									name: "off",
									name_localizations: { de: "aus" },
									value: "off",
								},
							),
					)
					.addChannelOption((option: any) =>
						option
							.setName("channel")
							.setNameLocalization("de", "kanal")
							.setDescription("Select the channel in which the notifications are to be sent")
							.setDescriptionLocalization("de", "Wähle den Kanal, in welchem die Benachrichtigungen gesendet werden sollen")
							.setRequired(false)
							.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
					),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;

		if (!data.guild.settings?.notifiers?.youtube) {
			data.guild.settings.notifiers = {
				...(data.guild.settings.notifiers || {}),
				youtube: {
					enabled: false,
					channels: [],
					announcementChannel: null,
				},
			};
			data.guild.markModified("settings.notifiers");
			await data.guild.save();
		}
		const action: string = interaction.options.getString("action");
		switch (action) {
			case "add":
				await this.addNotifier(interaction.options.getString("youtubechannel"));
				break;
			case "remove":
				await this.removeNotifier(interaction.options.getString("youtubechannel"));
				break;
			case "list":
				await this.listNotifiers();
				break;
			case "status":
				await this.setStatus(interaction.options.getString("status"));
				break;
			case "channel":
				await this.setChannel(interaction.options.getChannel("channel"));
				break;
		}
	}

	private async addNotifier(channelId: string): Promise<any> {
		if (!channelId) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:channelIdIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		const channel: any = await this.getChannelNameFromId(channelId);
		if (channel) {
			if (this.data.guild.settings.notifiers.youtube.channels.length >= 5) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("errors:maximalMonitoringLimitReached"),
					"error",
					"error",
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			}

			if (
				this.data.guild.settings.notifiers.youtube.channels.find((channel: any): boolean => channel.id === channelId)
			) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("errors:youtubeChannelAlreadyAddedToMonitoring", { user: channel.username }),
					"error",
					"error",
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			}

			this.data.guild.settings.notifiers.youtube.channels.push({
				id: channelId,
				lastVideoId: channel.lastVideoId,
			});
			this.data.guild.markModified("settings.notifiers.youtube.channels");
			await this.data.guild.save();

			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("youtubeChannelAddedToMonitoring", {
					name: channel.username,
					url: "https://youtube.com/channel/" + channelId,
				}),
				"success",
				"success",
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:youtubeChannelCannotBeFound"),
				"error",
				"error",
				channelId,
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}

	private async removeNotifier(channelId: string): Promise<any> {
		if (!channelId) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:channelIdIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (this.data.guild.settings.notifiers.youtube.channels.find((channel: any): boolean => channel.id === channelId)) {
			this.data.guild.settings.notifiers.youtube.channels = this.data.guild.settings.notifiers.youtube.channels.filter(
				(channel: any): boolean => channel.id !== channelId,
			);
			this.data.guild.markModified("settings.notifiers.youtube.channels");
			await this.data.guild.save();

			const channel: any = await this.getChannelNameFromId(channelId);
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("youtubeChannelRemovedFromMonitoring", {
					name: channel.username,
					url: "https://youtube.com/channel/" + channelId,
				}),
				"success",
				"success",
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:youtubeChannelIsNotAddedToMonitoring"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}

	private async listNotifiers(): Promise<any> {
		const channels: any[] = [];
		for (const channel of this.data.guild.settings.notifiers.youtube.channels) {
			const channelData: any = await this.getChannelNameFromId(channel.id);
			channels.push(this.client.emotes.youtube + " [" + channelData.username + "](https://www.youtube.com/channel/" + channel.id + ")");
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			5,
			channels,
			this.translate("list:title"),
			this.translate("list:noYoutubeChannelsAddedToMonitoring"),
		);
	}

	private async setStatus(status: string): Promise<any> {
		if (!["on", "off"].includes(status)) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:statusIsMissing"),
				"error",
				"error",
				status,
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		const statusBool: boolean = status === "on";
		const statusString: string = statusBool
			? this.translate("errors:youtubeChannelMonitoringIsAlreadyEnabled")
			: this.translate("errors:youtubeChannelMonitoringIsAlreadyDisabled");
		if (this.data.guild.settings.notifiers.youtube.enabled === statusBool) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				statusString,
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		this.data.guild.settings.notifiers.youtube.enabled = statusBool;
		this.data.guild.markModified("settings.notifiers.youtube.enabled");
		await this.data.guild.save();

		const statusText: string = statusBool
			? this.translate("youtubeChannelMonitoringEnabled")
			: this.translate("youtubeChannelMonitoringDisabled");
		const successEmbed: EmbedBuilder = this.client.createEmbed(
			statusText,
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setChannel(channel: any): Promise<any> {
		if (!channel) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:channelIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (this.data.guild.settings.notifiers.youtube.announcementChannel === channel.id) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:youtubeChannelMonitoringChannelIsAlreadySet", { channel: channel.toString() }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		this.data.guild.settings.notifiers.youtube.announcementChannel = channel.id;
		this.data.guild.markModified("settings.notifiers.youtube.announcementChannel");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("youtubeChannelMonitoringChannelSet", { channel: channel.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async getChannelNameFromId(channelId: string): Promise<Object | null> {
		const youtube: any = google.youtube({
			version: "v3",
			auth: this.client.config.apikeys["GOOGLE"],
		});

		const response: any = await youtube.channels.list({
			part: "snippet",
			id: channelId,
		});

		const channel = response.data.items?.[0];

		if (channel) {
			const username: string = channel.snippet.title;

			const videos: any = await youtube.search.list({
				part: "id",
				channelId: channelId,
				maxResults: 1,
				order: "date",
			});

			const lastVideo: any = videos.data.items?.[0];
			const lastVideoId: any = lastVideo?.id.videoId || null;

			return { username, lastVideoId };
		} else {
			return null;
		}
	}
}
