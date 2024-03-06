import BaseClient from "@structures/BaseClient.js";
import { AuditLogEvent, EmbedBuilder } from "discord.js";

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(emoji: any): Promise<any> {
		/* Check if emoji or guild is null */
		if (!emoji || !emoji.guild) return;
		/* Destructure guild from emoji */
		const { guild } = emoji;

		/* Fetch audit logs to get moderator */
		const auditLogs: any = await guild.fetchAuditLogs({ type: AuditLogEvent["EmojiCreate"], limit: 1 }).catch((): void => {});
		const moderator: any = auditLogs?.entries.first()?.executor;

		/* Create properties array */
		const properties: Array<string> = [];

		/* Push emoji properties to properties array */
		if(emoji.name) properties.push(this.client.emotes.edit + " " + guild.translate("basics:name") + ": " + emoji.name);
		if(emoji.id) properties.push(this.client.emotes.id + " " + guild.translate("basics:id") + ": " + emoji.id);
		if(moderator) properties.push(this.client.emotes.user + " " + guild.translate("basics:moderator") + ": " + moderator.toString());

		/* If there are no properties, return */
		if (properties.length < 1) return;

		/* Prepare message for log embed */
		const emojiLogMessage: string =
			" ### " + this.client.emotes.events.emoji.create + " " + guild.translate("events/emoji/GuildEmojiCreate:created")+ "\n\n" +
			properties.join("\n");

		/* Create embed */
		const emojiLogEmbed: EmbedBuilder = this.client.createEmbed(emojiLogMessage, null, "success");
		emojiLogEmbed.setThumbnail(emoji.imageURL());

		/* Log action */
		await guild.logAction(emojiLogEmbed, "guild");
	}
}
