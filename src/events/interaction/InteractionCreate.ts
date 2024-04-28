import { EmbedBuilder, PermissionsBitField } from "discord.js";
import * as fs from "fs";
import { NevarClient } from "@core/NevarClient";
// @ts-ignore
import { createClient } from "hafas-client";
// @ts-ignore
import { profile as dbProfile } from "hafas-client/p/db/index.js";

export default class {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async dispatch(interaction: any): Promise<any> {
		/* Check if interaction, type, member or guildId is null */
		if (!interaction || !interaction.type || !interaction.member || !interaction.guildId) return;

		/* Destructure interaction */
		const { guild, member, channel }: any = interaction;

		/* Create data object */
		const data: any = {
			guild: await this.client.findOrCreateGuild(guild.id),
			member: await this.client.findOrCreateMember(member.id, guild.id),
			user: await this.client.findOrCreateUser(member.user.id),
		};
		guild.data = data.guild;
		member.data = data.member;
		member.user.data = data.user;

		/* Handle autocomplete commands */
		if(interaction.isAutocomplete()){
			const searchInput: string = interaction.options.getFocused();
			const matchingItems: any[] = [];

			if(searchInput === "") return;
			switch(interaction.commandName){
				case "help":
					this.client.commands.forEach((command: any): void => {
						if(command.help.name.includes(searchInput) && matchingItems.length < 26){
							matchingItems.push({ name: command.help.name, value: command.help.name });
						}
					});
					break;
				case "transport":
					const deutscheBahnClient: any = createClient(dbProfile, "hello@nevar.eu");
					const stations: any = await deutscheBahnClient.locations(searchInput, { results: 5 });
					stations.forEach((station: any): void => {
						if(station.type === "stop"){
							matchingItems.push({ name: station.name, value: station.id });
						}
					});
					break;
			}

			await interaction.respond(matchingItems);
		}

		if(interaction.isUserContextMenuCommand() || interaction.isCommand()){
			if (data.user.blocked.state) {
				const reason = data.user.blocked.reason || guild.translate("basics:noReason");

				const blockMessage: string =
					this.client.emotes.error + " " + guild.translate("events/interaction/InteractionCreate:userIsBlocked", { client: this.client.user!.username }) + "\n" +
					this.client.emotes.arrow + " " + guild.translate("basics:reason") + ": " + reason;
				const blockedMessageEmbed: EmbedBuilder = this.client.createEmbed(blockMessage, "error", "error");
				return interaction.followUp({ embeds: [blockedMessageEmbed], ephemeral: true });
			}

			/* Guild is blocked */
			if (data.guild.blocked.state) {
				const reason = data.guild.blocked.reason || guild.translate("basics:noReason");

				const blockMessage: string =
					this.client.emotes.error + " " + guild.translate("events/interaction/InteractionCreate:guildIsBlocked", { client: this.client.user!.username }) + "\n" +
					this.client.emotes.arrow + " " + guild.translate("basics:reason") + ": " + reason;
				const blockedMessageEmbed: EmbedBuilder = this.client.createEmbed(blockMessage, "error", "error");
				return interaction.followUp({ embeds: [blockedMessageEmbed] });
			}
		}

		/* Handle context menus */
		if (interaction.isContextMenuCommand()) {
			const contextMenu: any = this.client.contextMenus.get(interaction.commandName);
			if (!contextMenu) {
				const errorMessageEmbed: EmbedBuilder = this.client.createEmbed(
					guild.translate("basics:errors:unexpected", { support: this.client.support }),
					"error",
					"error",
				);
				return interaction.reply({ embeds: [errorMessageEmbed], ephemeral: true }).catch((): void => {});
			}

			try {
				await interaction.deferReply();
			} catch (e: any) {
				const errorMessageEmbed: EmbedBuilder = this.client.createEmbed(
					guild.translate("basics:errors:unexpected", { support: this.client.support }),
					"error",
					"error",
				);
				return interaction.reply({ embeds: [errorMessageEmbed], ephemeral: true }).catch((e: any): void => {});
			} finally {
				if (!interaction.deferred) {
					const errorMessageEmbed: EmbedBuilder = this.client.createEmbed(
						guild.translate("basics:errors:unexpected", { support: this.client.support }),
						"error",
						"error",
					);
					await interaction.reply({ embeds: [errorMessageEmbed], ephemeral: true }).catch((): void => {});
				}
			}

			/* Save command log to database */
			new this.client.logs({
				command: contextMenu.help.name,
				type: interaction.isUserContextMenuCommand() ? "User Context Menu" : "Message Context Menu",
				arguments: [],
				date: Date.now(),
				user: {
					username: member.user.username,
					displayName: member.displayName,
					id: member.user.id,
					createdAt: member.user.createdAt,
				},
				guild: {
					name: guild.name,
					id: guild.id,
					createdAt: guild.createdAt,
				},
				channel: {
					name: channel.name,
					id: channel.id,
					createdAt: channel.createdAt,
				},
			}).save();

			try {
				return contextMenu.dispatch(interaction);
			} catch (e: any) {
				const errorMessageEmbed: EmbedBuilder = this.client.createEmbed(
					guild.translate("basics:errors:unexpected", { support: this.client.support }),
					"error",
					"error"
				);
				await interaction.followUp({ embeds: [errorMessageEmbed] }).catch((e: any): void => {});
				return this.client.alertException(e, guild.name, member.user);
			}
		}

		/* Handle button interactions */
		if (interaction.isButton()) {
			const buttonIdSplitted = interaction.customId.split("_");
			if (!buttonIdSplitted) return;

			/* User wants to participate in a giveaway */
			if (buttonIdSplitted[0] === "giveaway") {
				this.client.emit("GiveawayParticipated", interaction, buttonIdSplitted, data, guild);
			}
		}

		/* Handle slash commands */
		if (interaction.isCommand()) {
			const command: any = this.client.commands.get(interaction.commandName);
			if (!command) {
				const errorMessageEmbed: EmbedBuilder = this.client.createEmbed(
					guild.translate("basics:errors:unexpected", { support: this.client.support }),
					"error",
					"error"
				);
				return interaction.reply({ embeds: [errorMessageEmbed], ephemeral: true }).catch((e: any): void => {});
			}

			try {
				await interaction.deferReply();
			} catch (e: any) {
				const errorMessageEmbed: EmbedBuilder = this.client.createEmbed(
					guild.translate("basics:errors:unexpected", { support: this.client.support }),
					"error",
					"error",
					this.client.support
				);
				return interaction.reply({ embeds: [errorMessageEmbed], ephemeral: true }).catch((): void => {});
			} finally {
				if (!interaction.deferred) {
					const errorMessageEmbed: EmbedBuilder = this.client.createEmbed(
						guild.translate("basics:errors:unexpected", { support: this.client.support }),
						"error",
						"error"
					);
					await interaction.reply({ embeds: [errorMessageEmbed], ephemeral: true }).catch((): void => {});
				}
			}

			const args: any = interaction.options?._hoistedOptions || [];

			/* Check if bot has all required permissions */
			const neededBotPermissions: any[] = [];
			if (!command.conf.botPermissions.includes("EmbedLinks")) command.conf.botPermissions.push("EmbedLinks");
			for (const neededBotPermission of command.conf.botPermissions) {
				const permissions: any = channel.permissionsFor(guild.members.me);
				// @ts-ignore
				if(!permissions.has(PermissionsBitField.Flags[neededBotPermission])){
					neededBotPermissions.push(guild.translate("permissions:" + neededBotPermission));
				}
			}
			if (neededBotPermissions.length > 0) {
				const missingPermissionMessageEmbed: EmbedBuilder = this.client.createEmbed(
					guild.translate("events/interaction/InteractionCreate:missingBotPermissions", { e: this.client.emotes, permissions: neededBotPermissions.join("\n" + this.client.emotes.arrow + " ") }),
					"error",
					"error"
				);
				return interaction.followUp({ embeds: [missingPermissionMessageEmbed] });
			}

			/* Command is disabled */
			const disabledCommandsJson: any = JSON.parse(fs.readFileSync("./assets/disabled.json").toString());
			if (disabledCommandsJson.includes(command.help.name)) {
				/* Staffs can bypass disabled commands */
				if (!data.user.staff.state && !this.client.config.general["OWNER_IDS"].includes(member.user.id)) {
					const disabledMessageEmbed: EmbedBuilder = this.client.createEmbed(
						guild.translate("events/interaction/InteractionCreate:commandIsDisabled", { support: this.client.support }),
						"error",
						"error"
					);
					return interaction.followUp({ embeds: [disabledMessageEmbed] });
				}
			}

			/* Save command log to database */
			new this.client.logs({
				command: command.help.name,
				type: "Slash command",
				arguments: args,
				date: Date.now(),
				user: {
					username: member.user.username,
					displayName: member.displayName,
					id: member.user.id,
					createdAt: member.user.createdAt,
				},
				guild: {
					name: interaction.guild.name,
					id: interaction.guild.id,
					createdAt: interaction.guild.createdAt,
				},
				channel: {
					name: channel.name,
					id: channel.id,
					createdAt: channel.createdAt,
				},
			}).save();

			/* Execute command */
			try {
				command.dispatch(interaction, data);
			} catch (e: any) {
				const errorMessageEmbed: EmbedBuilder = this.client.createEmbed(
					guild.translate("basics:errors:unexpected", { support: this.client.support }),
					"error",
					"error"
				);
				return interaction.followUp({ embeds: [errorMessageEmbed] }).catch((): void => {});
			}
		}
	}
}