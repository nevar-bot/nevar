import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";

export default class
{
    private client: BaseClient;

    public constructor(client: BaseClient)
    {
        this.client = client;
    }

    public async dispatch(thread: any): Promise<any>
    {
        if(!thread || !thread.guild) return;
        const { guild } = thread;

        const threadLogMessage: string =
            this.client.emotes.edit + " Name: " + thread.name + "\n" +
            this.client.emotes.id + " ID: "+ thread.id + "\n" +
            this.client.emotes.list + " Typ: " + this.client.channelTypes[thread.type];

        const threadLogEmbed: EmbedBuilder = this.client.createEmbed(threadLogMessage, null, "error");
        threadLogEmbed.setTitle(this.client.emotes.events.thread.delete + " Thread gelöscht");
        threadLogEmbed.setThumbnail(guild.iconURL());

        await guild.logAction(threadLogEmbed, "thread");
    }
}