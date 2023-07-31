/** @format */

import BaseCommand from '@structures/BaseCommand';
import BaseClient from '@structures/BaseClient';
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default class ResetwarnsCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'resetwarns',
			description: 'Setzt die Verwarnungen eines Mitgliedes zurück',
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
		await this.resetWarns(interaction.options.getUser('mitglied'));
	}

	private async resetWarns(user: any): Promise<void> {
		const memberData: any = await this.client.findOrCreateMember(
			user.id,
			this.interaction.guild.id
		);

		memberData.warnings = {
			count: 0,
			list: []
		};
		memberData.markModified('warnings');
		await memberData.save();

		const logText: string =
			'### ' +
			this.client.emotes.delete +
			' Verwarnungen von ' +
			user.username +
			' zurückgesetzt\n\n' +
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
			'Die Verwarnungen von {0} wurden zurückgesetzt.',
			'success',
			'success',
			user.username
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}
}
