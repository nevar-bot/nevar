import { NevarClient } from "@core/NevarClient";
import { AuditLogEvent, EmbedBuilder } from "discord.js";

export default class {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async dispatch(sticker: any): Promise<any> {
		if (!sticker || !sticker.guild) return;
		const { guild } = sticker;

		let stickerLogMessage: string =
			this.client.emotes.edit + " Name: " + sticker.name + "\n" + this.client.emotes.id + " ID: " + sticker.id;

		const auditLogs: any = await guild
			.fetchAuditLogs({ type: AuditLogEvent["StickerDelete"], limit: 1 })
			.catch((e: any): void => {});
		if (auditLogs) {
			const auditLogEntry: any = auditLogs.entries.first();
			if (auditLogEntry) {
				const moderator: any = auditLogEntry.executor;
				if (moderator)
					stickerLogMessage +=
						"\n\n" +
						this.client.emotes.user +
						" Nutzer/-in: " +
						"**" +
						moderator.displayName +
						"** (@" +
						moderator.username +
						")";
			}
		}

		const stickerLogEmbed: EmbedBuilder = this.client.createEmbed(stickerLogMessage, null, "error");
		stickerLogEmbed.setTitle(this.client.emotes.events.sticker.delete + " Sticker gelöscht");
		stickerLogEmbed.setThumbnail(sticker.url);

		await guild.logAction(stickerLogEmbed, "guild");
	}
}
