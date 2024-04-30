import { NevarClient } from "@core/NevarClient";
import { AuditLogEvent, EmbedBuilder } from "discord.js";

export default class {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async dispatch(role: any): Promise<any> {
		/* Check if event or guild is null */
		if (!role || !role.guild) return;
		/* Destructure guild from event */
		const { guild } = role;

		/* Fetch audit logs to get moderator */
		const auditLogs: any = await guild.fetchAuditLogs({ type: AuditLogEvent["GuildRoleDelete"], limit: 1 }).catch((): void => {});
		const moderator: any = auditLogs?.entries.first()?.executor;

		/* Create properties array */
		const properties: Array<string> = [];

		/* Push event properties to properties array */
		if(role.name) properties.push(this.client.emotes.edit + " " + guild.translate("basics:name") + ": " + role.name);
		if(moderator) properties.push(this.client.emotes.user + " " + guild.translate("basics:moderator") + ": " + moderator.toString());

		/* If there are no properties, return */
		if (properties.length < 1) return;

		/* Prepare message for log embed */
		const roleLogMessage: string =
			" ### " + this.client.emotes.events.event.delete + " " + guild.translate("events/role/GuildRoleDelete:deleted")+ "\n\n" +
			properties.join("\n");

		/* Create embed */
		const roleLogEmbed: EmbedBuilder = this.client.createEmbed(roleLogMessage, null, "error");
		roleLogEmbed.setThumbnail(moderator.displayAvatarURL() || guild.iconURL());

		/* Log action */
		await guild.logAction(roleLogEmbed, "role");
	}
}
