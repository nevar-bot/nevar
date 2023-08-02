import BaseClient from '@structures/BaseClient';
import { AuditLogEvent, EmbedBuilder } from 'discord.js';

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(thread: any): Promise<any> {
		if (!thread || !thread.guild) return;
		const { guild } = thread;

		let threadLogMessage: string =
			this.client.emotes.edit +
			' Name: ' +
			thread.name +
			'\n' +
			this.client.emotes.id +
			' ID: ' +
			thread.id +
			'\n' +
			this.client.emotes.list +
			' Typ: ' +
			this.client.channelTypes[thread.type];

		const auditLogs: any = await guild
			.fetchAuditLogs({ type: AuditLogEvent['ThreadDelete'], limit: 1 })
			.catch((e: any): void => {});
		if (auditLogs) {
			const auditLogEntry: any = auditLogs.entries.first();
			if (auditLogEntry) {
				const moderator: any = auditLogEntry.executor;
				if (moderator)
					threadLogMessage +=
						'\n\n' +
						this.client.emotes.user +
						' Nutzer: ' +
						'**' +
						moderator.displayName +
						'** (@' +
						moderator.username +
						')';
			}
		}

		const threadLogEmbed: EmbedBuilder = this.client.createEmbed(
			threadLogMessage,
			null,
			'error'
		);
		threadLogEmbed.setTitle(
			this.client.emotes.events.thread.delete + ' Thread gelöscht'
		);
		threadLogEmbed.setThumbnail(guild.iconURL());

		await guild.logAction(threadLogEmbed, 'thread');
	}
}
