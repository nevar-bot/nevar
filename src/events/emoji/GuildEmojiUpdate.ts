import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";

export default class
{
    public client: BaseClient;

    constructor(client: BaseClient)
    {
        this.client = client;
    }

    async dispatch(oldEmoji: any, newEmoji: any): Promise<any>
    {
        if(!newEmoji || !oldEmoji || !newEmoji.guild) return;
        if(oldEmoji.name === newEmoji.name) return;

        const { guild } = newEmoji;
        const emojiLogMessage: string =
            this.client.emotes.edit + " Name: ~~" + oldEmoji.name + "~~ **" + newEmoji.name + "**";

        const emojiLogEmbed: EmbedBuilder = this.client.createEmbed(emojiLogMessage, null, "warning");
        emojiLogEmbed.setTitle(this.client.emotes.events.emoji.update + " Emoji bearbeitet");
        emojiLogEmbed.setThumbnail(newEmoji.url);

        await guild.logAction(emojiLogEmbed, "guild");
    }
}