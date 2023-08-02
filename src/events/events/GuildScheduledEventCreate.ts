import BaseClient from '@structures/BaseClient';
import { AuditLogEvent, EmbedBuilder } from 'discord.js';
import moment from 'moment';

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(scheduledEvent: any): Promise<void> {
		if (!scheduledEvent || !scheduledEvent.guild) return;
		const { guild } = scheduledEvent;

		const properties: Array<string> = [];
		if (scheduledEvent.name)
			properties.push(
				this.client.emotes.edit + ' Name: ' + scheduledEvent.name
			);
		if (scheduledEvent.id)
			properties.push(
				this.client.emotes.id + ' ID: ' + scheduledEvent.id
			);
		if (scheduledEvent.description)
			properties.push(
				this.client.emotes.text +
					' Beschreibung: ' +
					scheduledEvent.description
			);
		if (scheduledEvent.scheduledStartTimestamp)
			properties.push(
				this.client.emotes.reminder +
					' Startzeit: ' +
					moment(scheduledEvent.scheduledStartTimestamp).format(
						'DD.MM.YYYY HH:mm'
					)
			);
		if (scheduledEvent.scheduledEndTimestamp)
			properties.push(
				this.client.emotes.reminder +
					' Endzeit: ' +
					moment(scheduledEvent.scheduledEndTimestamp).format(
						'DD.MM.YYYY HH:mm'
					)
			);

		let scheduledEventLogMessage: string = properties.join('\n');

		const auditLogs: any = await guild
			.fetchAuditLogs({
				type: AuditLogEvent['GuildScheduledEventCreate'],
				limit: 1
			})
			.catch((e: any): void => {});
		if (auditLogs) {
			const auditLogEntry: any = auditLogs.entries.first();
			if (auditLogEntry) {
				const moderator: any = auditLogEntry.executor;
				if (moderator)
					scheduledEventLogMessage +=
						'\n\n' +
						this.client.emotes.user +
						' Nutzer: ' +
						"**" + moderator.displayName + "** (@" + moderator.username + ")";
			}
		}

		const scheduledEventLogEmbed: EmbedBuilder = this.client.createEmbed(
			scheduledEventLogMessage,
			null,
			'success'
		);
		scheduledEventLogEmbed.setTitle(
			this.client.emotes.events.event.create + 'Event erstellt'
		);
		scheduledEventLogEmbed.setThumbnail(guild.iconURL());

		await guild.logAction(scheduledEventLogEmbed, 'guild');
	}
}
