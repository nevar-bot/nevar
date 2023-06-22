import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";

export default class
{
    public client: BaseClient;

    constructor(client: BaseClient)
    {
        this.client = client;
    }

    async dispatch(sticker: any): Promise<any>
    {
        if(!sticker || !sticker.guild) return;
        const { guild } = sticker;

        const stickerLogMessage: string =
            this.client.emotes.edit + " Name: " + sticker.name + "\n" +
            this.client.emotes.id + " ID: "+ sticker.id;

        const stickerLogEmbed: EmbedBuilder = this.client.createEmbed(stickerLogMessage, null, "error");
        stickerLogEmbed.setTitle(this.client.emotes.events.sticker.delete + " Sticker gelöscht");
        stickerLogEmbed.setThumbnail(sticker.url);

        await guild.logAction(stickerLogEmbed, "guild");
    }
}