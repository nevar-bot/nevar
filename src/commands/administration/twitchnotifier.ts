import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";
import { AppTokenAuthProvider } from "@twurple/auth";
import { ApiClient, HelixUser } from "@twurple/api";
import path from "path";

export default class TwitchnotifierCommand extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "twitchnotifier",
			description: "Receive notifications when a Twitch channel goes live",
			localizedDescriptions: {
				de: "Erhalte Benachrichtigungen, wenn ein Twitch-Kanal live geht",
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
							.addChoices(
								{
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
							.setName("twitchchannel")
							.setNameLocalization("de", "twitchkanal")
							.setDescription("Enter the username of the Twitch channel")
							.setDescriptionLocalization("de", "Gib den Nutzernamen des Twitch-Kanals an")
							.setRequired(false),
					)
					.addStringOption((option: any) =>
						option
							.setName("status")
							.setDescription("Select a status")
							.setDescriptionLocalization("de", "Wähle eine Status")
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

		if (!data.guild.settings?.notifiers?.twitch) {
			data.guild.settings.notifiers = {
				...(data.guild.settings.notifiers || {}),
				twitch: {
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
				await this.addNotifier(interaction.options.getString("twitchchannel"));
				break;
			case "remove":
				await this.removeNotifier(interaction.options.getString("twitchchannel"));
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

	async addNotifier(channel: string): Promise<any> {
		const authProvider: AppTokenAuthProvider = new AppTokenAuthProvider(
			this.client.config.apikeys["TWITCH_CLIENT_ID"],
			this.client.config.apikeys["TWITCH_CLIENT_SECRET"],
		);
		const apiClient: ApiClient = new ApiClient({ authProvider });

		const user: HelixUser | null = await apiClient.users.getUserByName(channel);

		if (user) {
			if (this.data.guild.settings.notifiers.twitch.channels.length >= 5) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("errors:maximalMonitoringLimitReached"),
					"error",
					"error",
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			}

			if (
				this.data.guild.settings.notifiers.twitch.channels.find(
					(addedUser: any): boolean => addedUser.id === user.id,
				)
			) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("errors:twitchChannelAlreadyAddedToMonitoring", { user: user.name }),
					"error",
					"error",
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			}

			this.data.guild.settings.notifiers.twitch.channels.push({
				id: user.id,
				lastStreamId: null,
			});
			this.data.guild.markModified("settings.notifiers.twitch.channels");
			await this.data.guild.save();

			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("twitchChannelAddedToMonitoring", { name: user.name, url: "https://twitch.tv/" + user.name }),
				"success",
				"success",
			);
			successEmbed.setThumbnail(user.profilePictureUrl);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:twitchChannelCannotBeFound"),
				"error",
				"error",
				channel,
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}

	async removeNotifier(channel: string): Promise<any> {
		const authProvider: AppTokenAuthProvider = new AppTokenAuthProvider(
			this.client.config.apikeys["TWITCH_CLIENT_ID"],
			this.client.config.apikeys["TWITCH_CLIENT_SECRET"],
		);
		const apiClient: ApiClient = new ApiClient({ authProvider });

		const user: HelixUser | null = await apiClient.users.getUserByName(channel);

		if (!user || !channel) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:twitchChannelNameIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (this.data.guild.settings.notifiers.twitch.channels.find((addedUser: any): boolean => addedUser.id === user.id)) {
			this.data.guild.settings.notifiers.twitch.channels = this.data.guild.settings.notifiers.twitch.channels.filter(
				(addedUser: any): boolean => addedUser.id !== user.id,
			);
			this.data.guild.markModified("settings.notifiers.twitch.channels");
			await this.data.guild.save();

			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("twitchChannelRemovedFromMonitoring", {
					name: user.name,
					url: "https://twitch.tv/" + user.name,
				}),
				"success",
				"success",
			);
			successEmbed.setThumbnail(user.profilePictureUrl);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:twitchChannelIsNotAddedToMonitoring", { user: user.name }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}

	async listNotifiers(): Promise<any> {
		const authProvider: AppTokenAuthProvider = new AppTokenAuthProvider(
			this.client.config.apikeys["TWITCH_CLIENT_ID"],
			this.client.config.apikeys["TWITCH_CLIENT_SECRET"],
		);
		const apiClient: ApiClient = new ApiClient({ authProvider });

		const channels: any[] = [];
		for (const channel of this.data.guild.settings.notifiers.twitch.channels) {
			const user: HelixUser | null = await apiClient.users.getUserById(channel.id);
			if (!user) continue;
			channels.push(this.client.emotes.twitch + " [" + user.name + "](https://www.twitch.tv/" + user.name + ")");
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			5,
			channels,
			this.translate("list:title"),
			this.translate("list:noTwitchChannelsAddedToMonitoring"),
		);
	}

	async setStatus(status: string): Promise<any> {
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
			? this.translate("errors:twitchChannelMonitoringIsAlreadyEnabled")
			: this.translate("errors:twitchChannelMonitoringIsAlreadyDisabled");
		if (this.data.guild.settings.notifiers.twitch.enabled === statusBool) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				statusString,
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		this.data.guild.settings.notifiers.twitch.enabled = statusBool;
		this.data.guild.markModified("settings.notifiers.twitch.enabled");
		await this.data.guild.save();

		const statusText: string = statusBool
			? this.translate("twitchChannelMonitoringEnabled")
			: this.translate("twitchChannelMonitoringDisabled");

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			statusText,
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	async setChannel(channel: any): Promise<any> {
		if (!channel) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:channelIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (this.data.guild.settings.notifiers.twitch.announcementChannel === channel.id) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:twitchChannelMonitoringChannelIsAlreadySet", { channel: channel.toString() }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		this.data.guild.settings.notifiers.twitch.announcementChannel = channel.id;
		this.data.guild.markModified("settings.notifiers.twitch.announcementChannel");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("twitchChannelMonitoringChannelSet", { channel: channel.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}
}
