/** @format */

import BaseClient from '@structures/BaseClient';
import { AuditLogEvent, EmbedBuilder } from 'discord.js';

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(emoji: any): Promise<any> {
		if (!emoji || !emoji.guild) return;
		const { guild } = emoji;

		let emojiLogMessage: string =
			this.client.emotes.edit +
			' Name: ' +
			emoji.name +
			'\n' +
			this.client.emotes.id +
			' ID: ' +
			emoji.id;

		const auditLogs: any = await guild
			.fetchAuditLogs({ type: AuditLogEvent['EmojiDelete'], limit: 1 })
			.catch((e: any): void => {});
		if (auditLogs) {
			const auditLogEntry: any = auditLogs.entries.first();
			if (auditLogEntry) {
				const moderator: any = auditLogEntry.executor;
				if (moderator)
					emojiLogMessage +=
						'\n\n' +
						this.client.emotes.user +
						' Nutzer: ' +
						"**" + moderator.displayName + "** (@" + moderator.username + ")";
			}
		}

		const emojiLogEmbed: EmbedBuilder = this.client.createEmbed(
			emojiLogMessage,
			null,
			'error'
		);
		emojiLogEmbed.setTitle(
			this.client.emotes.events.emoji.delete + ' Emoji gelöscht'
		);
		emojiLogEmbed.setThumbnail(emoji.url);

		await guild.logAction(emojiLogEmbed, 'guild');
	}
}
