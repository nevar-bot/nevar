import BaseClient from "@structures/BaseClient";
import { AuditLogEvent, EmbedBuilder } from "discord.js";
import moment from "moment";

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(
		oldScheduledEvent: any,
		newScheduledEvent: any
	): Promise<any> {
		if (
			!oldScheduledEvent ||
			!newScheduledEvent ||
			!newScheduledEvent.guild
		)
			return;
		const { guild } = newScheduledEvent;

		const properties: Array<string> = [];
		if (oldScheduledEvent.name !== newScheduledEvent.name)
			properties.push(
				this.client.emotes.edit +
					" Name: ~~" +
					oldScheduledEvent.name +
					"~~ **" +
					newScheduledEvent.name +
					"**"
			);
		if (oldScheduledEvent.description !== newScheduledEvent.description)
			properties.push(
				this.client.emotes.text +
					" Beschreibung: ~~" +
					oldScheduledEvent.description +
					"~~ **" +
					newScheduledEvent.description +
					"**"
			);
		if (
			oldScheduledEvent.scheduledStartTimestamp !==
			newScheduledEvent.scheduledStartTimestamp
		)
			properties.push(
				this.client.emotes.reminder +
					" Startzeit: ~~" +
					(oldScheduledEvent.scheduledStartTimestamp
						? moment(
								oldScheduledEvent.scheduledStartTimestamp
						  ).format("DD.MM.YYYY HH:mm")
						: "/") +
					"~~ **" +
					(newScheduledEvent.scheduledStartTimestamp
						? moment(
								newScheduledEvent.scheduledStartTimestamp
						  ).format("DD.MM.YYYY HH:mm")
						: "/") +
					"**"
			);
		if (
			oldScheduledEvent.scheduledEndTimestamp !==
			newScheduledEvent.scheduledEndTimestamp
		)
			properties.push(
				this.client.emotes.reminder +
					" Startzeit: ~~" +
					(oldScheduledEvent.scheduledEndTimestamp
						? moment(
								oldScheduledEvent.scheduledEndTimestamp
						  ).format("DD.MM.YYYY HH:mm")
						: "/") +
					"~~ **" +
					(newScheduledEvent.scheduledEndTimestamp
						? moment(
								newScheduledEvent.scheduledEndTimestamp
						  ).format("DD.MM.YYYY HH:mm")
						: "/") +
					"**"
			);
		if (properties.length < 1) return;

		let scheduledEventLogMessage: string = properties.join("\n");

		const auditLogs: any = await guild
			.fetchAuditLogs({
				type: AuditLogEvent["GuildScheduledEventUpdate"],
				limit: 1
			})
			.catch((e: any): void => {});
		if (auditLogs) {
			const auditLogEntry: any = auditLogs.entries.first();
			if (auditLogEntry) {
				const moderator: any = auditLogEntry.executor;
				if (moderator)
					scheduledEventLogMessage +=
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

		const scheduledEventLogEmbed: EmbedBuilder = this.client.createEmbed(
			scheduledEventLogMessage,
			null,
			"warning"
		);
		scheduledEventLogEmbed.setTitle(
			this.client.emotes.events.event.update + "Event bearbeitet"
		);
		scheduledEventLogEmbed.setThumbnail(guild.iconURL());

		await guild.logAction(scheduledEventLogEmbed, "guild");
	}
}
