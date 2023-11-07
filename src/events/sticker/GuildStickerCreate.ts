import BaseClient from "@structures/BaseClient";
import { AuditLogEvent, EmbedBuilder } from "discord.js";

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(sticker: any): Promise<any> {
		await sticker.fetchUser().catch((e: any): void => {});
		if (!sticker || !sticker.user || !sticker.guild) return;
		const { guild } = sticker;

		let stickerLogMessage: string =
			this.client.emotes.edit +
			" Name: " +
			sticker.name +
			"\n" +
			this.client.emotes.id +
			" ID: " +
			sticker.id;

		const auditLogs: any = await guild
			.fetchAuditLogs({ type: AuditLogEvent["StickerCreate"], limit: 1 })
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

		const stickerLogEmbed: EmbedBuilder = this.client.createEmbed(
			stickerLogMessage,
			null,
			"success"
		);
		stickerLogEmbed.setTitle(this.client.emotes.events.sticker.create + " Sticker erstellt");
		stickerLogEmbed.setThumbnail(sticker.url);

		await guild.logAction(stickerLogEmbed, "guild");
	}
}
