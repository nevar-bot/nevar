import BaseClient from "@structures/BaseClient.js";
import { AuditLogEvent, EmbedBuilder } from "discord.js";

export default class {
	private client: BaseClient;
	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(channel: any): Promise<any> {
		if (!channel || !channel.guild) return;
		const { guild } = channel;

		const properties: Array<string> = [];
		if (channel.name) properties.push(this.client.emotes.edit + " Name: " + channel.name);
		if (channel.id) properties.push(this.client.emotes.id + " ID: " + channel.id);
		if (channel.topic) properties.push(this.client.emotes.quotes + " Thema: " + channel.topic);
		if (channel.nsfw)
			properties.push(
				this.client.emotes.underage + " Altersbegrenzung: " + (channel.nsfw ? "aktiviert" : "deaktiviert"),
			);
		if (channel.bitrate)
			properties.push(this.client.emotes.latency.good + " Bitrate: " + channel.bitrate / 1000 + "kbps");
		if (channel.userLimit)
			properties.push(
				this.client.emotes.users +
					" Userlimit: " +
					(channel.userLimit === 0 ? "unbegrenzt" : channel.userLimit),
			);
		if (channel.videoQualityMode)
			properties.push(
				this.client.emotes.monitor +
					" Videoqualität: " +
					(channel.videoQualityMode === 1 ? "automatisch" : "720p"),
			);
		if (properties.length < 1) return;

		let channelLogMessage: string = properties.join("\n");

		const auditLogs: any = await guild
			.fetchAuditLogs({ type: AuditLogEvent["ChannelDelete"], limit: 1 })
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

		const channelLogEmbed: EmbedBuilder = this.client.createEmbed(channelLogMessage, null, "error");
		channelLogEmbed.setTitle(
			this.client.emotes.events.channel.delete + " " + this.client.channelTypes[channel.type] + " gelöscht",
		);
		channelLogEmbed.setThumbnail(guild.iconURL());

		await guild.logAction(channelLogEmbed, "channel");
	}
}
