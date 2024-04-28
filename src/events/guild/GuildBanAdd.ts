import { NevarClient } from "@core/NevarClient";
import { AuditLogEvent, EmbedBuilder } from "discord.js";

export default class {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async dispatch(ban: any): Promise<void> {
		/* Fetch ban */
		await ban.fetch().catch((e: any): void => {});
		/* Check if ban or guild is null */
		if (!ban || !ban.guild) return;
		/* Destructure guild from ban */
		const { guild } = ban;

		/* Fetch audit logs to get moderator */
		const auditLogs: any = await guild.fetchAuditLogs({ type: AuditLogEvent["MemberBanAdd"], limit: 1 }).catch((): void => {});
		const moderator: any = auditLogs?.entries.first()?.executor;

		const banLogMessage: string =
			"### " + guild.translate("events/guild/GuildBanAdd:banned") + "\n\n" +
			this.client.emotes.user + " " + guild.translate("basics:user") + ": " + ban.user.toString() + "\n" +
			this.client.emotes.text + " " + guild.translate("basics:reason") + ": " + (ban.reason ? ban.reason : "N/A") + "\n" +
			(moderator ? this.client.emotes.user + " " + guild.translate("basics:moderator") + ": " + moderator.toString() : "");

		/* Create embed */
		const banLogEmbed: EmbedBuilder = this.client.createEmbed(banLogMessage, null, "error");
		banLogEmbed.setThumbnail(ban.user.displayAvatarURL() || guild.iconURL());

		/* Log action */
		await guild.logAction(banLogEmbed, "moderation");
	}
}
