import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";

export default class
{
    private client: BaseClient;
    public constructor(client: BaseClient)
    {
        this.client = client;
    }

    public async dispatch(oldThread: any, newThread: any): Promise<any>
    {
        if(!oldThread || !newThread || !newThread.guild) return;
        const { guild } = newThread;

        const properties: Array<string> = [];
        if(oldThread.name !== newThread.name) properties.push(this.client.emotes.edit + " Name: ~~" + oldThread.name + "~~ **" + newThread.name + "**");
        if(oldThread.archived !== newThread.archived) properties.push(this.client.emotes.quotes + " " + (newThread.archived ? "Thread archiviert" : "Thread unarchiviert"));
        if(oldThread.locked !== newThread.locked) properties.push(this.client.emotes.quotes + " " + (newThread.locked ? "Thread gesperrt" : "Thread entsperrt"));
        if(oldThread.rateLimitPerUser !== newThread.rateLimitPerUser) properties.push(this.client.emotes.timeout + " Slow-Modus: ~~" + (oldThread.rateLimitPerUser ? oldThread.rateLimitPerUser + " Sekunde(n)" : "Kein Limit") + "~~ **" + (newThread.rateLimitPerUser ? newThread.rateLimitPerUser + " Sekunde(n)" : "Kein Limit") + "**");
        if(oldThread.type !== newThread.type) properties.push(this.client.emotes.list + " Typ: ~~" + this.client.channelTypes[oldThread.type] + "~~ **" + this.client.channelTypes[newThread.type] + "**");

        if(properties.length < 1) return;

        const threadLogMessage: string =
            this.client.emotes.channel + " Thread: " + newThread.toString() + "\n" +
            properties.join("\n");

        const threadLogEmbed: EmbedBuilder = this.client.createEmbed(threadLogMessage, null, "warning");
        threadLogEmbed.setTitle(this.client.emotes.events.thread.update + " " + this.client.channelTypes[newThread.type] + " bearbeitet");
        threadLogEmbed.setThumbnail(guild.iconURL());

        await guild.logAction(threadLogEmbed, "thread");
    }
}