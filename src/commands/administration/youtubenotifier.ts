import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";
import { google } from "googleapis";

export default class Youtubenotifier extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "youtubenotifier",
			description: "Verwaltet YouTube-Benachrichtigungen",
			cooldown: 1000,
			memberPermissions: ["ManageGuild"],
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option.setName("aktion").setDescription("Wähle aus den folgenden Aktionen").setRequired(true).addChoices(
							{
								name: "add",
								value: "add"
							},
							{
								name: "remove",
								value: "remove"
							},
							{
								name: "list",
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
						option.setName("youtubekanal").setDescription("Gib hier die ID des YouTube-Kanals an").setRequired(false)
					)
					.addStringOption((option: any) =>
						option.setName("status").setDescription("Wähle einen Status").setRequired(false).addChoices(
							{
								name: "an",
								value: "on"
							},
							{
								name: "aus",
								value: "off"
							}
						)
					)
					.addChannelOption((option: any) =>
						option
							.setName("channel")
							.setDescription("Wähle den Channel, in welchem neue Videos gesendet werden sollen")
							.setRequired(false)
							.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
					)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
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
		const action: string = interaction.options.getString("aktion");
		switch (action) {
			case "add":
				await this.addNotifier(interaction.options.getString("youtubekanal"), data);
				break;
			case "remove":
				await this.removeNotifier(interaction.options.getString("youtubekanal"), data);
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
			const errorEmbed: EmbedBuilder = this.client.createEmbed("Du musst eine YouTube-Kanal-ID angeben.", "error", "error");
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		const channel: any = await this.getChannelNameFromId(channelId);
		if (channel) {
			if (data.guild.settings.notifiers.youtube.channels.length > 3) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					"Es können maximal 3 Kanäle gleichzeitig überwacht werden.",
					"error",
					"error"
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			}

			if (data.guild.settings.notifiers.youtube.channels.find((channel: any): boolean => channel.id === channelId)) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed("Dieser Kanal wird bereits überwacht.", "error", "error");
				return this.interaction.followUp({ embeds: [errorEmbed] });
			}

			data.guild.settings.notifiers.youtube.channels.push({
				id: channelId,
				lastVideoId: channel.lastVideoId
			});
			data.guild.markModified("settings.notifiers.youtube.channels");
			await data.guild.save();

			const successEmbed: EmbedBuilder = this.client.createEmbed(
				"[{0}]({1}) wird ab jetzt überwacht.",
				"success",
				"success",
				channel.username,
				"https://youtube.com/channel/" + channelId
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed("Dieser Kanal konnte nicht gefunden werden.", "error", "error", channelId);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}

	private async removeNotifier(channelId: string, data: any): Promise<void> {
		if (!channelId) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed("Du musst eine YouTube-Kanal-ID angeben.", "error", "error");
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
				"[{0}]({1}) wird ab jetzt nicht mehr überwacht.",
				"success",
				"success",
				channel.username,
				"https://youtube.com/channel/" + channelId
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed("Dieser Kanal wird nicht überwacht.", "error", "error");
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
			"Überwachte Youtube-Kanäle",
			"Es werden derzeit keine Youtube-Kanäle überwacht",
			"link"
		);
	}

	private async setStatus(status: string, data: any): Promise<void> {
		if (!["on", "off"].includes(status)) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed("Du musst einen Status wählen.", "error", "error", status);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		const statusBool: boolean = status === "on";
		const statusString: string = statusBool ? "aktiviert" : "deaktiviert";
		if (data.guild.settings.notifiers.youtube.enabled === statusBool) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed("Der YouTube-Notifier ist bereits {0}.", "error", "error", statusString);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		data.guild.settings.notifiers.youtube.enabled = statusBool;
		data.guild.markModified("settings.notifiers.youtube.enabled");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed("Der YouTube-Notifier wurde erfolgreich {0}.", "success", "success", statusString);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setChannel(channel: any, data: any): Promise<void> {
		if (!channel) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed("Du musst einen Kanal auswählen.", "error", "error");
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (data.guild.settings.notifiers.youtube.announcementChannel === channel.id) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				"YouTube-Videos werden bereits in {0} gesendet.",
				"error",
				"error",
				channel.toString()
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		data.guild.settings.notifiers.youtube.announcementChannel = channel.id;
		data.guild.markModified("settings.notifiers.youtube.announcementChannel");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			"YouTube-Videos werden ab jetzt in {0} gesendet.",
			"success",
			"success",
			channel.toString()
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
