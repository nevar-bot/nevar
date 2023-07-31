/** @format */

import { EmbedBuilder, GuildMember, PermissionsBitField } from 'discord.js';
import * as fs from 'fs';
import BaseClient from '@structures/BaseClient';

const interactionCooldowns: any = {};

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(interaction: any): Promise<any> {
		if (
			!interaction ||
			!interaction.type ||
			!interaction.member ||
			!interaction.guildId
		)
			return;

		/* Basic information */
		const { guild, member, channel }: any = interaction;

		const data: any = {
			guild: await this.client.findOrCreateGuild(guild.id),
			member: await this.client.findOrCreateMember(member.id, guild.id),
			user: await this.client.findOrCreateUser(member.user.id)
		};

		/* Handle context menus */
		if (interaction.isContextMenuCommand()) {
			const contextMenu: any = this.client.contextMenus.get(
				interaction.commandName
			);
			if (!contextMenu) {
				const errorMessageEmbed: EmbedBuilder = this.client.createEmbed(
					'Ein unerwarteter Fehler ist aufgetreten, bitte kontaktiere den [Support]{0}.',
					'error',
					'error',
					this.client.support
				);
				await interaction
					.reply({ embeds: [errorMessageEmbed], ephemeral: true })
					.catch((e: any): void => {});
				return this.client.alertException(
					'Context menu ' + interaction.commandName + ' not found',
					guild.name,
					member.user,
					'<Client>.contextMenus.get("' +
						interaction.commandName +
						'")'
				);
			}

			try {
				await interaction.deferReply();
			} catch (e: any) {
				const errorMessageEmbed: EmbedBuilder = this.client.createEmbed(
					'Ein unerwarteter Fehler ist aufgetreten, bitte kontaktiere den [Support]{0}.',
					'error',
					'error',
					this.client.support
				);
				await interaction
					.reply({ embeds: [errorMessageEmbed], ephemeral: true })
					.catch((e: any): void => {});
				return this.client.alertException(
					e,
					guild.name,
					member.user,
					'<ContextInteraction>.deferReply()'
				);
			} finally {
				if (!interaction.deferred) {
					const errorMessageEmbed: EmbedBuilder =
						this.client.createEmbed(
							'Ein unerwarteter Fehler ist aufgetreten, bitte kontaktiere den [Support]{0}.',
							'error',
							'error',
							this.client.support
						);
					await interaction
						.reply({ embeds: [errorMessageEmbed], ephemeral: true })
						.catch((e: any): void => {});
					await this.client.alertException(
						'ContextInteraction is not deferred',
						guild.name,
						member.user,
						'<ContextInteraction>.deferReply()'
					);
				}
			}

			/* User is blocked */
			if (data.user.blocked.state) {
				const reason =
					data.user.blocked.reason || 'Kein Grund angegeben';
				const blockedMessageEmbed: EmbedBuilder =
					this.client.createEmbed(
						'Du wurdest von der Nutzung des Bots ausgeschlossen.\n{0} Begründung: {1}',
						'error',
						'error',
						this.client.emotes.arrow,
						reason
					);
				return interaction.followUp({
					embeds: [blockedMessageEmbed],
					ephemeral: true
				});
			}

			/* Guild is blocked */
			if (data.guild.blocked.state) {
				const reason =
					data.guild.blocked.reason || 'Kein Grund angegeben';
				const blockedMessageEmbed: EmbedBuilder =
					this.client.createEmbed(
						'Dieser Server wurde von der Nutzung des Bots ausgeschlossen.\n{0} Begründung: {1}',
						'error',
						'error',
						this.client.emotes.arrow,
						reason
					);
				return interaction.followUp({ embeds: [blockedMessageEmbed] });
			}

			/* User has active cooldown */
			let userCooldown: any = interactionCooldowns[member.user.id];
			if (!userCooldown) {
				interactionCooldowns[member.user.id] = {};
				userCooldown = interactionCooldowns[member.user.id];
			}
			const time = userCooldown[contextMenu.help.name] || 0;
			if (time > Date.now()) {
				/* Staffs can bypass cooldown */
				if (
					!data.user.staff.state &&
					!this.client.config.general['OWNER_IDS'].includes(
						member.user.id
					)
				) {
					const seconds: number = Math.ceil(
						(time - Date.now()) / 1000
					);
					const secondsString: string =
						seconds > 1 ? 'Sekunden' : 'Sekunde';
					const cooldownMessageEmbed: EmbedBuilder =
						this.client.createEmbed(
							'Du musst noch {0} {1} warten, bis du diesen Befehl erneut nutzen kannst.',
							'error',
							'error',
							seconds,
							secondsString
						);
					return interaction.followUp({
						embeds: [cooldownMessageEmbed]
					});
				}
			}
			interactionCooldowns[member.user.id][contextMenu.help.name] =
				Date.now() + contextMenu.conf.cooldown;

			/* Save command log to database */
			const log = new this.client.logs({
				command: contextMenu.help.name,
				type: interaction.isUserContextMenuCommand()
					? 'User Context Menu'
					: 'Message Context Menu',
				arguments: [],
				user: {
					tag: member.user.username,
					id: member.user.id,
					createdAt: member.user.createdAt
				},
				guild: {
					name: guild.name,
					id: guild.id,
					createdAt: guild.createdAt
				},
				channel: {
					name: channel.name,
					id: channel.id,
					createdAt: channel.createdAt
				}
			});
			log.save();

			try {
				return contextMenu.dispatch(interaction);
			} catch (e: any) {
				const errorMessageEmbed: EmbedBuilder = this.client.createEmbed(
					'Ein unerwarteter Fehler ist aufgetreten, bitte kontaktiere den [Support]{0}.',
					'error',
					'error',
					this.client.support
				);
				await interaction
					.followUp({ embeds: [errorMessageEmbed] })
					.catch((e: any): void => {});
				return this.client.alertException(
					e,
					guild.name,
					member.user,
					'<ContextInteraction>.dispatch(<Interaction>)'
				);
			}
		}

		/* Handle suggestion reactions */
		if (interaction.isButton()) {
			const buttonIdSplitted = interaction.customId.split('_');
			if (!buttonIdSplitted) return;

			/* User voted for a suggestion */
			if (buttonIdSplitted[0] === 'suggestion') {
				this.client.emit(
					'SuggestionVoted',
					interaction,
					buttonIdSplitted,
					data
				);
			}

			/* Moderator wants to review a suggestion */
			if (buttonIdSplitted[0] === 'review') {
				this.client.emit(
					'SuggestionReviewed',
					interaction,
					buttonIdSplitted,
					data,
					guild
				);
			}

			/* Moderator wants to handle an AI detected message */
			if (buttonIdSplitted[0] === 'aimod') {
				this.client.emit(
					'AiMessageHandled',
					interaction,
					buttonIdSplitted,
					data,
					guild
				);
			}
		}

		/* Handle slash commands */
		if (interaction.isCommand()) {
			const command: any = this.client.commands.get(
				interaction.commandName
			);
			if (!command) {
				const errorMessageEmbed: EmbedBuilder = this.client.createEmbed(
					'Ein unerwarteter Fehler ist aufgetreten, bitte kontaktiere den [Support]{0}.',
					'error',
					'error',
					this.client.support
				);
				await interaction
					.reply({ embeds: [errorMessageEmbed], ephemeral: true })
					.catch((e: any): void => {});
				return this.client.alertException(
					'Context menu ' + interaction.commandName + ' not found',
					guild.name,
					member.user,
					'<Client>.contextMenus.get("' +
						interaction.commandName +
						'")'
				);
			}

			try {
				await interaction.deferReply();
			} catch (e: any) {
				const errorMessageEmbed: EmbedBuilder = this.client.createEmbed(
					'Ein unerwarteter Fehler ist aufgetreten, bitte kontaktiere den [Support]{0}.',
					'error',
					'error',
					this.client.support
				);
				await interaction
					.reply({ embeds: [errorMessageEmbed], ephemeral: true })
					.catch((e: any): void => {});
				return this.client.alertException(
					e,
					guild.name,
					member.user,
					'<CommandInteraction>.deferReply()'
				);
			} finally {
				if (!interaction.deferred) {
					const errorMessageEmbed: EmbedBuilder =
						this.client.createEmbed(
							'Ein unerwarteter Fehler ist aufgetreten, bitte kontaktiere den [Support]{0}.',
							'error',
							'error',
							this.client.support
						);
					await interaction
						.reply({ embeds: [errorMessageEmbed], ephemeral: true })
						.catch((e: any): void => {});
					await this.client.alertException(
						'CommandInteraction is not deferred',
						guild.name,
						member.user,
						'<CommandInteraction>.deferReply()'
					);
				}
			}

			const args: any = interaction.options?._hoistedOptions || [];

			/* User is blocked */
			/* User is blocked */
			if (data.user.blocked.state) {
				const reason =
					data.user.blocked.reason || 'Kein Grund angegeben';
				const blockedMessageEmbed: EmbedBuilder =
					this.client.createEmbed(
						'Du wurdest von der Nutzung des Bots ausgeschlossen.\n{0} Begründung: {1}',
						'error',
						'error',
						this.client.emotes.arrow,
						reason
					);
				return interaction.followUp({
					embeds: [blockedMessageEmbed],
					ephemeral: true
				});
			}

			/* Guild is blocked */
			if (data.guild.blocked.state) {
				const reason =
					data.guild.blocked.reason || 'Kein Grund angegeben';
				const blockedMessageEmbed: EmbedBuilder =
					this.client.createEmbed(
						'Dieser Server wurde von der Nutzung des Bots ausgeschlossen.\n{0} Begründung: {1}',
						'error',
						'error',
						this.client.emotes.arrow,
						reason
					);
				return interaction.followUp({ embeds: [blockedMessageEmbed] });
			}

			/* Check if bot has all required permissions */
			const neededBotPermissions: any[] = [];
			if (!command.conf.botPermissions.includes('EmbedLinks'))
				command.conf.botPermissions.push('EmbedLinks');
			for (const neededBotPermission of command.conf.botPermissions) {
				const permissions: any = channel.permissionsFor(
					guild.members.me
				);
				// @ts-ignore - TS7053: Element implicitly has an 'any' type
				if (
					!permissions.has(
						PermissionsBitField.Flags[neededBotPermission]
					)
				) {
					neededBotPermissions.push(
						this.client.permissions[neededBotPermission]
					);
				}
			}
			if (neededBotPermissions.length > 0) {
				const missingPermissionMessageEmbed = this.client.createEmbed(
					'Folgende Berechtigungen fehlen mir, um den Befehl ausführen zu können:\n\n{0} {1}',
					'error',
					'error',
					this.client.emotes.arrow,
					neededBotPermissions.join(
						'\n' + this.client.emotes.arrow + ' '
					)
				);
				return interaction.followUp({
					embeds: [missingPermissionMessageEmbed]
				});
			}

			/* Command is nsfw */
			if (!channel.nsfw && command.conf.nsfw) {
				const nsfwMessageEmbed: EmbedBuilder = this.client.createEmbed(
					'Dieser Befehl kann nur in altersbeschränkten Kanälen verwendet werden.',
					'error',
					'error'
				);
				return interaction.followUp({ embeds: [nsfwMessageEmbed] });
			}

			/* Command is disabled */
			const disabledCommandsJson: any = JSON.parse(
				fs.readFileSync('./assets/disabled.json').toString()
			);
			if (disabledCommandsJson.includes(command.help.name)) {
				/* Staffs can bypass disabled commands */
				if (
					!data.user.staff.state &&
					!this.client.config.general['OWNER_IDS'].includes(
						member.user.id
					)
				) {
					const disabledMessageEmbed = this.client.createEmbed(
						'Dieser Befehl ist derzeit deaktiviert.',
						'error',
						'error'
					);
					return interaction.followUp({
						embeds: [disabledMessageEmbed]
					});
				}
			}

			/* Member is in cooldown */
			let userCooldown: any = interactionCooldowns[member.user.id];
			if (!userCooldown) {
				interactionCooldowns[member.user.id] = {};
				userCooldown = interactionCooldowns[member.user.id];
			}
			const time = userCooldown[command.help.name] || 0;
			if (time > Date.now()) {
				/* Staffs can bypass cooldown */
				if (
					!data.user.staff.state &&
					!this.client.config.general['OWNER_IDS'].includes(
						member.user.id
					)
				) {
					const seconds: number = Math.ceil(
						(time - Date.now()) / 1000
					);
					const secondsString: string =
						seconds > 1 ? 'Sekunden' : 'Sekunde';
					const cooldownMessageEmbed: EmbedBuilder =
						this.client.createEmbed(
							'Du musst noch {0} {1} warten, bis du diesen Befehl erneut nutzen kannst.',
							'error',
							'error',
							seconds,
							secondsString
						);
					return interaction.followUp({
						embeds: [cooldownMessageEmbed]
					});
				}
			}
			interactionCooldowns[member.user.id][command.help.name] =
				Date.now() + command.conf.cooldown;

			/* Save command log to database */
			const log: any = new this.client.logs({
				command: command.help.name,
				type: 'Slash command',
				arguments: args,
				user: {
					tag: member.user.username,
					id: member.user.id,
					createdAt: member.user.createdAt
				},
				guild: {
					name: interaction.guild.name,
					id: interaction.guild.id,
					createdAt: interaction.guild.createdAt
				},
				channel: {
					name: channel.name,
					id: channel.id,
					createdAt: channel.createdAt
				}
			});
			log.save();

			/* Execute command */
			try {
				command.dispatch(interaction, data);
			} catch (e: any) {
				const errorMessageEmbed: EmbedBuilder = this.client.createEmbed(
					'Ein unerwarteter Fehler ist aufgetreten, bitte kontaktiere den [Support]{0}.',
					'error',
					'error',
					this.client.support
				);
				await interaction
					.followUp({ embeds: [errorMessageEmbed] })
					.catch((e: any): void => {});
				return this.client.alertException(
					e,
					guild.name,
					member.user,
					'<ContextInteraction>.dispatch(<Interaction>)'
				);
			}
		}
	}
}
