import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";

export default class {
    public client: BaseClient;

    constructor(client: BaseClient) {
        this.client = client;
    }

    async dispatch(emoji: any): Promise<any> {
        if(!emoji || !emoji.guild) return;
        const { guild } = emoji;

        const emojiLogMessage: string =
            this.client.emotes.edit + " Name: " + emoji.name + "\n" +
            this.client.emotes.id + " ID: "+ emoji.id;

        const emojiLogEmbed: EmbedBuilder = this.client.createEmbed(emojiLogMessage, null, "error");
        emojiLogEmbed.setTitle(this.client.emotes.events.emoji.delete + " Emoji gelöscht");
        emojiLogEmbed.setThumbnail(emoji.url);

        await guild.logAction(emojiLogEmbed, "guild");
    }
}