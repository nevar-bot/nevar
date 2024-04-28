import { NevarClient } from "@core/NevarClient";
import { AuditLogEvent, EmbedBuilder } from "discord.js";

export default class {
	private client: NevarClient;
	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async dispatch(oldChannel: any, newChannel: any): Promise<any> {
		/* Check if channels or guild is null */
		if (!oldChannel || !newChannel || !newChannel.guild) return;
		/* Destructure guild from channel */
		const { guild } = newChannel;

		/* Fetch audit logs to get moderator */
		const auditLogs: any = await guild.fetchAuditLogs({ type: AuditLogEvent["ChannelUpdate"], limit: 1 }).catch((): void => {});
		const moderator: any = auditLogs?.entries.first()?.executor;

		/* Create properties array */
		const properties: Array<string> = [];

		/* Push channel properties to properties array */
		if(newChannel.toString()) properties.push(this.client.emotes.channel + " " + guild.translate("basics:channel") + ": " + newChannel.toString());
		if(moderator) properties.push(this.client.emotes.user + " " + guild.translate("basics:moderator") + ": " + moderator.toString());
		if(oldChannel.name !== newChannel.name) properties.push(this.client.emotes.edit + " " + guild.translate("basics:name") + ": " + oldChannel.name + " **➜** " + newChannel.name);
		if(oldChannel.topic !== newChannel.topic && (newChannel.topic || oldChannel.topic)) properties.push(this.client.emotes.quotes + " " + guild.translate("events/channel/ChannelUpdate:channelTopic") + ": " + (oldChannel.topic || "/") + " **➜** " + (newChannel.topic || "/"));
		if(oldChannel.nsfw !== newChannel.nsfw) properties.push(this.client.emotes.underage + " " + guild.translate("events/channel/ChannelUpdate:nsfw") + ": " + (oldChannel.nsfw ? guild.translate("basics:enabled") : guild.translate("basics:disabled")) + " **➜** " + (newChannel.nsfw ? guild.translate("basics:enabled") : guild.translate("basics:disabled")));
		if(oldChannel.parentId !== newChannel.parentId) properties.push(this.client.emotes.list + " " + guild.translate("events/channel/ChannelUpdate:category") + ": " + (oldChannel.parent?.name ? oldChannel.parent.name : "/") + " **➜** " + (newChannel.parent?.name ? newChannel.parent.name : "/"));
		if(oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) properties.push(this.client.emotes.timeout + " " + guild.translate("events/channel/ChannelUpdate:slowmode") + ": " + (oldChannel.rateLimitPerUser ? oldChannel.rateLimitPerUser + "s" : guild.translate("basics:disabled")) + " **➜** " + (newChannel.rateLimitPerUser ? newChannel.rateLimitPerUser + "s" : guild.translate("basics:disabled")));
		if(oldChannel.bitrate !== newChannel.bitrate) properties.push(this.client.emotes.latency.good + " " + guild.translate("events/channel/ChannelUpdate:bitrate") + ": " + oldChannel.bitrate / 1000 + "kbps **➜** " + newChannel.bitrate / 1000 + "kbps");
		if(oldChannel.userLimit !== newChannel.userLimit) properties.push(this.client.emotes.users + " " + guild.translate("events/channel/ChannelUpdate:userlimit") + ": " + (oldChannel.userLimit === 0 ? guild.translate("events/channel/ChannelUpdate:unlimitedUsers") : oldChannel.userLimit) + " **➜** " + (newChannel.userLimit === 0 ? guild.translate("events/channel/ChannelUpdate:unlimitedUsers") : newChannel.userLimit))
		if(oldChannel.videoQualityMode !== newChannel.videoQualityMode) properties.push(this.client.emotes.monitor + " " + guild.translate("events/channel/ChannelUpdate:videoQuality") + ": " + (oldChannel.videoQualityMode === 1 ? guild.translate("events/channel/ChannelUpdate:videoQualityAuto") : "720p") + " **➜** " + (newChannel.videoQualityMode === 1 ? guild.translate("events/channel/ChannelUpdate:videoQualityAuto") : "720p"))

		/* If there are no properties, return */
		if (properties.length < 3) return;

		/* Prepare message for log embed */
		const channelLogMessage: string =
			" ### " + this.client.emotes.events.channel.update + " " + guild.translate("ChannelTypes:" + newChannel.type) + " " + guild.translate("events/channel/ChannelUpdate:updated")+ "\n\n" +
			properties.join("\n");

		/* Create embed */
		const channelLogEmbed: EmbedBuilder = this.client.createEmbed(channelLogMessage, null, "normal");
		channelLogEmbed.setThumbnail(moderator?.displayAvatarURL() || guild.iconURL());

		/* Log action */
		await guild.logAction(channelLogEmbed, "channel");
	}
}
