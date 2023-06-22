import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";

export default class
{
    private client: BaseClient;

    public constructor(client: BaseClient)
    {
        this.client = client;
    }

    public async dispatch(thread: any, newlyCreated: boolean): Promise<any>
    {
        if(!thread || !thread.guild) return;
        const { guild } = thread;

        const threadLogMessage: string =
            this.client.emotes.edit + " Name: " + thread.name + "\n" +
            this.client.emotes.id + " ID: "+ thread.id + "\n" +
            this.client.emotes.list + " Typ: " + this.client.channelTypes[thread.type] + "\n" +
            this.client.emotes.user + " Ersteller: " + (await thread.fetchOwner()).user.username;

        const threadLogEmbed: EmbedBuilder = this.client.createEmbed(threadLogMessage, null, "success");
        threadLogEmbed.setTitle(this.client.emotes.events.thread.create + " Thread erstellt");
        threadLogEmbed.setThumbnail(guild.iconURL());

        await guild.logAction(threadLogEmbed, "thread");
    }
}