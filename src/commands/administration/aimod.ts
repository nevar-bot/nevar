import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder, ChannelType } from "discord.js";

export default class AimodCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "aimod",
			description: "Manages the AI-powered chat moderation of the guild",
			localizedDescriptions: {
				de: "Verwaltet die AI-gestützte Chatmoderation des Servers"
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
							.setDescription("Enables or disables AI-powered chat moderation")
							.setDescriptionLocalizations({
								de: "Aktiviert oder deaktiviert die AI-gestützte Chatmoderation"
							})
							.addStringOption((option: any) =>
								option
									.setName("status")
									.setDescription("Choose a status")
									.setDescriptionLocalizations({
										de: "Wähle einen Status"
									})
									.setRequired(true)
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
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("exclude")
							.setNameLocalizations({
								de: "exkludieren"
							})
							.setDescription(
								"Excludes a channel or role from AI-powered chat moderation"
							)
							.setDescriptionLocalizations({
								de: "Exkludiert einen Channel oder eine Rolle von der AI-gestützten Chatmoderation"
							})
							.addStringOption((option: any) =>
								option
									.setName("action")
									.setNameLocalizations({
										de: "aktion"
									})
									.setDescription("Choose an action")
									.setDescriptionLocalizations({
										de: "Wähle eine Aktion"
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
										}
									)
							)
							.addRoleOption((option: any) =>
								option
									.setName("role")
									.setNameLocalizations({
										de: "rolle"
									})
									.setDescription("Choose a role")
									.setDescriptionLocalizations({
										de: "Wähle eine Rolle"
									})
									.setRequired(false)
							)
							.addChannelOption((option: any) =>
								option
									.setName("channel")
									.setDescription("Choose a channel")
									.setDescriptionLocalizations({
										de: "Wähle einen Channel"
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
							.setDescription(
								"Choose from which value to warn (0 = not inappropriate, 1 = very inappropriate)"
							)
							.setDescriptionLocalizations({
								de: "Wähle, ab welchem Wert gewarnt werden soll (0 = nicht unangemessen, 1 = sehr unangemessen)"
							})
							.addNumberOption((option: any) =>
								option
									.setName("threshold")
									.setDescription("Choose a value")
									.setDescriptionLocalizations({
										de: "Wähle einen Wert"
									})
									.setRequired(true)
									.setMinValue(0)
									.setMaxValue(1)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("channel")
							.setDescription(
								"Choose the channel where you want the AI-powered chat moderation to warn you"
							)
							.setDescriptionLocalizations({
								de: "Wähle den Kanal, in dem die AI-gestützte Chatmoderation warnen soll"
							})
							.addChannelOption((option: any) =>
								option
									.setName("channel")
									.setDescription("Choose a channel")
									.setDescriptionLocalizations({
										de: "Wähle einen Channel"
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
						subcommand
							.setName("explain")
							.setNameLocalizations({
								de: "erklärung"
							})
							.setDescription("Explains AI-powered chat moderation")
							.setDescriptionLocalizations({
								de: "Erklärt die AI-gestützte Chatmoderation"
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

		const localeStatus: string =
			status === "on"
				? this.translate("basics:enabled", {}, true)
				: this.translate("basics:disabled", {}, true);
		const embed: EmbedBuilder = this.client.createEmbed(
			this.translate("status:set", { status: localeStatus }),
			"success",
			"normal"
		);
		return this.interaction.followUp({ embeds: [embed] });
	}

	private async exclude(action: string, channel: any, role: any, data: any): Promise<void> {
		if (action === "add") {
			if (!channel && !role) {
				const embed: EmbedBuilder = this.client.createEmbed(
					this.translate("basics:errors:missingChannelOrRole", {}, true),
					"error",
					"error"
				);
				return this.interaction.followUp({ embeds: [embed] });
			}
			if (channel) {
				if (data.guild.settings.aiModeration.excludedChannels.includes(channel.id)) {
					const embed: EmbedBuilder = this.client.createEmbed(
						this.translate("exclude:errors:isAlreadyDisabledInChannel", {
							channel: channel.toString()
						}),
						"error",
						"error"
					);
					return this.interaction.followUp({ embeds: [embed] });
				}
				data.guild.settings.aiModeration.excludedChannels.push(channel.id);
				data.guild.markModified("settings.aiModeration.excludedChannels");
				await data.guild.save();

				const successEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("exclude:disabledInChannel", { channel: channel.toString() }),
					"success",
					"success"
				);
				return this.interaction.followUp({ embeds: [successEmbed] });
			}
			if (role) {
				if (data.guild.settings.aiModeration.excludedRoles.includes(role.id)) {
					const embed: EmbedBuilder = this.client.createEmbed(
						this.translate("errors:isAlreadyDisabledForRole", {
							role: role.toString()
						}),
						"error",
						"error"
					);
					return this.interaction.followUp({ embeds: [embed] });
				}
				data.guild.settings.aiModeration.excludedRoles.push(role.id);
				data.guild.markModified("settings.aiModeration.excludedRoles");
				await data.guild.save();

				const successEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("exclude:disabledForRole", { role: role.toString() }),
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
					this.translate("basics:errors:missingChannelOrRole", {}, true),
					"error",
					"error"
				);
				return this.interaction.followUp({ embeds: [embed] });
			}
			if (channel) {
				if (!data.guild.settings.aiModeration.excludedChannels.includes(channel.id)) {
					const embed: EmbedBuilder = this.client.createEmbed(
						this.translate("exclude:errors:isNotDisabledInChannel", {
							channel: channel.toString()
						}),
						"error",
						"error"
					);
					return this.interaction.followUp({ embeds: [embed] });
				}
				data.guild.settings.aiModeration.excludedChannels =
					data.guild.settings.aiModeration.excludedChannels.filter(
						(id: string): boolean => id !== channel.id
					);
				data.guild.markModified("settings.aiModeration.excludedChannels");
				await data.guild.save();

				const successEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("exclude:enabledInChannel", { channel: channel.toString() }),
					"success",
					"success"
				);
				return this.interaction.followUp({ embeds: [successEmbed] });
			}
			if (role) {
				if (!data.guild.settings.aiModeration.excludedRoles.includes(role.id)) {
					const embed: EmbedBuilder = this.client.createEmbed(
						this.translate("exclude:errors:isNotDisabledForRole", {
							role: role.toString()
						}),
						"error",
						"error"
					);
					return this.interaction.followUp({ embeds: [embed] });
				}
				data.guild.settings.aiModeration.excludedRoles =
					data.guild.settings.aiModeration.excludedRoles.filter(
						(id: string): boolean => id !== role.id
					);
				data.guild.markModified("settings.aiModeration.excludedRoles");
				await data.guild.save();

				const successEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("exclude:enabledForRole", { role: role.toString() }),
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
				if (channel)
					excludedChannelsAndRoles.push(
						this.client.emotes.channel + " " + channel.toString()
					);
			}

			for (const roleID of data.guild.settings.aiModeration.excludedRoles) {
				const role: any = await this.interaction.guild.roles.cache.get(roleID);
				if (role)
					excludedChannelsAndRoles.push(this.client.emotes.ping + " " + role.toString());
			}

			await this.client.utils.sendPaginatedEmbed(
				this.interaction,
				10,
				excludedChannelsAndRoles,
				this.translate("exclude:list:title"),
				this.translate("exclude:list:empty"),
				""
			);
		}
	}

	private async setThreshold(number: any, data: any): Promise<void> {
		data.guild.settings.aiModeration.threshold = number;
		data.guild.markModified("settings.aiModeration.threshold");
		await data.guild.save();

		const embed: EmbedBuilder = this.client.createEmbed(
			this.translate("threshold:set", { threshold: number }),
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
			this.translate("channel:set", { channel: channel.toString() }),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [embed] });
	}

	private async explain(): Promise<void> {
		const explainText: string = this.translate("explain:text", {
			e: this.client.emotes,
			clientname: this.client.user!.username
		}).join("\n");

		const embed: EmbedBuilder = this.client.createEmbed(explainText, null, "normal");
		embed.setTitle(
			this.client.emotes.flags.CertifiedModerator + " " + this.translate("explain:title")
		);
		return this.interaction.followUp({ embeds: [embed] });
	}
}
