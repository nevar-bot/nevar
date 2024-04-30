import { NevarClient } from "@core/NevarClient";
import { AuditLogEvent, EmbedBuilder } from "discord.js";

export default class {
	private client: NevarClient;
	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async dispatch(channel: any): Promise<any> {
		/* Check if channel or guild is null */
		if (!channel || !channel.guild) return;
		/* Destructure guild from channel */
		const { guild } = channel;

		/* Fetch audit logs to get moderator */
		const auditLogs: any = await guild.fetchAuditLogs({ type: AuditLogEvent["ChannelDelete"], limit: 1 }).catch((): void => {});
		const moderator: any = auditLogs?.entries.first()?.executor;

		/* Create properties array */
		const properties: Array<string> = [];

		/* Push channel properties to properties array */
		if(channel.name) properties.push(this.client.emotes.channel + " " + guild.translate("basics:name") + ": " + channel.name);
		if(moderator) properties.push(this.client.emotes.user + " " + guild.translate("basics:moderator") + ": " + moderator.toString());
		/* If there are no properties, return */
		if (properties.length < 1) return;

		/* Prepare message for log embed */
		const channelLogMessage: string =
			" ### " + this.client.emotes.events.channel.delete + " " + guild.translate("ChannelTypes:" + channel.type) + " " + guild.translate("events/channel/ChannelDelete:deleted")+ "\n\n" +
			properties.join("\n");

		/* Create embed */
		const channelLogEmbed: EmbedBuilder = this.client.createEmbed(channelLogMessage, null, "error");
		channelLogEmbed.setThumbnail(moderator?.displayAvatarURL() || guild.iconURL());

		/* Log action */
		await guild.logAction(channelLogEmbed, "channel");
	}
}
