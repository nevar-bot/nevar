import BaseClient from "@structures/BaseClient";
import { AuditLogEvent, EmbedBuilder } from "discord.js";

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(oldSticker: any, newSticker: any): Promise<any> {
		if (!newSticker || !oldSticker || !newSticker.guild) return;
		if (oldSticker.name === newSticker.name) return;

		const { guild } = newSticker;
		let stickerLogMessage: string = this.client.emotes.edit + " Name: ~~" + oldSticker.name + "~~ **" + newSticker.name + "**";

		const auditLogs: any = await guild.fetchAuditLogs({ type: AuditLogEvent["StickerUpdate"], limit: 1 }).catch((e: any): void => {});
		if (auditLogs) {
			const auditLogEntry: any = auditLogs.entries.first();
			if (auditLogEntry) {
				const moderator: any = auditLogEntry.executor;
				if (moderator)
					stickerLogMessage +=
						"\n\n" + this.client.emotes.user + " Nutzer: " + "**" + moderator.displayName + "** (@" + moderator.username + ")";
			}
		}

		const stickerLogEmbed: EmbedBuilder = this.client.createEmbed(stickerLogMessage, null, "warning");
		stickerLogEmbed.setTitle(this.client.emotes.events.sticker.update + " Sticker bearbeitet");
		stickerLogEmbed.setThumbnail(newSticker.url);

		await guild.logAction(stickerLogEmbed, "guild");
	}
}
