import BaseClient from '@structures/BaseClient';
import { EmbedBuilder } from 'discord.js';
import moment from 'moment';

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(guild: any): Promise<any> {
		if (!guild || !guild.ownerId || !guild.id) return;

		/* Delete guild invites from invite cache */
		this.client.invites.delete(guild.id);

		/* Support log message */
		const supportGuild: any = this.client.guilds.cache.get(
			this.client.config.support['ID']
		);
		if (!supportGuild) return;

		const supportLogChannel: any = supportGuild.channels.cache.get(
			this.client.config.support['BOT_LOG']
		);
		if (!supportLogChannel) return;

		const owner: any = await this.client.users
			.fetch(guild.ownerId)
			.catch((e: any): void => {});
		const createdAt: string = moment(guild.createdTimestamp).format(
			'DD.MM.YYYY, HH:mm'
		);
		const createdDiff: string = this.client.utils.getRelativeTime(
			guild.createdTimestamp
		);

		const supportGuildLogMessage: string =
			'Name: **' +
			guild.name +
			'**\n' +
			this.client.emotes.crown +
			' Eigentümer: **' +
			(owner ? owner.displayName + ' (@' + owner.username + ')' : 'N/A') +
			'**\n' +
			this.client.emotes.id +
			' ID: **' +
			guild.id +
			'**\n' +
			this.client.emotes.users +
			' Mitglieder: **' +
			guild.memberCount +
			'**\n' +
			this.client.emotes.calendar +
			' Erstellt am: **' +
			createdAt +
			'**\n' +
			this.client.emotes.reminder +
			' Erstellt vor: **' +
			createdDiff +
			'**';

		const supportGuildLogEmbed: EmbedBuilder = this.client.createEmbed(
			supportGuildLogMessage,
			'discord',
			'error'
		);
		supportGuildLogEmbed.setTitle(
			this.client.user!.username + ' wurde von einem Server entfernt'
		);
		supportGuildLogEmbed.setThumbnail(
			guild.iconURL({ dynamic: true, size: 512 })
		);

		await supportLogChannel
			.send({ embeds: [supportGuildLogEmbed] })
			.catch((e: any): void => {});
	}
}
