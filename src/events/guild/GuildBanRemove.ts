import BaseClient from "@structures/BaseClient";
import { AuditLogEvent, EmbedBuilder } from "discord.js";

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(ban: any): Promise<void> {
		await ban.fetch().catch((e: any): void => {});
		if (!ban || !ban.guild) return;
		const { guild } = ban;

		let banLogMessage: string =
			this.client.emotes.user +
			" Nutzer: " +
			ban.user.displayName +
			" (@" +
			ban.user.username +
			")" +
			" (" +
			ban.user.id +
			")";

		const auditLogs: any = await guild
			.fetchAuditLogs({
				type: AuditLogEvent["MemberBanRemove"],
				limit: 1
			})
			.catch((e: any): void => {});
		if (auditLogs) {
			const auditLogEntry: any = auditLogs.entries.first();
			if (auditLogEntry) {
				const moderator: any = auditLogEntry.executor;
				if (moderator)
					banLogMessage +=
						"\n\n" +
						this.client.emotes.user +
						" Nutzer: " +
						"**" +
						moderator.displayName +
						"** (@" +
						moderator.username +
						")";
			}
		}

		const banLogEmbed: EmbedBuilder = this.client.createEmbed(
			banLogMessage,
			null,
			"success"
		);
		banLogEmbed.setTitle(
			this.client.emotes.events.member.unban + " Nutzer entbannt"
		);
		banLogEmbed.setThumbnail(ban.user.displayAvatarURL());

		await guild.logAction(banLogEmbed, "moderation");
	}
}
