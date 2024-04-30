import { NevarClient } from "@core/NevarClient";
import { AuditLogEvent, EmbedBuilder } from "discord.js";
import moment from "moment";

export default class {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async dispatch(scheduledEvent: any): Promise<void> {
		/* Check if event or guild is null */
		if (!scheduledEvent || !scheduledEvent.guild) return;
		/* Destructure guild from event */
		const { guild } = scheduledEvent;

		/* Fetch audit logs to get moderator */
		const auditLogs: any = await guild.fetchAuditLogs({ type: AuditLogEvent["GuildScheduledEventDelete"], limit: 1 }).catch((): void => {});
		const moderator: any = auditLogs?.entries.first()?.executor;

		/* Create properties array */
		const properties: Array<string> = [];

		/* Push event properties to properties array */
		if(scheduledEvent.name) properties.push(this.client.emotes.edit + " " + guild.translate("basics:name") + ": " + scheduledEvent.name);
		if(moderator) properties.push(this.client.emotes.user + " " + guild.translate("basics:moderator") + ": " + moderator.toString());

		/* If there are no properties, return */
		if (properties.length < 1) return;


		/* Prepare message for log embed */
		const scheduledEventLogMessage: string =
			" ### " + this.client.emotes.events.event.delete + " " + guild.translate("events/events/GuildScheduledEventDelete:deleted")+ "\n\n" +
			properties.join("\n");

		/* Create embed */
		const scheduledEventLogEmbed: EmbedBuilder = this.client.createEmbed(scheduledEventLogMessage, null, "error");
		scheduledEventLogEmbed.setThumbnail(moderator.displayAvatarURL() || guild.iconURL());

		/* Log action */
		await guild.logAction(scheduledEventLogEmbed, "guild");
	}
}
