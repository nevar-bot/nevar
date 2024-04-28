import { NevarClient } from "@core/NevarClient";
import { AuditLogEvent, EmbedBuilder } from "discord.js";

export default class {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async dispatch(oldScheduledEvent: any, newScheduledEvent: any): Promise<any> {
		/* Check if event or guild is null */
		if (!oldScheduledEvent || !newScheduledEvent || !newScheduledEvent.guild) return;
		/* Destructure guild from event */
		const { guild } = newScheduledEvent;

		/* Fetch audit logs to get moderator */
		const auditLogs: any = await guild.fetchAuditLogs({ type: AuditLogEvent["GuildScheduledEventUpdate"], limit: 1 }).catch((): void => {});
		const moderator: any = auditLogs?.entries.first()?.executor;

		/* Create properties array */
		const properties: Array<string> = [];

		/* Push event properties to properties array */
		if(oldScheduledEvent.name !== newScheduledEvent.name) properties.push(this.client.emotes.edit + " " + guild.translate("basics:name") + ": " + oldScheduledEvent.name + " **➜** " + newScheduledEvent.name);
		if(moderator) properties.push(this.client.emotes.user + " " + guild.translate("basics:moderator") + ": " + moderator.toString());
		if(oldScheduledEvent.description !== newScheduledEvent.description) properties.push(this.client.emotes.text + " " + guild.translate("basics:description") + ": " + oldScheduledEvent.description + " **➜** " + newScheduledEvent.description);
		if(oldScheduledEvent.scheduledStartTimestamp !== newScheduledEvent.scheduledStartTimestamp) properties.push(this.client.emotes.reminder + " " + guild.translate("events/events/GuildScheduledEventUpdate:start") + ": " + this.client.utils.getDiscordTimestamp(oldScheduledEvent.scheduledStartTimestamp, "F") + " **➜** " + this.client.utils.getDiscordTimestamp(newScheduledEvent.scheduledStartTimestamp, "F"))
		if(oldScheduledEvent.scheduledEndTimestamp !== newScheduledEvent.scheduledEndTimestamp) properties.push(this.client.emotes.reminder + " " + guild.translate("events/events/GuildScheduledEventUpdate:end") + ": " + this.client.utils.getDiscordTimestamp(oldScheduledEvent.scheduledEndTimestamp, "F") + " **➜** " + this.client.utils.getDiscordTimestamp(newScheduledEvent.scheduledEndTimestamp, "F"))

		/* If there are no properties, return */
		if (properties.length < 1) return;

		/* Prepare message for log embed */
		const scheduledEventLogMessage: string =
			" ### " + this.client.emotes.events.event.update + " " + guild.translate("events/events/GuildScheduledEventUpdate:updated")+ "\n\n" +
			properties.join("\n");

		/* Create embed */
		const scheduledEventLogEmbed: EmbedBuilder = this.client.createEmbed(scheduledEventLogMessage, null, "normal");
		scheduledEventLogEmbed.setThumbnail(moderator.displayAvatarURL() || guild.iconURL());

		/* Log action */
		await guild.logAction(scheduledEventLogEmbed, "guild");
	}
}
