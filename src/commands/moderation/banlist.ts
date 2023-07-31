/** @format */

import BaseCommand from '@structures/BaseCommand';
import BaseClient from '@structures/BaseClient';
import { SlashCommandBuilder } from 'discord.js';
import moment from 'moment';

export default class BanlistCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'banlist',
			description: 'Listet alle gebannten Mitglieder',
			memberPermissions: ['BanMembers'],
			botPermissions: ['BanMembers'],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		await this.showBanList();
	}

	private async showBanList(): Promise<void> {
		let bannedUsers: any[] = [];
		const bans: any = await this.interaction.guild.bans
			.fetch()
			.catch((): void => {});
		for (let ban of bans) {
			const memberData: any = await this.client.findOrCreateMember(
				ban[1].user.id,
				this.interaction.guild.id
			);
			if (memberData.banned.state) {
				// Mit Nevar gebannt
				const duration: string =
					memberData.banned.duration ===
					200 * 60 * 60 * 24 * 365 * 1000
						? 'Permanent'
						: this.client.utils.getRelativeTime(
								Date.now() - memberData.banned.duration
						  );
				const bannedUntil: string =
					memberData.banned.duration ===
					200 * 60 * 60 * 24 * 365 * 1000
						? '/'
						: moment(memberData.banned.bannedUntil).format(
								'DD.MM.YYYY, HH:mm'
						  );
				const moderator: any = await this.client.users
					.fetch(memberData.banned.moderator.id)
					.catch((): void => {});
				const text: string =
					'### ' +
					this.client.emotes.ban +
					' ' +
					ban[1].user.username +
					'\n' +
					this.client.emotes.arrow +
					' Begründung: ' +
					memberData.banned.reason +
					'\n' +
					this.client.emotes.arrow +
					' Moderator: ' +
					(moderator
						? moderator.username
						: memberData.banned.moderator.name) +
					'\n' +
					this.client.emotes.arrow +
					' Dauer: ' +
					duration +
					'\n' +
					this.client.emotes.arrow +
					' Gebannt am: ' +
					moment(memberData.banned.bannedAt).format(
						'DD.MM.YYYY, HH:mm'
					) +
					'\n' +
					this.client.emotes.arrow +
					' Gebannt bis: ' +
					bannedUntil +
					'\n';
				bannedUsers.push(text);
			} else {
				// Nicht mit Nevar gebannt
				const text: string =
					'### ' +
					this.client.emotes.ban +
					' ' +
					ban[1].user.username +
					'\n' +
					this.client.emotes.arrow +
					' Begründung: ' +
					ban[1].reason +
					'\n';
				bannedUsers.push(text);
			}
		}
		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			3,
			bannedUsers,
			'Gebannte Nutzer',
			'Es sind keine Nutzer gebannt',
			null
		);
	}
}
