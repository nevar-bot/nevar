import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";
import { google } from "googleapis";

export default class Youtubenotifier extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "youtubenotifier",
			description: "Manages YouTube notifications",
			localizedDescriptions: {
				de: "Verwaltet YouTube-Benachrichtigungen"
			},
			cooldown: 1000,
			memberPermissions: ["ManageGuild"],
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName("action")
							.setDescription("Choose from the following actions")
							.setDescriptionLocalizations({
								de: "Wähle aus den folgenden Aktionen"
							})
							.setRequired(true)
							.addChoices(
								{
									name: "add",
									name_localizations: {
										de: "hinzufügen"
									},
									value: "add"
								},
								{
									name: "remove",
									name_localizations: {
										de: "entfernen"
									},
									value: "remove"
								},
								{
									name: "list",
									name_localizations: {
										de: "liste"
									},
									value: "list"
								},
								{
									name: "status",
									value: "status"
								},
								{
									name: "channel",
									value: "channel"
								}
							)
					)
					.addStringOption((option: any) =>
						option
							.setName("youtubechannel")
							.setDescription("Enter the ID of the YouTube channel here")
							.setDescriptionLocalizations({
								de: "Gib hier die ID des YouTube-Kanals an"
							})
							.setRequired(false)
					)
					.addStringOption((option: any) =>
						option
							.setName("status")
							.setDescription("Choose a status")
							.setDescriptionLocalizations({
								de: "Wähle einen Status"
							})
							.setRequired(false)
							.addChoices(
								{
									name: "on",
									name_localizations: {
										de: "an"
									},
									value: "on"
								},
								{
									name: "off",
									name_localizations: {
										de: "aus"
									},
									value: "off"
								}
							)
					)
					.addChannelOption((option: any) =>
						option
							.setName("channel")
							.setDescription("Select the channel in which you want to send new videos")
							.setDescriptionLocalizations({
								de: "Wähle den Channel, in welchem neue Videos gesendet werden sollen"
							})
							.setRequired(false)
							.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
					)
			}
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;

		if (!data.guild.settings?.notifiers?.youtube) {
			data.guild.settings.notifiers = {
				...(data.guild.settings.notifiers || {}),
				youtube: {
					enabled: false,
					channels: [],
					announcementChannel: null
				}
			};
			data.guild.markModified("settings.notifiers");
			await data.guild.save();
		}
		const action: string = interaction.options.getString("action");
		switch (action) {
			case "add":
				await this.addNotifier(interaction.options.getString("youtubechannel"), data);
				break;
			case "remove":
				await this.removeNotifier(interaction.options.getString("youtubechannel"), data);
				break;
			case "list":
				await this.listNotifiers(data);
				break;
			case "status":
				await this.setStatus(interaction.options.getString("status"), data);
				break;
			case "channel":
				await this.setChannel(interaction.options.getChannel("channel"), data);
				break;
		}
	}

	private async addNotifier(channelId: string, data: any): Promise<void> {
		if (!channelId) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/youtubenotifier:errors:missingChannelId"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		const channel: any = await this.getChannelNameFromId(channelId);
		if (channel) {
			if (data.guild.settings.notifiers.youtube.channels.length > 3) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("administration/youtubenotifier:errors:limitExceeded"),
					"error",
					"error"
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			}

			if (data.guild.settings.notifiers.youtube.channels.find((channel: any): boolean => channel.id === channelId)) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("administration/youtubenotifier:errors:alreadyAdded"),
					"error",
					"error"
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			}

			data.guild.settings.notifiers.youtube.channels.push({
				id: channelId,
				lastVideoId: channel.lastVideoId
			});
			data.guild.markModified("settings.notifiers.youtube.channels");
			await data.guild.save();

			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/youtubenotifier:added", { name: channel.username, url: "https://youtube.com/channel/" + channelId }),
				"success",
				"success"
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/youtubenotifier:errors:cantFindChannel"),
				"error",
				"error",
				channelId
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}

	private async removeNotifier(channelId: string, data: any): Promise<void> {
		if (!channelId) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/youtubenotifier:errors:missingChannelId"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (data.guild.settings.notifiers.youtube.channels.find((channel: any): boolean => channel.id === channelId)) {
			data.guild.settings.notifiers.youtube.channels = data.guild.settings.notifiers.youtube.channels.filter(
				(channel: any): boolean => channel.id !== channelId
			);
			data.guild.markModified("settings.notifiers.youtube.channels");
			await data.guild.save();

			const channel: any = await this.getChannelNameFromId(channelId);
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/youtubenotifier:removed", { name: channel.username, url: "https://youtube.com/channel/" + channelId }),
				"success",
				"success"
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/youtubenotifier:errors:notAdded"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}

	private async listNotifiers(data: any): Promise<void> {
		const channels: any[] = [];
		for (let channel of data.guild.settings.notifiers.youtube.channels) {
			const channelData: any = await this.getChannelNameFromId(channel.id);
			channels.push("[" + channelData.username + "](https://www.youtube.com/channel/" + channel.id + ")");
		}

		this.client.utils.sendPaginatedEmbed(
			this.interaction,
			3,
			channels,
			this.translate("administration/youtubenotifier:list:title"),
			this.translate("administration/youtubenotifier:list:empty"),
			"link"
		);
	}

	private async setStatus(status: string, data: any): Promise<void> {
		if (!["on", "off"].includes(status)) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/youtubenotifier:errors:missingStatus"),
				"error",
				"error",
				status
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		const statusBool: boolean = status === "on";
		const statusString: string = statusBool ? this.translate("basics:enabled") : this.translate("basics:disabled");
		if (data.guild.settings.notifiers.youtube.enabled === statusBool) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/youtubenotifier:errors:statusAlready", { status: statusString }),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		data.guild.settings.notifiers.youtube.enabled = statusBool;
		data.guild.markModified("settings.notifiers.youtube.enabled");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("administration/youtubenotifier:statusSet", { status: statusString }),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setChannel(channel: any, data: any): Promise<void> {
		if (!channel) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/youtubenotifier:errors:missingChannel"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (data.guild.settings.notifiers.youtube.announcementChannel === channel.id) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/youtubenotifier:errors:channelAlready", { channel: channel.toString() }),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		data.guild.settings.notifiers.youtube.announcementChannel = channel.id;
		data.guild.markModified("settings.notifiers.youtube.announcementChannel");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("administration/youtubenotifier:channelSet", { channel: channel.toString() }),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async getChannelNameFromId(channelId: string): Promise<Object | null> {
		const youtube: any = google.youtube({
			version: "v3",
			auth: this.client.config.apikeys["GOOGLE"]
		});

		const response: any = await youtube.channels.list({
			part: "snippet",
			id: channelId
		});

		const channel = response.data.items?.[0];

		if (channel) {
			const username: string = channel.snippet.title;

			const videos: any = await youtube.search.list({
				part: "id",
				channelId: channelId,
				maxResults: 1,
				order: "date"
			});

			const lastVideo: any = videos.data.items?.[0];
			const lastVideoId: any = lastVideo?.id.videoId || null;

			return { username, lastVideoId };
		} else {
			return null;
		}
	}
}
