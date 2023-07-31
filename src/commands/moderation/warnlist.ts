/** @format */

import BaseCommand from '@structures/BaseCommand';
import BaseClient from '@structures/BaseClient';
import moment from 'moment';
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default class WarnlistCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'warnlist',
			description: 'Listet alle Verwarnungen eines Mitgliedes auf',
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
		await this.listWarnings(interaction.options.getUser('mitglied'));
	}

	private async listWarnings(user: any): Promise<void> {
		const member: any = await this.interaction.guild.resolveMember(user.id);
		if (!member) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Du musst ein Mitglied angeben.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		const targetData: any = await this.client.findOrCreateMember(
			member.user.id,
			this.interaction.guild.id
		);

		const warnList: any[] = [];
		const warnings: any[] = [...targetData.warnings.list];
		const warnCount: number = targetData.warnings.count;

		let indicator: number = 0;
		for (let warn of warnings) {
			indicator++;
			const text: string =
				'### ' +
				this.client.emotes.ban +
				' Warn ' +
				indicator +
				'\n' +
				this.client.emotes.arrow +
				' Moderator: ' +
				warn.moderator +
				'\n' +
				this.client.emotes.arrow +
				' Begründung: ' +
				warn.reason +
				'\n' +
				this.client.emotes.arrow +
				' Verwarnt am: ' +
				moment(warn.date).format('DD.MM.YYYY, HH:mm') +
				'\n';
			warnList.push(text);
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			5,
			warnList,
			'Warns von ' + member.user.username + ' (' + warnCount + ')',
			member.user.username + ' hat keine Verwarnungen',
			null
		);
	}
}
