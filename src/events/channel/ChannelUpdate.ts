import BaseClient from "@structures/BaseClient.js";
import { AuditLogEvent, EmbedBuilder } from "discord.js";

export default class {
	private client: BaseClient;
	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(oldChannel: any, newChannel: any): Promise<any> {
		if (!oldChannel || !newChannel || !newChannel.guild) return;
		const { guild } = newChannel;

		const properties: Array<string> = [];
		if (oldChannel.name !== newChannel.name)
			properties.push(this.client.emotes.edit + " Name: ~~" + oldChannel.name + "~~ **" + newChannel.name + "**");
		if (oldChannel.topic !== newChannel.topic)
			properties.push(
				this.client.emotes.quotes +
					" Thema: ~~" +
					(oldChannel.topic ? oldChannel.topic : "Kein Thema") +
					"~~ **" +
					(newChannel.topic ? newChannel.topic : "Kein Thema") +
					"**",
			);
		if (oldChannel.nsfw !== newChannel.nsfw)
			properties.push(
				this.client.emotes.underage +
					" Altersbegrenzung: ~~" +
					(oldChannel.nsfw ? "aktiv" : "inaktiv") +
					"~~ **" +
					(newChannel.nsfw ? "aktiv" : "inaktiv") +
					"**",
			);
		if (oldChannel.parentId !== newChannel.parentId)
			properties.push(
				this.client.emotes.list +
					" Kategorie: ~~" +
					(oldChannel.parent?.name ? oldChannel.parent.name : "/") +
					"~~ **" +
					(newChannel.parent?.name ? newChannel.parent.name : "/") +
					"**",
			);
		if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser)
			properties.push(
				this.client.emotes.timeout +
					" Slow-Modus: ~~" +
					(oldChannel.rateLimitPerUser ? oldChannel.rateLimitPerUser + " Sekunde(n)" : "Kein Limit") +
					"~~ **" +
					(newChannel.rateLimitPerUser ? newChannel.rateLimitPerUser + " Sekunde(n)" : "Kein Limit") +
					"**",
			);
		if (oldChannel.bitrate !== newChannel.bitrate)
			properties.push(
				this.client.emotes.latency.good +
					" Bitrate: ~~" +
					oldChannel.bitrate / 1000 +
					"kbps~~ **" +
					newChannel.bitrate / 1000 +
					"kbps**",
			);
		if (oldChannel.userLimit !== newChannel.userLimit)
			properties.push(
				this.client.emotes.users +
					" Userlimit: ~~" +
					(oldChannel.userLimit === 0 ? "unbegrenzt" : oldChannel.userLimit) +
					"~~ **" +
					(newChannel.userLimit === 0 ? "unbegrenzt" : newChannel.userLimit) +
					"**",
			);
		if (oldChannel.videoQualityMode !== newChannel.videoQualityMode)
			properties.push(
				this.client.emotes.monitor +
					" Videoqualität: ~~" +
					(oldChannel.videoQualityMode === 1 ? "automatisch" : "720p") +
					"~~ **" +
					(newChannel.videoQualityMode === 1 ? "automatisch" : "720p") +
					"**",
			);
		if (properties.length < 1) return;

		let channelLogMessage: string =
			this.client.emotes.channel + " Kanal: " + newChannel.toString() + "\n" + properties.join("\n");

		const auditLogs: any = await guild
			.fetchAuditLogs({ type: AuditLogEvent["ChannelUpdate"], limit: 1 })
			.catch((e: any): void => {});
		if (auditLogs) {
			const auditLogEntry: any = auditLogs.entries.first();
			if (auditLogEntry) {
				const moderator: any = auditLogEntry.executor;
				if (moderator)
					channelLogMessage +=
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

		const channelLogEmbed: EmbedBuilder = this.client.createEmbed(channelLogMessage, null, "warning");
		channelLogEmbed.setTitle(
			this.client.emotes.events.channel.update + " " + this.client.channelTypes[newChannel.type] + " bearbeitet",
		);
		channelLogEmbed.setThumbnail(guild.iconURL());

		await guild.logAction(channelLogEmbed, "channel");
	}
}
