/** @format */

import BaseCommand from '@structures/BaseCommand';
import BaseClient from '@structures/BaseClient';
import { SlashCommandBuilder } from 'discord.js';

export default class MyinvitesCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'myinvites',
			description: 'Zeigt Statistiken zu deinen Einladungen',
			cooldown: 3 * 1000,
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
		await this.showInvites(data.member);
	}

	private async showInvites(memberData: any): Promise<void> {
		const guildInvites: any = await this.interaction.guild.invites
			.fetch()
			.catch((): void => {});

		const memberInvites: any = guildInvites.filter(
			(i: any): boolean => i.inviterId === memberData.id
		);
		for (let invite of memberInvites.values()) {
			if (
				!this.client.invites
					.get(this.interaction.guild.id)
					.has(invite.code)
			)
				this.client.invites
					.get(this.interaction.guild.id)
					.set(invite.code, invite.uses);
			if (!memberData.invites) memberData.invites = [];
			if (
				!memberData.invites.find(
					(i: any): boolean => i.code === invite.code
				)
			)
				memberData.invites.push({
					code: invite.code,
					uses: invite.uses,
					fake: 0
				});
		}
		memberData.markModified('invites');
		await memberData.save();
		const invites = memberData.invites;
		const invitesData: any[] = [];
		for (const invite of invites) {
			invitesData.push(
				'### ' +
					this.client.emotes.invite +
					' discord.gg/' +
					invite.code +
					'\n' +
					this.client.emotes.users +
					' Verwendungen: **' +
					invite.uses +
					'**\n' +
					this.client.emotes.leave +
					' Server verlassen: **' +
					(invite.left || 0) +
					'**\n' +
					this.client.emotes.error +
					' Gefälscht: **' +
					(invite.fake || 0) +
					'**\n'
			);
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			5,
			invitesData,
			'Deine Einladungen',
			'Du hast noch keine Nutzer eingeladen',
			null
		);
	}
}
