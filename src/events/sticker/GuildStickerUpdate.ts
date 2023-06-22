import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";

export default class
{
    public client: BaseClient;

    constructor(client: BaseClient)
    {
        this.client = client;
    }

    async dispatch(oldSticker: any, newSticker: any): Promise<any>
    {
        if(!newSticker || !oldSticker || !newSticker.guild) return;
        if(oldSticker.name === newSticker.name) return;

        const { guild } = newSticker;
        const stickerLogMessage: string =
            this.client.emotes.edit + " Name: ~~" + oldSticker.name + "~~ **" + newSticker.name + "**";

        const stickerLogEmbed: EmbedBuilder = this.client.createEmbed(stickerLogMessage, null, "warning");
        stickerLogEmbed.setTitle(this.client.emotes.events.sticker.update + " Sticker bearbeitet");
        stickerLogEmbed.setThumbnail(newSticker.url);

        await guild.logAction(stickerLogEmbed, "guild");
    }
}