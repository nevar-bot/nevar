import BaseClient from "@structures/BaseClient";
import { AuditLogEvent, EmbedBuilder } from "discord.js";

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(emoji: any): Promise<any> {
		await emoji.fetchAuthor().catch((e: any): void => {});
		if (!emoji || !emoji.author || !emoji.guild) return;
		const { guild } = emoji;

		let emojiLogMessage: string = this.client.emotes.edit + " Name: " + emoji.name + "\n" + this.client.emotes.id + " ID: " + emoji.id;

		const auditLogs: any = await guild.fetchAuditLogs({ type: AuditLogEvent["EmojiCreate"], limit: 1 }).catch((e: any): void => {});
		if (auditLogs) {
			const auditLogEntry: any = auditLogs.entries.first();
			if (auditLogEntry) {
				const moderator: any = auditLogEntry.executor;
				if (moderator)
					emojiLogMessage +=
						"\n\n" + this.client.emotes.user + " Nutzer/-in: " + "**" + moderator.displayName + "** (@" + moderator.username + ")";
			}
		}

		const emojiLogEmbed: EmbedBuilder = this.client.createEmbed(emojiLogMessage, null, "success");
		emojiLogEmbed.setTitle(this.client.emotes.events.emoji.create + " Emoji erstellt");
		emojiLogEmbed.setThumbnail(emoji.url);

		await guild.logAction(emojiLogEmbed, "guild");
	}
}
