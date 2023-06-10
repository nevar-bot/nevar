import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";

export default class {
    public client: BaseClient;

    constructor(client: BaseClient) {
        this.client = client;
    }

    async dispatch(emoji: any): Promise<any> {
        await emoji.fetchAuthor().catch((e: any): void => {});
        if(!emoji || !emoji.author || !emoji.guild) return;
        const { guild } = emoji;

        const emojiLogMessage: string =
            this.client.emotes.edit + " Name: " + emoji.name + "\n" +
            this.client.emotes.id + " ID: "+ emoji.id + "\n" +
            this.client.emotes.user + " Ersteller: " + emoji.author.tag;

        const emojiLogEmbed: EmbedBuilder = this.client.createEmbed(emojiLogMessage, null, "success");
        emojiLogEmbed.setTitle(this.client.emotes.events.emoji.create + " Emoji erstellt");
        emojiLogEmbed.setThumbnail(emoji.url);

        await guild.logAction(emojiLogEmbed, "guild");
    }
}