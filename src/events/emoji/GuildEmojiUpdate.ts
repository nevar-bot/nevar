import BaseClient from "@structures/BaseClient.js";
import { AuditLogEvent, EmbedBuilder } from "discord.js";

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(oldEmoji: any, newEmoji: any): Promise<any> {
		/* Check if emojis or guild is null */
		if (!newEmoji || !oldEmoji || !newEmoji.guild) return;
		/* Return if the name is the same */
		if (oldEmoji.name === newEmoji.name) return;
		/* Destructure guild from emoji */
		const { guild } = newEmoji;

		/* Fetch audit logs to get moderator */
		const auditLogs: any = await guild.fetchAuditLogs({ type: AuditLogEvent["EmojiUpdate"], limit: 1 }).catch((): void => {});
		const moderator: any = auditLogs?.entries.first()?.executor;

		/* Create properties array */
		const properties: Array<string> = [];

		/* Push channel properties to properties array */
		if(oldEmoji.name !== newEmoji.name) properties.push(this.client.emotes.edit + " " + guild.translate("basics:name") + ": " + oldEmoji.name + " **➜** " + newEmoji.name);
		if(moderator) properties.push(this.client.emotes.user + " " + guild.translate("basics:moderator") + ": " + moderator.toString());

		/* If there are no properties, return */
		if (properties.length < 1) return;

		/* Prepare message for log embed */
		const emojiLogMessage: string =
			" ### " + this.client.emotes.events.emoji.update + " " + guild.translate("events/emoji/GuildEmojiUpdate:updated")+ "\n\n" +
			properties.join("\n");

		/* Create embed */
		const emojiLogEmbed: EmbedBuilder = this.client.createEmbed(emojiLogMessage, null, "normal");
		emojiLogEmbed.setThumbnail(newEmoji.imageURL());

		/* Log action */
		await guild.logAction(emojiLogEmbed, "guild");
	}
}
