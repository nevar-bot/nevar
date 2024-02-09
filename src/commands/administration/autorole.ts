import BaseCommand from "@structures/BaseCommand.js";
import BaseClient from "@structures/BaseClient.js";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import path from "path";

export default class AutoroleCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "autorole",
			description: "Automatically assign roles to new members",
			localizedDescriptions: {
				de: "Weise neuen Mitgliedern automatisch Rollen zu",
			},
			memberPermissions: ["ManageGuild"],
			botPermissions: ["ManageRoles"],
			cooldown: 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName("action")
							.setNameLocalization("de", "aktion")
							.setDescription("Choose one of the above actions")
							.setDescriptionLocalization("de", "Wähle eine der genannten Aktionen")
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
							.setNameLocalization("de", "rolle")
							.setDescription("Choose a role")
							.setDescriptionLocalization("de", "Wähle eine Rolle")
							.setRequired(false),
					),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<any> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;

		const action: string = interaction.options.getString("action");
		switch (action) {
			case "add":
				await this.addAutorole(interaction.options.getRole("role"));
				break;
			case "remove":
				await this.removeAutorole(interaction.options.getRole("role"));
				break;
			case "list":
				await this.showList();
				break;
		}
	}

	private async addAutorole(role: any): Promise<any> {
		/* Invalid options */
		if (!role || !role.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:roleIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
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

		/* Role is higher than the bot's highest role */
		if (this.interaction.guild!.members.me!.roles.highest.position <= role.position) {
			const roleIsTooHighEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:roleIsHigherThanBot", { role: this.interaction.guild!.members.me!.roles.highest.toString() }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [roleIsTooHighEmbed] });
		}

		/* Role is already an autorole */
		if (this.data.guild.settings.welcome.autoroles.includes(role.id)) {
			const isAlreadyAutoroleEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:roleIsAlreadyAddedToAutoroles", { role: role.toString() }),
				"error",
				"error",
			);
			return this.interaction.followUp({
				embeds: [isAlreadyAutoroleEmbed],
			});
		}

		/* Add to database */
		this.data.guild.settings.welcome.autoroles.push(role.id);
		this.data.guild.markModified("settings.welcome.autoroles");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("roleAddedToAutoroles", { role: role.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async removeAutorole(role: any): Promise<any> {
		/* Invalid options */
		if (!role || !role.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:roleIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Role is not an autorole */
		if (!this.data.guild.settings.welcome.autoroles.includes(role.id)) {
			const isNoAutoroleEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:roleIsNotAddedToAutoroles", { role: role.toString() }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [isNoAutoroleEmbed] });
		}

		/* Remove from database */
		this.data.guild.settings.welcome.autoroles = this.data.guild.settings.welcome.autoroles.filter(
			(r: any): boolean => r !== role.id,
		);
		this.data.guild.markModified("settings.welcome.autoroles");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("roleRemovedFromAutoroles", { role: role.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async showList(): Promise<void> {
		const response: any = this.data.guild.settings.welcome.autoroles;
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
			this.translate("list:noAutorolesAdded")
		);
	}
}
