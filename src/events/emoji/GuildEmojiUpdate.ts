/** @format */

import BaseClient from '@structures/BaseClient';
import { AuditLogEvent, EmbedBuilder } from 'discord.js';

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(oldEmoji: any, newEmoji: any): Promise<any> {
		if (!newEmoji || !oldEmoji || !newEmoji.guild) return;
		if (oldEmoji.name === newEmoji.name) return;

		const { guild } = newEmoji;
		let emojiLogMessage: string =
			this.client.emotes.edit +
			' Name: ~~' +
			oldEmoji.name +
			'~~ **' +
			newEmoji.name +
			'**';

		const auditLogs: any = await guild
			.fetchAuditLogs({ type: AuditLogEvent['EmojiUpdate'], limit: 1 })
			.catch((e: any): void => {});
		if (auditLogs) {
			const auditLogEntry: any = auditLogs.entries.first();
			if (auditLogEntry) {
				const moderator: any = auditLogEntry.executor;
				if (moderator)
					emojiLogMessage +=
						'\n\n' +
						this.client.emotes.user +
						' Moderator: ' +
						moderator.toString();
			}
		}

		const emojiLogEmbed: EmbedBuilder = this.client.createEmbed(
			emojiLogMessage,
			null,
			'warning'
		);
		emojiLogEmbed.setTitle(
			this.client.emotes.events.emoji.update + ' Emoji bearbeitet'
		);
		emojiLogEmbed.setThumbnail(newEmoji.url);

		await guild.logAction(emojiLogEmbed, 'guild');
	}
}
