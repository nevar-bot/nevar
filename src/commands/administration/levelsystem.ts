import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";

export default class LevelsystemCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "levelsystem",
			description: "Manage the level system of your server",
			localizedDescriptions: {
				de: "Verwalte das Levelsystem deines Servers",
			},
			memberPermissions: ["ManageGuild"],
			cooldown: 2 * 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addSubcommand((subcommand: any) => subcommand
						.setName("status")
						.setDescription("Activate or deactivate the levelling system")
						.setDescriptionLocalization("de", "Aktiviere oder deaktiviere das Levelsystem")
						.addStringOption((option: any) => option
								.setName("status")
								.setRequired(true)
								.setDescription("Select a status")
								.setDescriptionLocalization("de", "Wähle einen Status")
									.addChoices({
											name: "on",
											name_localizations: { de: "an" },
											value: "true",
										},
										{
											name: "off",
											name_localizations: { de: "aus" },
											value: "false",
										},
									),
						),
					)
					.addSubcommand((subcommand: any) => subcommand
						.setName("channel")
						.setDescription("Set the channel for level-up messages")
						.setDescriptionLocalization("de", "Setze den Kanal für Level-Up Nachrichten")
						.addChannelOption((option: any) => option
								.setName("channel")
								.setDescription("Select a channel (if you want the current channel, leave empty)")
								.setDescriptionLocalization("de", "Wähle einen Kanal (leer lassen für aktuellen Kanal)")
								.setRequired(false)
								.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
						),
					)
					.addSubcommand((subcommand: any) => subcommand
						.setName("message")
						.setNameLocalization("de", "nachricht")
						.setDescription("Set the level-up message")
						.setDescriptionLocalization("de", "Setze die Level-Up Nachricht")
						.addStringOption((option: any) => option
							.setName("message")
							.setNameLocalization("de", "nachricht")
							.setDescription("Set the message")
							.setDescriptionLocalization("de", "Lege die Nachricht fest")
							.setRequired(true)
							.setMaxLength(2000)
						),
					)
					.addSubcommand((subcommand: any) => subcommand
						.setName("roles")
						.setNameLocalization("de", "rollen")
						.setDescription("Manage the level roles of your server")
						.setDescriptionLocalization("de", "Verwalte die Levelrollen deines Servers")
						.addStringOption((option: any) => option
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
								),
							)
							.addRoleOption((option: any) => option
								.setName("role")
								.setNameLocalization("de", "rolle")
								.setDescription("Choose one of the following roles")
								.setDescriptionLocalization("de", "Wähle eine der folgenden Rollen")
								.setRequired(false),
							)
							.addIntegerOption((option: any) => option
								.setName("level")
								.setDescription("At what level the role is assigned")
								.setDescriptionLocalization("de", "Wähle das Level, bei welchem die Rolle vergeben wird")
								.setRequired(false)
								.setMinValue(1)
								.setMaxValue(1000),
								),
					)
					.addSubcommand((subcommand: any) => subcommand
						.setName("doublexp")
						.setNameLocalization("de", "doppelxp")
						.setDescription("Manage roles that receive double XP")
						.setDescriptionLocalization("de", "Verwalte Rollen, die doppeltes XP erhalten")
						.addStringOption((option: any) => option
								.setName("action")
								.setNameLocalization("de", "aktion")
								.setDescription("Choose an action")
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
								),
							)
							.addRoleOption((option: any) => option
								.setName("role")
								.setNameLocalization("de", "rolle")
								.setDescription("Choose one of the following roles")
								.setDescriptionLocalization("de", "Wähle eine der folgenden Rollen")
								.setRequired(false),
							),
					)
					.addSubcommand((subcommand: any) => subcommand
						.setName("xp")
						.setDescription("Set the minimum and maximum number of XP per message")
						.setDescriptionLocalization("de", "Setze die minimale und maximale Anzahl an XP pro Nachricht")
						.addIntegerOption((option: any) => option
								.setName("min")
								.setDescription("Specify the minimum number of XP")
								.setDescriptionLocalization("de", "Gib die minimale Anzahl an XP an")
								.setRequired(true)
								.setMinValue(1)
								.setMaxValue(500),
						)
						.addIntegerOption((option: any) => option
								.setName("max")
								.setDescription("Specify the maximum number of XP")
								.setDescriptionLocalization("de", "Gib die maximale Anzahl an XP an")
								.setRequired(true)
								.setMinValue(1)
								.setMaxValue(500),
						),
					)
					.addSubcommand((subcommand: any) => subcommand
						.setName("variables")
						.setNameLocalization("de", "variablen")
						.setDescription("View the available variables for the level-up message")
						.setDescriptionLocalization("de", "Sieh die verfügbaren Variablen für die Level-Up Nachricht an")
					)
					.addSubcommand((subcommand: any) => subcommand
						.setName("test")
						.setDescription("Tests the level up message")
						.setDescriptionLocalization("de", "Teste die Level-Up Nachricht")
					)
					.addSubcommand((subcommand: any) => subcommand
						.setName("exclude")
						.setNameLocalization("de", "exkludieren")
						.setDescription("Excludes a channel or role from XP allocation")
						.setDescriptionLocalization("de", "Schließt einen Kanal oder eine Rolle von der XP Vergabe aus")
						.addStringOption((option: any) => option
								.setName("action")
								.setNameLocalization("de", "aktion")
								.setDescription("Choose an action")
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
								),
							)
							.addChannelOption((option: any) => option
								.setName("channel")
								.setDescription("Select one of the following channels")
								.setDescriptionLocalization("de", "Wähle einen der folgenden Kanäle")
								.setRequired(false)
								.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
							)
							.addRoleOption((option: any) => option
								.setName("role")
								.setNameLocalization("de", "rolle")
								.setDescription("Choose one of the following roles")
								.setDescriptionLocalization("de", "Wähle eine der folgenden Rollen")
								.setRequired(false),
							),
						),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;

		const subcommand = interaction.options.getSubcommand();

		switch (subcommand) {
			case "status":
				await this.setStatus(interaction.options.getString("status"));
				break;
			case "channel":
				await this.setChannel(interaction.options.getChannel("channel"));
				break;
			case "message":
				await this.setMessage(interaction.options.getString("message"));
				break;
			case "roles":
				const levelroleAction = interaction.options.getString("action");
				switch (levelroleAction) {
					case "add":
						await this.addRole(
							interaction.options.getRole("role"),
							interaction.options.getInteger("level")
						);
						break;
					case "remove":
						await this.removeRole(interaction.options.getRole("role"));
						break;
					case "list":
						await this.listRoles();
						break;
				}
				break;
			case "doublexp":
				const doubleXpAction = interaction.options.getString("action");
				switch (doubleXpAction) {
					case "add":
						await this.addDoubleXp(interaction.options.getRole("role"));
						break;
					case "remove":
						await this.removeDoubleXp(interaction.options.getRole("role"));
						break;
					case "list":
						await this.listDoubleXp();
						break;
				}
				break;
			case "xp":
				await this.setXp(interaction.options.getInteger("min"), interaction.options.getInteger("max"));
				break;
			case "variables":
				await this.listVariables();
				break;
			case "test":
				await this.testMessage();
				break;
			case "exclude":
				const excludeAction = interaction.options.getString("action");
				switch (excludeAction) {
					case "add":
						await this.addExclude(
							interaction.options.getChannel("channel"),
							interaction.options.getRole("role"),
						);
						break;
					case "remove":
						await this.removeExclude(
							interaction.options.getChannel("channel"),
							interaction.options.getRole("role"),
						);
						break;
					case "list":
						await this.listExcluded();
						break;
				}
		}
	}

	private async setStatus(status: any): Promise<any> {
		/* Status is already set */
		if (this.data.guild.settings.levels.enabled === JSON.parse(status)) {
			const text: string = JSON.parse(status)
				? this.translate("status:errors:levelsystemIsAlreadyEnabled")
				: this.translate("status:errors:levelsystemIsAlreadyDisabled");

			const infoEmbed: EmbedBuilder = this.client.createEmbed(text, "error", "error",);
			return this.interaction.followUp({ embeds: [infoEmbed] });
		}

		/* Save to database */
		this.data.guild.settings.levels.enabled = JSON.parse(status);
		this.data.guild.markModified("settings.levels.enabled");
		await this.data.guild.save();
		const text: string = JSON.parse(status)
			? this.translate("status:levelsystemEnabled")
			: this.translate("status:levelsystemDisabled");

		const successEmbed: EmbedBuilder = this.client.createEmbed(text, "success", "success");
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setChannel(channel: any): Promise<any> {
		/* Levelsystem is disabled */
		if (!this.data.guild.settings.levels.enabled) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:levelsystemIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		/* Save to database */
		this.data.guild.settings.levels.channel = channel ? channel.id : null;
		this.data.guild.markModified("settings.levels.channel");
		await this.data.guild.save();

		const text: string = channel
			? this.translate("channel:levelsystemChannelSet", { channel: channel.toString() })
			: this.translate("channel:levelsystemChannelSetToCurrent");

		const successEmbed: EmbedBuilder = this.client.createEmbed(text, "success", "success");
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setMessage(message: string): Promise<any> {
		/* Levelsystem is disabled */
		if (!this.data.guild.settings.levels.enabled) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:levelsystemIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		/* Save to database */
		this.data.guild.settings.levels.message = message;
		this.data.guild.markModified("settings.levels.message");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("message:levelupMessageSet"), "success", "success");
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async addRole(role: any, level: any): Promise<any> {
		/* Levelsystem is disabled */
		if (!this.data.guild.settings.levels.enabled) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:levelsystemIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		/* Invalid options */
		if (!role || !role.id || !level) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("roles:errors:levelOrRoleIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Role is already added */
		if (this.data.guild.settings.levels.roles.find((r: any): boolean => r.role === role.id)) {
			const alreadyAddedEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("roles:errors:roleIsAlreadyAdded", { role: role.toString() }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [alreadyAddedEmbed] });
		}

		/* Role is @everyone */
		if (role.id === this.interaction.guild!.roles.everyone.id) {
			const everyoneEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:dontUseEveryoneRole"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [everyoneEmbed] });
		}

		/* Role is managed */
		if (role.managed) {
			const roleIsManagedEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:dontUseManagedRole"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [roleIsManagedEmbed] });
		}

		/* Role is too high */
		if (this.interaction.guild!.members.me!.roles.highest.position <= role.position) {
			const roleIsTooHighEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:roleIsHigherThanBot", { role: this.interaction.guild!.members.me!.roles.highest.toString() }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [roleIsTooHighEmbed] });
		}

		/* Save to database */
		this.data.guild.settings.levels.roles.push({
			role: role.id,
			level: level,
		});
		this.data.guild.markModified("settings.levels.roles");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("roles:levelRoleAdded", { role: role.toString(), level: level.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async removeRole(role: any): Promise<any> {
		/* Levelsystem is disabled */
		if (!this.data.guild.settings.levels.enabled) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:levelsystemIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		/* Invalid options */
		if (!role || !role.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:roleIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Role is not a level role */
		if (!this.data.guild.settings.levels.roles.find((r: any): boolean => r.role === role.id)) {
			const isNoLevelroleEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("roles:errors:roleIsNotAdded", { role: role.toString() }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [isNoLevelroleEmbed] });
		}

		/* Save to database */
		this.data.guild.settings.levels.roles = this.data.guild.settings.levels.roles.filter(
			(r: any): boolean => r.role !== role.id,
		);
		this.data.guild.markModified("settings.levels.roles");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("roles:levelRoleRemoved", { role: role.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async listRoles(): Promise<any> {
		const response: any = this.data.guild.settings.levels.roles;
		const levelroles: any[] = [];

		for (const element of response) {
			const cachedRole: any = this.interaction.guild!.roles.cache.get(element.role);
			if (cachedRole)
				levelroles.push(
					this.client.emotes.ping + " **" +
					this.getBasicTranslation("role") +
					":** " +
					cachedRole.toString() +
					"\n" +
					this.client.emotes.rocket +
					" **" +
					this.getBasicTranslation("level") +
					":** " +
					element.level +
					"\n"
				);
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			5,
			levelroles,
			this.translate("roles:list:title"),
			this.translate("roles:list:noLevelrolesAdded"),
		);
	}

	private async addDoubleXp(role: any): Promise<any> {
		/* Levelsystem is disabled */
		if (!this.data.guild.settings.levels.enabled) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:levelsystemIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		/* Invalid options */
		if (!role || !role.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:roleIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Role is already added */
		if (this.data.guild.settings.levels.doubleXP.includes(role.id)) {
			const alreadyAddedEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("doublexp:errors:roleIsAlreadyAdded", { role: role.toString() }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [alreadyAddedEmbed] });
		}

		/* Role is @everyone */
		if (role.id === this.interaction.guild!.roles.everyone.id) {
			const everyoneEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:dontUseEveryoneRole"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [everyoneEmbed] });
		}

		/* Role is managed */
		if (role.managed) {
			const roleIsManagedEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:dontUseManagedRole"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [roleIsManagedEmbed] });
		}

		/* Save to database */
		this.data.guild.settings.levels.doubleXP.push(role.id);
		this.data.guild.markModified("settings.levels.doubleXP");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("doublexp:doublexpRoleAdded", { role: role.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async removeDoubleXp(role: any): Promise<any> {
		/* Levelsystem is disabled */
		if (!this.data.guild.settings.levels.enabled) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:levelsystemIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		/* Invalid options */
		if (!role || !role.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:roleIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Role is not a double xp role */
		if (!this.data.guild.settings.levels.doubleXP.includes(role.id)) {
			const isNoDoubleXPRoleEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("doublexp:errors:roleIsNotAdded", { role: role.toString() }),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [isNoDoubleXPRoleEmbed] });
		}

		/* Save to database */
		this.data.guild.settings.levels.doubleXP = this.data.guild.settings.levels.doubleXP.filter(
			(r: any): boolean => r !== role.id,
		);
		this.data.guild.markModified("settings.levels.doubleXP");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("doublexp:doublexpRoleRemoved", { role: role.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async listDoubleXp(): Promise<any> {
		const response: any = this.data.guild.settings.levels.doubleXP;
		const doublexpRoles: any[] = [];

		for (const element of response) {
			const cachedRole: any = this.interaction.guild!.roles.cache.get(element);
			if (cachedRole) doublexpRoles.push(this.client.emotes.ping + " " + cachedRole.toString());
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			5,
			doublexpRoles,
			this.translate("doublexp:list:title"),
			this.translate("doublexp:list:noDoublexpRoles"),
		);
	}

	private async setXp(min: number, max: number): Promise<any> {
		/* Levelsystem is disabled */
		if (!this.data.guild.settings.levels.enabled) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:levelsystemIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		/* Min is higher than max */
		if (min > max) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("xp:errors:minXpCannotBeHigherThanMaxXp"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		/* Save to database */
		this.data.guild.settings.levels.xp = {
			min: min,
			max: max,
		};
		this.data.guild.markModified("settings.levels.xp");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("xp:xpSet", { min: min, max: max }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async listVariables(): Promise<any> {
		const variables: any = this.translate("variables:list", { e: this.client.emotes });
		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			10,
			variables,
			this.translate("variables:title"),
			this.translate("variables:noLevelVariables"),
		);
	}

	private async testMessage(): Promise<any> {
		/* Levelsystem is disabled */
		if (!this.data.guild.settings.levels.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:levelsystemIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		/* No message set */
		if (!this.data.guild.settings.levels.message) {
			const noMessageEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("test:errors:noLevelUpMessageSet"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [noMessageEmbed] });
		}

		const member: any = this.interaction.member;
		const self = this;
		function parseMessage(str: string): string {
			return str
				.replaceAll(/%level/g, String(1))
				.replaceAll(/%user.name/g, member.user.username)
				.replaceAll(/%user.displayName/g, member.displayName)
				.replaceAll(/%user.id/g, member.user.id)
				.replaceAll(/%user/g, member)
				.replaceAll(/%server.id/g, self.interaction.guild!.id)
				.replaceAll(/%server.memberCount/g, self.interaction.guild!.memberCount.toString())
				.replaceAll(/%server/g, self.interaction.guild!.name);
		}

		const channel: any =
			this.client.channels.cache.get(this.data.guild.settings.levels.channel) || this.interaction.channel;
		const message: string = parseMessage(this.data.guild.settings.levels.message);

		try {
			await channel.send({ content: message });
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("test:testExecuted"),
				"success",
				"success",
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} catch (e) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:unexpected", { support: this.client.support }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}

	private async addExclude(channel: any, role: any): Promise<any> {
		if (!this.data.guild.settings.levels.exclude) {
			this.data.guild.settings.levels.exclude = {
				channels: [],
				roles: [],
			};
			this.data.guild.markModified("settings.levels.exclude");
			await this.data.guild.save();
		}

		/* Levelsystem is disabled */
		if (!this.data.guild.settings.levels.enabled) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:levelsystemIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		const toExclude = channel || role;
		/* No channel or role set */
		if (!toExclude || (toExclude.constructor.name !== "TextChannel" && toExclude.constructor.name !== "Role")) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("basics:errors:channelOrRoleIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (toExclude.constructor.name === "TextChannel") {
			/* Channel is already on the blacklist */
			if (this.data.guild.settings.levels.exclude.channels.includes(toExclude.id)) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("exclude:errors:channelOrRoleIsAlreadyExcluded", { item: toExclude.toString() }),
					"error",
					"error",
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			}

			/* Save to database */
			this.data.guild.settings.levels.exclude.channels.push(toExclude.id);
			this.data.guild.markModified("settings.levels.exclude.channels");
			await this.data.guild.save();
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("exclude:channelOrRoleAdded", { item: toExclude.toString() }),
				"success",
				"success",
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else if (toExclude.constructor.name === "Role") {
			/* Role is already on the blacklist */
			if (this.data.guild.settings.levels.exclude.roles.includes(toExclude.id)) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("exclude:errors:channelOrRoleIsAlreadyExcluded", { item: toExclude.toString() }),
					"error",
					"error",
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			}

			/* Role is @everyone */
			if (toExclude.id === this.interaction.guild!.roles.everyone.id) {
				const everyoneEmbed: EmbedBuilder = this.client.createEmbed(
					this.getBasicTranslation("errors:dontUseEveryoneRole"),
					"error",
					"error",
				);
				return this.interaction.followUp({ embeds: [everyoneEmbed] });
			}

			/* Role is managed */
			if (toExclude.managed) {
				const roleIsManagedEmbed: EmbedBuilder = this.client.createEmbed(
					this.getBasicTranslation("errors:dontUseManagedRole"),
					"error",
					"error",
				);
				return this.interaction.followUp({
					embeds: [roleIsManagedEmbed],
				});
			}

			/* Save to database */
			this.data.guild.settings.levels.exclude.roles.push(toExclude.id);
			this.data.guild.markModified("settings.levels.exclude.roles");
			await this.data.guild.save();
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("exclude:channelOrRoleAdded", { item: toExclude.toString() }),
				"success",
				"success",
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		}
	}

	private async removeExclude(channel: any, role: any): Promise<any> {
		if (!this.data.guild.settings.levels.exclude) {
			this.data.guild.settings.levels.exclude = {
				channels: [],
				roles: [],
			};
			this.data.guild.markModified("settings.levels.exclude");
			await this.data.guild.save();
		}

		/* Levelsystem is disabled */
		if (!this.data.guild.settings.levels.enabled) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:levelsystemIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		const toExclude = channel || role;
		/* No channel or role set */
		if (!toExclude || (toExclude.constructor.name !== "TextChannel" && toExclude.constructor.name !== "Role")) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("basics:errors:channelOrRoleIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		if (toExclude.constructor.name === "TextChannel") {
			/* Channel is not on the blacklist */
			if (!this.data.guild.settings.levels.exclude.channels.includes(toExclude.id)) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("exclude:errors:channelOrRoleIsNotExcluded", { item: toExclude.toString() }),
					"error",
					"error",
					toExclude,
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			}

			/* Save to database */
			this.data.guild.settings.levels.exclude.channels = this.data.guild.settings.levels.exclude.channels.filter(
				(c: any): boolean => c !== toExclude.id,
			);
			this.data.guild.markModified("settings.levels.exclude.channels");
			await this.data.guild.save();
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("exclude:channelOrRoleRemoved", { item: toExclude.toString() }),
				"success",
				"success"
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else if (toExclude.constructor.name === "Role") {
			/* Role is not on the blacklist */
			if (!this.data.guild.settings.levels.exclude.roles.includes(toExclude.id)) {
				const errorEmbed = this.client.createEmbed(
					this.translate("exclude:errors:channelOrRoleIsNotExcluded", { item: toExclude.toString() }),
					"error",
					"error",
					toExclude,
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			}

			/* Save to database */
			this.data.guild.settings.levels.exclude.roles = this.data.guild.settings.levels.exclude.roles.filter(
				(r: any): boolean => r !== toExclude.id,
			);
			this.data.guild.markModified("settings.levels.exclude.roles");
			await this.data.guild.save();
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("exclude:channelOrRoleRemoved", { item: toExclude.toString() }),
				"success",
				"success",
				toExclude,
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		}
	}

	private async listExcluded(): Promise<void> {
		if (!this.data.guild.settings.levels.exclude) {
			this.data.guild.settings.levels.exclude = {
				channels: [],
				roles: [],
			};
			this.data.guild.markModified("settings.levels.exclude");
			await this.data.guild.save();
		}

		const response = this.data.guild.settings.levels.exclude;
		const excluded: any[] = [];

		for (const element of response.roles) {
			const cachedRole = this.interaction.guild!.roles.cache.get(element);
			if (cachedRole) excluded.push(this.client.emotes.ping + " " + cachedRole.toString());
		}

		for (const element of response.channels) {
			const cachedChannel = this.interaction.guild!.channels.cache.get(element);
			if (cachedChannel) excluded.push(this.client.emotes.channel + " " + cachedChannel.toString());
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			5,
			excluded,
			this.translate("exclude:list:title"),
			this.translate("exclude:list:noRoleOrChannelsAdded"),
		);
	}
}
