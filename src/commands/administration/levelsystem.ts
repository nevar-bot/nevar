import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";

export default class LevelsystemCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "levelsystem",
			description: "Manages the server's level system",
			localizedDescriptions: {
				de: "Verwaltet das Levelsystem des Servers",
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
							.setDescription("Determines whether the level system is enabled or disabled")
							.setDescriptionLocalizations({
								de: "Legt fest, ob das Levelsystem aktiviert oder deaktiviert ist",
							})
							.addStringOption((option: any) =>
								option
									.setName("status")
									.setRequired(true)
									.setDescription("Choose a status")
									.setDescriptionLocalizations({
										de: "Wähle einen Status",
									})
									.addChoices(
										{
											name: "on",
											name_localizations: {
												de: "an",
											},
											value: "true",
										},
										{
											name: "off",
											name_localizations: {
												de: "aus",
											},
											value: "false",
										},
									),
							),
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("channel")
							.setDescription("Determines in which channel level-up messages are sent")
							.setDescriptionLocalizations({
								de: "Bestimmt in welchem Channel Level-Up Nachrichten gesendet werden",
							})
							.addChannelOption((option: any) =>
								option
									.setName("channel")
									.setDescription("Select a channel (if you want the current channel, leave empty)")
									.setDescriptionLocalizations({
										de: "Wähle einen Channel (wenn jeweils aktueller Channel gewünscht, leer lassen)",
									})
									.setRequired(false)
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
							),
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("message")
							.setNameLocalizations({
								de: "nachricht",
							})
							.setDescription("Sets the level up message")
							.setDescriptionLocalizations({
								de: "Setzt die Level-Up Nachricht",
							})
							.addStringOption((option: any) =>
								option
									.setName("message")
									.setNameLocalizations({
										de: "nachricht",
									})
									.setDescription("Set the message")
									.setDescriptionLocalizations({
										de: "Lege die Nachricht fest",
									})
									.setRequired(true),
							),
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("roles")
							.setNameLocalizations({
								de: "rollen",
							})
							.setDescription("Defines roles that are assigned when a certain level is reached")
							.setDescriptionLocalizations({
								de: "Legt Rollen fest, die bei Erreichen eines bestimmten Levels vergeben werden",
							})
							.addStringOption((option: any) =>
								option
									.setName("action")
									.setNameLocalizations({
										de: "aktion",
									})
									.setDescription("Choose an action")
									.setDescriptionLocalizations({
										de: "Wähle eine Aktion",
									})
									.setRequired(true)
									.addChoices(
										{
											name: "add",
											name_localizations: {
												de: "hinzufügen",
											},
											value: "add",
										},
										{
											name: "remove",
											name_localizations: {
												de: "entfernen",
											},
											value: "remove",
										},
										{
											name: "list",
											name_localizations: {
												de: "liste",
											},
											value: "list",
										},
									),
							)
							.addRoleOption((option: any) =>
								option
									.setName("role")
									.setNameLocalizations({
										de: "rolle",
									})
									.setDescription("Choose a role")
									.setDescriptionLocalizations({
										de: "Wähle eine Rolle",
									})
									.setRequired(false),
							)
							.addIntegerOption((option: any) =>
								option
									.setName("level")
									.setDescription("At what level the role is assigned")
									.setDescriptionLocalizations({
										de: "Bei welchem Level die Rolle vergeben wird",
									})
									.setRequired(false)
									.setMinValue(1)
									.setMaxValue(1000),
							),
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("doublexp")
							.setNameLocalizations({
								de: "doppelxp",
							})
							.setDescription("Determines which roles get double XP")
							.setDescriptionLocalizations({
								de: "Bestimmt, welche Rollen doppeltes XP bekommen",
							})
							.addStringOption((option: any) =>
								option
									.setName("action")
									.setNameLocalizations({
										de: "aktion",
									})
									.setDescription("Choose an action")
									.setDescriptionLocalizations({
										de: "Wähle eine Aktion",
									})
									.setRequired(true)
									.addChoices(
										{
											name: "add",
											name_localizations: {
												de: "hinzufügen",
											},
											value: "add",
										},
										{
											name: "remove",
											name_localizations: {
												de: "entfernen",
											},
											value: "remove",
										},
										{
											name: "list",
											name_localizations: {
												de: "liste",
											},
											value: "list",
										},
									),
							)
							.addRoleOption((option: any) =>
								option
									.setName("role")
									.setNameLocalizations({
										de: "rolle",
									})
									.setDescription("Choose a role")
									.setDescriptionLocalizations({
										de: "Wähle eine Rolle",
									})
									.setRequired(false),
							),
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("xp")
							.setDescription(
								"Define the minimum and maximum number of XP that can be assigned per message",
							)
							.setDescriptionLocalizations({
								de: "Definiere die minimale und maximale Anzahl an XP, die pro Nachricht vergeben werden können",
							})
							.addIntegerOption((option: any) =>
								option
									.setName("min")
									.setDescription("Choose the minimum number of XP")
									.setDescriptionLocalizations({
										de: "Wähle die minimale Anzahl an XP",
									})
									.setRequired(true)
									.setMinValue(1)
									.setMaxValue(500),
							)
							.addIntegerOption((option: any) =>
								option
									.setName("max")
									.setDescription("Choose the maximum number of XP")
									.setDescriptionLocalizations({
										de: "Wähle die maximale Anzahl an XP",
									})
									.setRequired(true)
									.setMinValue(1)
									.setMaxValue(500),
							),
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("variables")
							.setNameLocalizations({
								de: "variablen",
							})
							.setDescription("Lists all variables that can be used in the level-up message")
							.setDescriptionLocalizations({
								de: "Listet alle Variablen, die in der Level-Up Nachricht verwendet werden können",
							}),
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("test")
							.setDescription("Tests the level up message")
							.setDescriptionLocalizations({
								de: "Testet die Level-Up Nachricht",
							}),
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("exclude")
							.setNameLocalizations({
								de: "exkludieren",
							})
							.setDescription("Adds a channel or role to the blacklist")
							.setDescriptionLocalizations({
								de: "Fügt einen Channel oder eine Rolle zur Blacklist hinzu",
							})
							.addStringOption((option: any) =>
								option
									.setName("action")
									.setNameLocalizations({
										de: "aktion",
									})
									.setDescription("Choose an action")
									.setDescriptionLocalizations({
										de: "Wähle eine Aktion",
									})
									.setRequired(true)
									.addChoices(
										{
											name: "add",
											name_localizations: {
												de: "hinzufügen",
											},
											value: "add",
										},
										{
											name: "remove",
											name_localizations: {
												de: "entfernen",
											},
											value: "remove",
										},
										{
											name: "list",
											name_localizations: {
												de: "liste",
											},
											value: "list",
										},
									),
							)
							.addChannelOption((option: any) =>
								option
									.setName("channel")
									.setDescription("Choose a channel")
									.setDescriptionLocalizations({
										de: "Wähle einen Channel",
									})
									.setRequired(false)
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
							)
							.addRoleOption((option: any) =>
								option
									.setName("role")
									.setNameLocalizations({
										de: "rolle",
									})
									.setDescription("Choose a role")
									.setDescriptionLocalizations({
										de: "Wähle eine Rolle",
									})
									.setRequired(false),
							),
					),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;

		const subcommand = interaction.options.getSubcommand();

		switch (subcommand) {
			case "status":
				await this.setStatus(interaction.options.getString("status"), data);
				break;
			case "channel":
				await this.setChannel(interaction.options.getChannel("channel"), data);
				break;
			case "message":
				await this.setMessage(interaction.options.getString("message"), data);
				break;
			case "roles":
				const levelroleAction = interaction.options.getString("action");
				switch (levelroleAction) {
					case "add":
						await this.addRole(
							interaction.options.getRole("role"),
							interaction.options.getInteger("level"),
							data,
						);
						break;
					case "remove":
						await this.removeRole(interaction.options.getRole("role"), data);
						break;
					case "list":
						await this.listRoles(data);
						break;
				}
				break;
			case "doublexp":
				const doubleXpAction = interaction.options.getString("action");
				switch (doubleXpAction) {
					case "add":
						await this.addDoubleXp(interaction.options.getRole("role"), data);
						break;
					case "remove":
						await this.removeDoubleXp(interaction.options.getRole("role"), data);
						break;
					case "list":
						await this.listDoubleXp(data);
						break;
				}
				break;
			case "xp":
				await this.setXp(interaction.options.getInteger("min"), interaction.options.getInteger("max"), data);
				break;
			case "variables":
				await this.listVariables();
				break;
			case "test":
				await this.sendPreview(data);
				break;
			case "exclude":
				const excludeAction = interaction.options.getString("action");
				switch (excludeAction) {
					case "add":
						await this.addExclude(
							interaction.options.getChannel("channel"),
							interaction.options.getRole("role"),
							data,
						);
						break;
					case "remove":
						await this.removeExclude(
							interaction.options.getChannel("channel"),
							interaction.options.getRole("role"),
							data,
						);
						break;
					case "list":
						await this.listExcluded(data);
						break;
				}
		}
	}

	private async setStatus(status: any, data: any): Promise<void> {
		/* Status is already set */
		if (data.guild.settings.levels.enabled === JSON.parse(status)) {
			const text: string = JSON.parse(status)
				? this.translate("basics:enabled", {}, true)
				: this.translate("basics:disabled", {}, true);
			const infoEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("status:errors:alreadySet", { status: text }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [infoEmbed] });
		}

		/* Save to database */
		data.guild.settings.levels.enabled = JSON.parse(status);
		data.guild.markModified("settings.levels.enabled");
		await data.guild.save();
		const text: string = JSON.parse(status)
			? this.translate("basics:enabled", {}, true)
			: this.translate("basics:disabled", {}, true);
		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("status:set", { status: text }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setChannel(channel: any, data: any): Promise<void> {
		/* Levelsystem is disabled */
		if (!data.guild.settings.levels.enabled) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:disabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		/* Save to database */
		data.guild.settings.levels.channel = channel ? channel.id : null;
		data.guild.markModified("settings.levels.channel");
		await data.guild.save();

		const text: string = channel
			? this.translate("channel:selectedChannel", { channel: channel.toString() })
			: this.translate("channel:currentChannel");
		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("channel:set", { channel: text }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setMessage(message: string, data: any): Promise<void> {
		/* Levelsystem is disabled */
		if (!data.guild.settings.levels.enabled) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:disabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		/* Message is too long */
		if (message.length > 2000) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("message:errors:tooLong", { length: message.length }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		/* Save to database */
		data.guild.settings.levels.message = message;
		data.guild.markModified("settings.levels.message");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("message:set"), "success", "success");
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async addRole(role: any, level: any, data: any): Promise<void> {
		/* Levelsystem is disabled */
		if (!data.guild.settings.levels.enabled) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:disabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		/* Invalid options */
		if (!role || !role.id || !level) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("roles:errors:missingLevelOrRole"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Role is already added */
		if (data.guild.settings.levels.roles.find((r: any): boolean => r.role === role.id)) {
			const alreadyAddedEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("roles:errors:roleAlreadyAdded"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [alreadyAddedEmbed] });
		}

		/* Role is @everyone */
		if (role.id === this.interaction.guild.roles.everyone.id) {
			const everyoneEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("roles:errors:cantUseEveryone"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [everyoneEmbed] });
		}

		/* Role is managed */
		if (role.managed) {
			const roleIsManagedEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("roles:errors:cantUseManaged"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [roleIsManagedEmbed] });
		}

		/* Role is too high */
		if (this.interaction.guild.members.me.roles.highest.position <= role.position) {
			const roleIsTooHighEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("roles:errors:cantUseHigherRole", {
					role: role.toString(),
					botrole: this.interaction.guild.members.me.roles.highest.toString(),
				}),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [roleIsTooHighEmbed] });
		}

		/* Save to database */
		data.guild.settings.levels.roles.push({
			role: role.id,
			level: level,
		});
		data.guild.markModified("settings.levels.roles");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("roles:added", { role: role.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async removeRole(role: any, data: any): Promise<void> {
		/* Levelsystem is disabled */
		if (!data.guild.settings.levels.enabled) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:disabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		/* Invalid options */
		if (!role || !role.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("basics:errors:missingRole", {}, true),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Role is not a level role */
		if (!data.guild.settings.levels.roles.find((r: any): boolean => r.role === role.id)) {
			const isNoLevelroleEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("roles:errors:isNotAdded", { role: role.toString() }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [isNoLevelroleEmbed] });
		}

		/* Save to database */
		data.guild.settings.levels.roles = data.guild.settings.levels.roles.filter(
			(r: any): boolean => r.role !== role.id,
		);
		data.guild.markModified("settings.levels.roles");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("roles:removed", { role: role.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async listRoles(data: any): Promise<void> {
		const response: any = data.guild.settings.levels.roles;
		const levelroles: any[] = [];

		for (let i: number = 0; i < response.length; i++) {
			const cachedRole = this.interaction.guild!.roles.cache.get(response[i].role);
			if (cachedRole)
				levelroles.push(
					" " +
						this.translate("roles:list:role") +
						": " +
						cachedRole.toString() +
						"\n" +
						this.client.emotes.arrow +
						" " +
						this.translate("roles:list:level") +
						": " +
						response[i].level,
				);
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			5,
			levelroles,
			this.translate("roles:list:title"),
			this.translate("roles:list:empty"),
			"ping",
		);
	}

	private async addDoubleXp(role: any, data: any): Promise<void> {
		/* Levelsystem is disabled */
		if (!data.guild.settings.levels.enabled) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:disabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		/* Invalid options */
		if (!role || !role.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("basics:errors:missingRole", {}, true),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Role is already added */
		if (data.guild.settings.levels.doubleXP.includes(role.id)) {
			const alreadyAddedEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("doublexp:errors:alreadyAdded"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [alreadyAddedEmbed] });
		}

		/* Role is @everyone */
		if (role.id === this.interaction.guild.roles.everyone.id) {
			const everyoneEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("doublexp:errors:cantUseEveryone"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [everyoneEmbed] });
		}

		/* Role is managed */
		if (role.managed) {
			const roleIsManagedEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("doublexp:errors:cantUseManaged"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [roleIsManagedEmbed] });
		}

		/* Save to database */
		data.guild.settings.levels.doubleXP.push(role.id);
		data.guild.markModified("settings.levels.doubleXP");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("doublexp:added", { role: role.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async removeDoubleXp(role: any, data: any): Promise<void> {
		/* Levelsystem is disabled */
		if (!data.guild.settings.levels.enabled) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:disabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		/* Invalid options */
		if (!role || !role.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("basics:errors:missingRole", {}, true),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Role is not a double xp role */
		if (!data.guild.settings.levels.doubleXP.includes(role.id)) {
			const isNoDoubleXPRoleEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("doublexp:errors:notAdded", { role: role.toString() }),
				"error",
				"error",
				role,
			);
			return this.interaction.followUp({
				embeds: [isNoDoubleXPRoleEmbed],
			});
		}

		/* Save to database */
		data.guild.settings.levels.doubleXP = data.guild.settings.levels.doubleXP.filter(
			(r: any): boolean => r !== role.id,
		);
		data.guild.markModified("settings.levels.doubleXP");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("doublexp:removed", { role: role.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async listDoubleXp(data: any): Promise<void> {
		const response: any = data.guild.settings.levels.doubleXP;
		const doublexpRoles: any[] = [];

		for (let i: number = 0; i < response.length; i++) {
			const cachedRole: any = this.interaction.guild.roles.cache.get(response[i]);
			if (cachedRole) doublexpRoles.push(cachedRole.toString());
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			5,
			doublexpRoles,
			this.translate("doublexp:list:title"),
			this.translate("doublexp:list:empty"),
			"ping",
		);
	}

	private async setXp(min: number, max: number, data: any): Promise<void> {
		/* Levelsystem is disabled */
		if (!data.guild.settings.levels.enabled) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:disabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		/* Min is higher than max */
		if (min > max) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("xp:errors:minCantBeHigherThanMax"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		/* Save to database */
		data.guild.settings.levels.xp = {
			min: min,
			max: max,
		};
		data.guild.markModified("settings.levels.xp");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("xp:set", { min: min, max: max }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async listVariables(): Promise<void> {
		const variables: string[] = this.translate("variables:list");
		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			10,
			variables,
			this.translate("variables:title"),
			this.translate("variables:empty"),
			"shine",
		);
	}

	private async sendPreview(data: any): Promise<void> {
		/* Levelsystem is disabled */
		if (!data.guild.settings.levels.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:disabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		/* No message set */
		if (!data.guild.settings.levels.message) {
			const noMessageEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("preview:errors:noMessageSet"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [noMessageEmbed] });
		}

		const member = this.interaction.member;
		const self = this;
		function parseMessage(str: string): string {
			return str
				.replaceAll(/{level}/g, String(1))
				.replaceAll(/{user}/g, member)
				.replaceAll(/{user:username}/g, member.user.username)
				.replaceAll(/{user:displayname}/g, member.user.displayName)
				.replaceAll(/{user:id}/g, member.user.id)
				.replaceAll(/{server:name}/g, self.interaction.guild.name)
				.replaceAll(/{server:id}/g, self.interaction.guild.id)
				.replaceAll(/{server:membercount}/g, self.interaction.guild.memberCount);
		}

		const channel: any =
			this.client.channels.cache.get(data.guild.settings.levels.channel) || this.interaction.channel;
		const message: string = parseMessage(data.guild.settings.levels.message);

		try {
			await channel.send({ content: message });
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("preview:sent"),
				"success",
				"success",
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} catch (e) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("preview:errors:cantSend"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}

	private async addExclude(channel: any, role: any, data: any): Promise<void> {
		if (!data.guild.settings.levels.exclude) {
			data.guild.settings.levels.exclude = {
				channels: [],
				roles: [],
			};
			data.guild.markModified("settings.levels.exclude");
			await data.guild.save();
		}

		/* Levelsystem is disabled */
		if (!data.guild.settings.levels.enabled) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:disabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		const toExclude = channel || role;
		/* No channel or role set */
		if (!toExclude || (toExclude.constructor.name !== "TextChannel" && toExclude.constructor.name !== "Role")) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("basics:errors:missingChannelOrRole", {}, true),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (toExclude.constructor.name === "TextChannel") {
			/* Channel is already on the blacklist */
			if (data.guild.settings.levels.exclude.channels.includes(toExclude.id)) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("exclude:errors:alreadyAdded", { item: toExclude.toString() }),
					"error",
					"error",
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			}

			/* Save to database */
			data.guild.settings.levels.exclude.channels.push(toExclude.id);
			data.guild.markModified("settings.levels.exclude.channels");
			await data.guild.save();
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("exclude:added", { item: toExclude.toString() }),
				"success",
				"success",
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else if (toExclude.constructor.name === "Role") {
			/* Role is already on the blacklist */
			if (data.guild.settings.levels.exclude.roles.includes(toExclude.id)) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("exclude:errors:alreadyAdded", { item: toExclude.toString() }),
					"error",
					"error",
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			}

			/* Role is @everyone */
			if (toExclude.id === this.interaction.guild.roles.everyone.id) {
				const everyoneEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("exclude:errors:cantUseEveryone"),
					"error",
					"error",
				);
				return this.interaction.followUp({ embeds: [everyoneEmbed] });
			}

			/* Role is managed */
			if (toExclude.managed) {
				const roleIsManagedEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("exclude:errors:cantUseManaged"),
					"error",
					"error",
				);
				return this.interaction.followUp({
					embeds: [roleIsManagedEmbed],
				});
			}

			/* Save to database */
			data.guild.settings.levels.exclude.roles.push(toExclude.id);
			data.guild.markModified("settings.levels.exclude.roles");
			await data.guild.save();
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("exclude:added", { item: toExclude.toString() }),
				"success",
				"success",
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		}
	}

	private async removeExclude(channel: any, role: any, data: any): Promise<void> {
		if (!data.guild.settings.levels.exclude) {
			data.guild.settings.levels.exclude = {
				channels: [],
				roles: [],
			};
			data.guild.markModified("settings.levels.exclude");
			await data.guild.save();
		}

		/* Levelsystem is disabled */
		if (!data.guild.settings.levels.enabled) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:disabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		const toExclude = channel || role;
		/* No channel or role set */
		if (!toExclude || (toExclude.constructor.name !== "TextChannel" && toExclude.constructor.name !== "Role")) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("basics:errors:missingChannelOrRole", {}, true),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (toExclude.constructor.name === "TextChannel") {
			/* Channel is not on the blacklist */
			if (!data.guild.settings.levels.exclude.channels.includes(toExclude.id)) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("exclude:errors:notAdded", { item: toExclude.toString() }),
					"error",
					"error",
					toExclude,
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			}

			/* Save to database */
			data.guild.settings.levels.exclude.channels = data.guild.settings.levels.exclude.channels.filter(
				(c: any): boolean => c !== toExclude.id,
			);
			data.guild.markModified("settings.levels.exclude.channels");
			await data.guild.save();
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("exclude:removed", { item: toExclude.toString() }),
				"success",
				"success",
				toExclude,
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else if (toExclude.constructor.name === "Role") {
			/* Role is not on the blacklist */
			if (!data.guild.settings.levels.exclude.roles.includes(toExclude.id)) {
				const errorEmbed = this.client.createEmbed(
					this.translate("exclude:errors:notAdded", { item: toExclude.toString() }),
					"error",
					"error",
					toExclude,
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			}

			/* Save to database */
			data.guild.settings.levels.exclude.roles = data.guild.settings.levels.exclude.roles.filter(
				(r: any): boolean => r !== toExclude.id,
			);
			data.guild.markModified("settings.levels.exclude.roles");
			await data.guild.save();
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("exclude:removed", { item: toExclude.toString() }),
				"success",
				"success",
				toExclude,
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		}
	}

	private async listExcluded(data: any): Promise<void> {
		if (!data.guild.settings.levels.exclude) {
			data.guild.settings.levels.exclude = {
				channels: [],
				roles: [],
			};
			data.guild.markModified("settings.levels.exclude");
			await data.guild.save();
		}

		const response = data.guild.settings.levels.exclude;
		const excluded: any[] = [];

		for (let i: number = 0; i < response.roles.length; i++) {
			const cachedRole = this.interaction.guild.roles.cache.get(response.roles[i]);
			if (cachedRole) excluded.push(this.client.emotes.ping + " " + cachedRole.toString());
		}

		for (let i: number = 0; i < response.channels.length; i++) {
			const cachedChannel = this.interaction.guild.channels.cache.get(response.channels[i]);
			if (cachedChannel) excluded.push(this.client.emotes.channel + " " + cachedChannel.toString());
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			5,
			excluded,
			this.translate("exclude:list:title"),
			this.translate("exclude:list:empty"),
			null,
		);
	}
}
