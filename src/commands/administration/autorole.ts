import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default class AutoroleCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "autorole",
			description: "Manages the roles that are automatically given to new members",
			localizedDescriptions: {
				de: "Verwaltet die Rollen, welche neuen Mitgliedern automatisch gegeben werden",
			},
			memberPermissions: ["ManageGuild"],
			botPermissions: ["ManageRoles"],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName("action")
							.setNameLocalizations({
								de: "aktion",
							})
							.setDescription("Choose from the following actions")
							.setDescriptionLocalizations({
								de: "Wähle aus den folgenden Aktionen",
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
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<any> {
		this.interaction = interaction;
		this.guild = interaction.guild;

		const action: string = interaction.options.getString("action");
		switch (action) {
			case "add":
				await this.addAutorole(interaction.options.getRole("role"), data);
				break;
			case "remove":
				await this.removeAutorole(interaction.options.getRole("role"), data);
				break;
			case "list":
				await this.showList(data);
				break;
			default:
				const unexpectedErrorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("basics:errors:unexpected", { support: this.client.support }),
					"error",
					"error",
				);
				return this.interaction.followUp({
					embeds: [unexpectedErrorEmbed],
				});
		}
	}

	private async addAutorole(role: any, data: any): Promise<any> {
		/* Invalid options */
		if (!role || !role.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("basics:errors:missingRole", {}, true),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Role is @everyone */
		if (role.id === this.interaction.guild!.roles.everyone.id) {
			const everyoneEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:cantUseEveryone"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [everyoneEmbed] });
		}

		/* Role is managed */
		if (role.managed) {
			const roleIsManagedEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:roleIsManaged"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [roleIsManagedEmbed] });
		}

		/* Role is higher than the bot's highest role */
		if (this.interaction.guild!.members.me!.roles.highest.position <= role.position) {
			const roleIsTooHighEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:roleIsTooHigh", {
					role: role.toString(),
					botRole: this.interaction.guild!.members.me!.roles.highest.toString(),
				}),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [roleIsTooHighEmbed] });
		}

		/* Role is already an autorole */
		if (data.guild.settings.welcome.autoroles.includes(role.id)) {
			const isAlreadyAutoroleEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:alreadyAdded", { role: role.toString() }),
				"error",
				"error",
			);
			return this.interaction.followUp({
				embeds: [isAlreadyAutoroleEmbed],
			});
		}

		/* Add to database */
		data.guild.settings.welcome.autoroles.push(role.id);
		data.guild.markModified("settings.welcome.autoroles");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("added", { role: role.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async removeAutorole(role: any, data: any): Promise<void> {
		/* Invalid options */
		if (!role || !role.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("basics:errors:missingRole", {}, true),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Role is not an autorole */
		if (!data.guild.settings.welcome.autoroles.includes(role.id)) {
			const isNoAutoroleEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:notAdded", { role: role.toString() }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [isNoAutoroleEmbed] });
		}

		/* Remove from database */
		data.guild.settings.welcome.autoroles = data.guild.settings.welcome.autoroles.filter(
			(r: any): boolean => r !== role.id,
		);
		data.guild.markModified("settings.welcome.autoroles");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("removed", { role: role.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async showList(data: any): Promise<void> {
		const response: any = data.guild.settings.welcome.autoroles;
		const autorolesArray: any[] = [];

		for (const element of response) {
			const cachedRole: any = this.interaction.guild!.roles.cache.get(element);
			if (cachedRole) autorolesArray.push(this.client.emotes.ping + " " + cachedRole.toString());
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			5,
			autorolesArray,
			this.translate("list:title"),
			this.translate("list:empty")
		);
	}
}
