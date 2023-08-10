import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder, ChannelType } from "discord.js";

export default class AimodCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "aimod",
			description: "Verwaltet die AI-gestützte Chatmoderation des Servers",
			localizedDescriptions: {
				"en-US": "Manages the AI-powered chat moderation of the guild",
				"en-GB": "Manages the AI-powered chat moderation of the guild"
			},
			memberPermissions: ["ManageGuild"],
			cooldown: 2 * 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("status")
							.setDescription("Aktiviert oder deaktiviert die AI-gestützte Chatmoderation")
							.setDescriptionLocalizations({
								"en-US": "Enables or disables AI-powered chat moderation",
								"en-GB": "Enables or disables AI-powered chat moderation"
							})
							.addStringOption((option: any) =>
								option
									.setName("status")
									.setDescription("Wähle einen Status")
									.setDescriptionLocalizations({
										"en-US": "Choose a status",
										"en-GB": "Choose a status"
									})
									.setRequired(true)
									.addChoices(
										{
											name: "an",
											name_localizations: {
												"en-US": "on",
												"en-GB": "on"
											},
											value: "on"
										},
										{
											name: "aus",
											name_localizations: {
												"en-US": "off",
												"en-GB": "off"
											},
											value: "off"
										}
									)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("exclude")
							.setDescription("Exkludiert einen Channel oder eine Rolle von der AI-gestützten Chatmoderation")
							.setDescriptionLocalizations({
								"en-US": "Excludes a channel or role from AI-powered chat moderation",
								"en-GB": "Excludes a channel or role from AI-powered chat moderation"
							})
							.addStringOption((option: any) =>
								option
									.setName("action")
									.setDescription("Wähle eine Aktion")
									.setDescriptionLocalizations({
										"en-US": "Choose an action",
										"en-GB": "Choose an action"
									})
									.setRequired(true)
									.addChoices(
										{
											name: "hinzufügen",
											name_localizations: {
												"en-US": "add",
												"en-GB": "add"
											},
											value: "add"
										},
										{
											name: "entfernen",
											name_localizations: {
												"en-US": "remove",
												"en-GB": "remove"
											},
											value: "remove"
										},
										{
											name: "liste",
											name_localizations: {
												"en-US": "list",
												"en-GB": "list"
											},
											value: "list"
										}
									)
							)
							.addRoleOption((option: any) =>
								option
									.setName("role")
									.setDescription("Wähle eine Rolle")
									.setDescriptionLocalizations({
										"en-US": "Choose a role",
										"en-GB": "Choose a role"
									})
									.setRequired(false)
							)
							.addChannelOption((option: any) =>
								option
									.setName("channel")
									.setDescription("Wähle einen Channel")
									.setDescriptionLocalizations({
										"en-US": "Choose a channel",
										"en-GB": "Choose a channel"
									})
									.setRequired(false)
									.addChannelTypes(
										ChannelType.GuildText,
										ChannelType.GuildAnnouncement,
										ChannelType.GuildForum,
										ChannelType.PublicThread
									)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("threshold")
							.setDescription("Wähle, ab welchem Wert gewarnt werden soll (0 = nicht unangemessen, 1 = sehr unangemessen)")
							.setDescriptionLocalizations({
								"en-US": "Choose from which value to warn (0 = not inappropriate, 1 = very inappropriate)",
								"en-GB": "Choose from which value to warn (0 = not inappropriate, 1 = very inappropriate)"
							})
							.addNumberOption((option: any) =>
								option
									.setName("threshold")
									.setDescription("Wähle einen Wert")
									.setDescriptionLocalizations({
										"en-US": "Choose a value",
										"en-GB": "Choose a value"
									})
									.setRequired(true)
									.setMinValue(0)
									.setMaxValue(1)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("channel")
							.setDescription("Wähle den Kanal, in dem die AI-gestützte Chatmoderation warnen soll")
							.setDescriptionLocalizations({
								"en-US": "Choose the channel where you want the AI-powered chat moderation to warn you",
								"en-GB": "Choose the channel where you want the AI-powered chat moderation to warn you"
							})
							.addChannelOption((option: any) =>
								option
									.setName("channel")
									.setDescription("Wähle einen Channel")
									.setDescriptionLocalizations({
										"en-US": "Choose a channel",
										"en-GB": "Choose a channel"
									})
									.setRequired(true)
									.addChannelTypes(
										ChannelType.GuildText,
										ChannelType.GuildAnnouncement,
										ChannelType.GuildForum,
										ChannelType.PublicThread
									)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand.setName("explain").setDescription("Erklärt die AI-gestützte Chatmoderation").setDescriptionLocalizations({
							"en-US": "Explains AI-powered chat moderation",
							"en-GB": "Explains AI-powered chat moderation"
						})
					)
			}
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;

		const subcommand: string = interaction.options.getSubcommand();

		if (!data.guild.settings.aiModeration) {
			data.guild.settings.aiModeration = {
				enabled: false,
				excludedChannels: [],
				excludedRoles: [],
				threshold: 0.6,
				alertChannel: null
			};
			data.guild.markModified("settings.aiModeration");
			await data.guild.save();
		}

		switch (subcommand) {
			case "status":
				await this.setStatus(interaction.options.getString("status"), data);
				break;
			case "exclude":
				await this.exclude(
					interaction.options.getString("action"),
					interaction.options.getChannel("channel"),
					interaction.options.getRole("role"),
					data
				);
				break;
			case "threshold":
				await this.setThreshold(interaction.options.getNumber("threshold"), data);
				break;
			case "channel":
				await this.setChannel(interaction.options.getChannel("channel"), data);
				break;
			case "explain":
				await this.explain();
		}
	}

	private async setStatus(status: string, data: any): Promise<void> {
		data.guild.settings.aiModeration.enabled = status === "on";
		data.guild.markModified("settings.aiModeration.status");
		await data.guild.save();

		const localeStatus: string = status === "on" ? this.translate("basics:enabled") : this.translate("basics:disabled");
		const embed: EmbedBuilder = this.client.createEmbed(
			this.translate("administration/aimod:status:set", { status: localeStatus }),
			"success",
			"normal"
		);
		return this.interaction.followUp({ embeds: [embed] });
	}

	private async exclude(action: string, channel: any, role: any, data: any): Promise<void> {
		if (action === "add") {
			if (!channel && !role) {
				const embed: EmbedBuilder = this.client.createEmbed(
					this.translate("administration/aimod:exclude:errors:missingChannelOrRole"),
					"error",
					"error"
				);
				return this.interaction.followUp({ embeds: [embed] });
			}
			if (channel) {
				if (data.guild.settings.aiModeration.excludedChannels.includes(channel.id)) {
					const embed: EmbedBuilder = this.client.createEmbed(
						this.translate("administration/aimod:exclude:errors:isAlreadyDisabledInChannel", { channel: channel.toString() }),
						"error",
						"error"
					);
					return this.interaction.followUp({ embeds: [embed] });
				}
				data.guild.settings.aiModeration.excludedChannels.push(channel.id);
				data.guild.markModified("settings.aiModeration.excludedChannels");
				await data.guild.save();

				const successEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("administration/aimod:exclude:disabledInChannel", { channel: channel.toString() }),
					"success",
					"success"
				);
				return this.interaction.followUp({ embeds: [successEmbed] });
			}
			if (role) {
				if (data.guild.settings.aiModeration.excludedRoles.includes(role.id)) {
					const embed: EmbedBuilder = this.client.createEmbed(
						this.translate("administration/aimod:exclude:errors:isAlreadyDisabledForRole", { role: role.toString() }),
						"error",
						"error"
					);
					return this.interaction.followUp({ embeds: [embed] });
				}
				data.guild.settings.aiModeration.excludedRoles.push(role.id);
				data.guild.markModified("settings.aiModeration.excludedRoles");
				await data.guild.save();

				const successEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("administration/aimod:exclude:disabledForRole", { role: role.toString() }),
					"success",
					"success",
					role.toString()
				);
				return this.interaction.followUp({ embeds: [successEmbed] });
			}
		}

		if (action === "remove") {
			if (!channel && !role) {
				const embed: EmbedBuilder = this.client.createEmbed(
					this.translate("administration/aimod:exclude:errors:missingChannelOrRole"),
					"error",
					"error"
				);
				return this.interaction.followUp({ embeds: [embed] });
			}
			if (channel) {
				if (!data.guild.settings.aiModeration.excludedChannels.includes(channel.id)) {
					const embed: EmbedBuilder = this.client.createEmbed(
						this.translate("administration/aimod:exclude:errors:isNotDisabledInChannel", { channel: channel.toString() }),
						"error",
						"error"
					);
					return this.interaction.followUp({ embeds: [embed] });
				}
				data.guild.settings.aiModeration.excludedChannels = data.guild.settings.aiModeration.excludedChannels.filter(
					(id: string): boolean => id !== channel.id
				);
				data.guild.markModified("settings.aiModeration.excludedChannels");
				await data.guild.save();

				const successEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("administration/aimod:exclude:enabledInChannel", { channel: channel.toString() }),
					"success",
					"success"
				);
				return this.interaction.followUp({ embeds: [successEmbed] });
			}
			if (role) {
				if (!data.guild.settings.aiModeration.excludedRoles.includes(role.id)) {
					const embed: EmbedBuilder = this.client.createEmbed(
						this.translate("administration/aimod:exclude:errors:isNotDisabledForRole", { role: role.toString() }),
						"error",
						"error"
					);
					return this.interaction.followUp({ embeds: [embed] });
				}
				data.guild.settings.aiModeration.excludedRoles = data.guild.settings.aiModeration.excludedRoles.filter(
					(id: string): boolean => id !== role.id
				);
				data.guild.markModified("settings.aiModeration.excludedRoles");
				await data.guild.save();

				const successEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("administration/aimod:exclude:enabledForRole", { role: role.toString() }),
					"success",
					"success"
				);
				return this.interaction.followUp({ embeds: [successEmbed] });
			}
		}

		if (action === "list") {
			const excludedChannelsAndRoles: string[] = [];

			for (const channelID of data.guild.settings.aiModeration.excludedChannels) {
				const channel: any = await this.interaction.guild.channels.cache.get(channelID);
				if (channel) excludedChannelsAndRoles.push(this.client.emotes.channel + " " + channel.toString());
			}

			for (const roleID of data.guild.settings.aiModeration.excludedRoles) {
				const role: any = await this.interaction.guild.roles.cache.get(roleID);
				if (role) excludedChannelsAndRoles.push(this.client.emotes.ping + " " + role.toString());
			}

			await this.client.utils.sendPaginatedEmbed(
				this.interaction,
				10,
				excludedChannelsAndRoles,
				this.translate("administration/aimod:exclude:list:title"),
				this.translate("administration/aimod:exclude:list:empty"),
				""
			);
		}
	}

	private async setThreshold(number: any, data: any): Promise<void> {
		data.guild.settings.aiModeration.threshold = number;
		data.guild.markModified("settings.aiModeration.threshold");
		await data.guild.save();

		const embed: EmbedBuilder = this.client.createEmbed(
			this.translate("administration/aimod:threshold:set", { threshold: number }),
			"success",
			"success",
			number
		);
		return this.interaction.followUp({ embeds: [embed] });
	}

	private async setChannel(channel: any, data: any): Promise<void> {
		data.guild.settings.aiModeration.alertChannel = channel.id;
		data.guild.markModified("settings.aiModeration.alertChannel");
		await data.guild.save();

		const embed: EmbedBuilder = this.client.createEmbed(
			this.translate("administration/aimod:channel:set", { channel: channel.toString() }),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [embed] });
	}

	private async explain(): Promise<void> {
		const explainText: string = this.translate("administration/aimod:explain:text", {
			e: this.client.emotes,
			clientname: this.client.user!.username
		}).join("\n");

		const embed: EmbedBuilder = this.client.createEmbed(explainText, null, "normal");
		embed.setTitle(this.client.emotes.flags.CertifiedModerator + " " + this.translate("administration/aimod:explain:title"));
		return this.interaction.followUp({ embeds: [embed] });
	}
}
