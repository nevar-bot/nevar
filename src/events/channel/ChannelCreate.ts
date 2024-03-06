import BaseClient from "@structures/BaseClient.js";
import { EmbedBuilder, AuditLogEvent } from "discord.js";

export default class {
	private client: BaseClient;
	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(channel: any): Promise<any> {
		/* Check if channel or guild is null */
		if (!channel || !channel.guild) return;
		/* Destructure guild from channel */
		const { guild } = channel;

		/* Fetch audit logs to get moderator */
		const auditLogs: any = await guild.fetchAuditLogs({ type: AuditLogEvent["ChannelCreate"], limit: 1 }).catch((): void => {});
		const moderator: any = auditLogs?.entries.first()?.executor;

		/* Create properties array */
		const properties: Array<string> = [];

		/* Push channel properties to properties array */
		if(channel.toString()) properties.push(this.client.emotes.channel + " " + guild.translate("basics:name") + ": " + channel.toString());
		if(moderator) properties.push(this.client.emotes.user + " " + guild.translate("basics:moderator") + ": " + moderator.toString());
		if(channel.topic) properties.push(this.client.emotes.quotes + " " + guild.translate("events/channel/ChannelCreate:channelTopic") + ": " + channel.topic);
		if(channel.nsfw) properties.push(this.client.emotes.underage + " " + guild.translate("events/channel/ChannelCreate:nsfw") + ": " + guild.translate("basics:enabled"));
		if(channel.bitrate) properties.push(this.client.emotes.latency.good + " " + guild.translate("events/channel/ChannelCreate:bitrate") + ": " + channel.bitrate / 1000 + "kbps");
		if(channel.userLimit) properties.push(this.client.emotes.users + " " + guild.translate("events/channel/ChannelCreate:userlimit") + ": " + (channel.userLimit === 0 ? guild.translate("events/channel/ChannelCreate:unlimitedUsers") : channel.userLimit))
		if(channel.videoQualityMode) properties.push(this.client.emotes.monitor + " " + guild.translate("events/channel/ChannelCreate:videoQuality") + ": " + (channel.videoQualityMode === 1 ? guild.translate("events/channel/ChannelCreate:videoQualityAuto") : "720p"))

		/* If there are no properties, return */
		if (properties.length < 1) return;

		/* Prepare message for log embed */
		const channelLogMessage: string =
			" ### " + this.client.emotes.events.channel.create + " " + guild.translate("ChannelTypes:" + channel.type) + " " + guild.translate("events/channel/ChannelCreate:created")+ "\n\n" +
			properties.join("\n");

		/* Create embed */
 		const channelLogEmbed: EmbedBuilder = this.client.createEmbed(channelLogMessage, null, "success");
		channelLogEmbed.setThumbnail(moderator?.displayAvatarURL() || guild.iconURL());

		/* Log action */
		await guild.logAction(channelLogEmbed, "channel");
	}
}