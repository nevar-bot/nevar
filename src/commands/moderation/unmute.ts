/** @format */

import BaseCommand from '@structures/BaseCommand';
import BaseClient from '@structures/BaseClient';
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default class UnmuteCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'unmute',
			description: 'Entmutet ein Mitglied',
			memberPermissions: ['KickMembers'],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addUserOption((option: any) =>
					option
						.setName('mitglied')
						.setDescription('Wähle ein Mitglied')
						.setRequired(true)
				)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;

		await this.unmute(interaction.options.getUser('mitglied'), data);
	}

	private async unmute(user: any, data: any): Promise<void> {
		const member: any = await this.interaction.guild.resolveMember(user.id);
		if (!member) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Du musst ein Mitglied angeben.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		const memberData: any = await this.client.findOrCreateMember(
			user.id,
			this.interaction.guild.id
		);
		if (!memberData.muted.state) {
			const isNotMutedEmbed: EmbedBuilder = this.client.createEmbed(
				'{0} ist nicht gemutet.',
				'error',
				'error',
				user.username
			);
			return this.interaction.followUp({ embeds: [isNotMutedEmbed] });
		}

		member.roles
			.remove(
				data.guild.settings.muterole,
				'Vorzeitiger Unmute durch ' + this.interaction.user.username
			)
			.catch((): void => {});
		memberData.muted = {
			state: false,
			reason: null,
			moderator: {
				name: null,
				id: null
			},
			duration: null,
			mutedAt: null,
			mutedUntil: null
		};
		memberData.markModified('muted');
		await memberData.save();
		this.client.databaseCache.mutedUsers.delete(
			user.id + this.interaction.guild.id
		);

		const logText: string =
			'### ' +
			this.client.emotes.timeout +
			' ' +
			user.username +
			' wurde entmutet\n\n' +
			this.client.emotes.user +
			' Moderator: ' +
			this.interaction.user.username;
		const logEmbed: EmbedBuilder = this.client.createEmbed(
			logText,
			null,
			'normal'
		);
		logEmbed.setThumbnail(user.displayAvatarURL());
		await this.interaction.guild.logAction(logEmbed, 'moderation');

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			'{0} wurde entmutet.',
			'success',
			'success',
			user.username
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}
}
