import { NevarClient } from "@core/NevarClient";
import { AuditLogEvent, EmbedBuilder } from "discord.js";

export default class {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async dispatch(role: any): Promise<any> {
		if (!role || !role.guild) return;

		const { guild } = role;

		let roleLogMessage: string =
			this.client.emotes.edit + " Name: " + role.name + "\n" + this.client.emotes.id + " ID: " + role.id;

		const auditLogs: any = await guild
			.fetchAuditLogs({ type: AuditLogEvent["RoleDelete"], limit: 1 })
			.catch((e: any): void => {});
		if (auditLogs) {
			const auditLogEntry: any = auditLogs.entries.first();
			if (auditLogEntry) {
				const moderator: any = auditLogEntry.executor;
				if (moderator)
					roleLogMessage +=
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

		const roleLogEmbed: EmbedBuilder = this.client.createEmbed(roleLogMessage, null, "error");
		roleLogEmbed.setTitle(this.client.emotes.events.role.delete + " Rolle gelöscht");
		roleLogEmbed.setThumbnail(guild.iconURL());

		await guild.logAction(roleLogEmbed, "role");
	}
}
