import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";
import { AppTokenAuthProvider } from "@twurple/auth";
import { ApiClient, HelixUser } from "@twurple/api";

export default class TwitchnotifierCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "twitchnotifier",
			description: "Manages Twitch notifications",
			localizedDescriptions: {
				de: "Verwaltet Twitch-Benachrichtigungen"
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
							.setName("twitchchannel")
							.setNameLocalizations({
								de: "twitchkanal"
							})
							.setDescription("Enter the username of the Twitch channel here")
							.setDescriptionLocalizations({
								de: "Gib hier den Nutzernamen des Twitch-Kanals an"
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
							.setDescription(
								"Select the channel in which you want to send new videos"
							)
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

		if (!data.guild.settings?.notifiers?.twitch) {
			data.guild.settings.notifiers = {
				...(data.guild.settings.notifiers || {}),
				twitch: {
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
				await this.addNotifier(interaction.options.getString("twitchchannel"), data);
				break;
			case "remove":
				await this.removeNotifier(interaction.options.getString("twitchchannel"), data);
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

	async addNotifier(channel: string, data: any): Promise<void> {
		const authProvider: AppTokenAuthProvider = new AppTokenAuthProvider(
			this.client.config.apikeys["TWITCH_CLIENT_ID"],
			this.client.config.apikeys["TWITCH_CLIENT_SECRET"]
		);
		const apiClient: ApiClient = new ApiClient({ authProvider });

		const user: HelixUser | null = await apiClient.users.getUserByName(channel);

		if (user) {
			if (data.guild.settings.notifiers.twitch.channels.length >= 3) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("errors:limitExceeded"),
					"error",
					"error"
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			}

			if (
				data.guild.settings.notifiers.twitch.channels.find(
					(addedUser: any): boolean => addedUser.id === user.id
				)
			) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("errors:alreadyAdded"),
					"error",
					"error"
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			}

			data.guild.settings.notifiers.twitch.channels.push({
				id: user.id,
				lastStreamId: null
			});
			data.guild.markModified("settings.notifiers.twitch.channels");
			await data.guild.save();

			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("added", { name: user.name, url: "https://twitch.tv/" + user.name }),
				"success",
				"success"
			);
			successEmbed.setThumbnail(user.profilePictureUrl);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:cantFindChannel"),
				"error",
				"error",
				channel
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}

	async removeNotifier(channel: string, data: any): Promise<void> {
		const authProvider: AppTokenAuthProvider = new AppTokenAuthProvider(
			this.client.config.apikeys["TWITCH_CLIENT_ID"],
			this.client.config.apikeys["TWITCH_CLIENT_SECRET"]
		);
		const apiClient: ApiClient = new ApiClient({ authProvider });

		const user: HelixUser | null = await apiClient.users.getUserByName(channel);

		if (!user || !channel) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:missingChannelName"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (
			data.guild.settings.notifiers.twitch.channels.find(
				(addedUser: any): boolean => addedUser.id === user.id
			)
		) {
			data.guild.settings.notifiers.twitch.channels =
				data.guild.settings.notifiers.twitch.channels.filter(
					(addedUser: any): boolean => addedUser.id !== user.id
				);
			data.guild.markModified("settings.notifiers.twitch.channels");
			await data.guild.save();

			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("removed", {
					name: user.name,
					url: "https://twitch.tv/" + user.name
				}),
				"success",
				"success"
			);
			successEmbed.setThumbnail(user.profilePictureUrl);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:notAdded"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}

	async listNotifiers(data: any): Promise<void> {
		const authProvider: AppTokenAuthProvider = new AppTokenAuthProvider(
			this.client.config.apikeys["TWITCH_CLIENT_ID"],
			this.client.config.apikeys["TWITCH_CLIENT_SECRET"]
		);
		const apiClient: ApiClient = new ApiClient({ authProvider });

		const channels: any[] = [];
		for (const channel of data.guild.settings.notifiers.twitch.channels) {
			const user: HelixUser | null = await apiClient.users.getUserById(channel.id);
			if (!user) continue;
			channels.push("[" + user.name + "](https://www.twitch.tv/" + user.name + ")");
		}

		this.client.utils.sendPaginatedEmbed(
			this.interaction,
			3,
			channels,
			this.translate("list:title"),
			this.translate("list:empty"),
			"link"
		);
	}

	async setStatus(status: string, data: any): Promise<void> {
		if (!["on", "off"].includes(status)) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:missingStatus"),
				"error",
				"error",
				status
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		const statusBool: boolean = status === "on";
		const statusString: string = statusBool
			? this.translate("basics:enabled")
			: this.translate("basics:disabled");
		if (data.guild.settings.notifiers.twitch.enabled === statusBool) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:statusAlready", { status: statusString }),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		data.guild.settings.notifiers.twitch.enabled = statusBool;
		data.guild.markModified("settings.notifiers.twitch.enabled");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("statusSet", { status: statusString }),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	async setChannel(channel: any, data: any): Promise<void> {
		if (!channel) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:missingChannel"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (data.guild.settings.notifiers.twitch.announcementChannel === channel.id) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:channelAlready", { channel: channel.toString() }),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		data.guild.settings.notifiers.twitch.announcementChannel = channel.id;
		data.guild.markModified("settings.notifiers.twitch.announcementChannel");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("channelSet", { channel: channel.toString() }),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}
}
