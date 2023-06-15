import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";
import moment from "moment";

export default class
{
    public client: BaseClient;

    constructor(client: BaseClient)
    {
        this.client = client;
    }

    async dispatch(scheduledEvent: any): Promise<void>
    {
        if(!scheduledEvent || !scheduledEvent.guild) return;
        const { guild } = scheduledEvent;

        const properties: Array<string> = [];
        if(scheduledEvent.name) properties.push(this.client.emotes.edit + " Name: " + scheduledEvent.name);
        if(scheduledEvent.id) properties.push(this.client.emotes.id + " ID: " + scheduledEvent.id);
        if(scheduledEvent.description) properties.push(this.client.emotes.text + " Beschreibung: " + scheduledEvent.description);
        if(scheduledEvent.scheduledStartTimestamp) properties.push(this.client.emotes.reminder + " Startzeit: " + moment(scheduledEvent.scheduledStartTimestamp).format("DD.MM.YYYY HH:mm"));
        if(scheduledEvent.scheduledEndTimestamp) properties.push(this.client.emotes.reminder + " Endzeit: " + moment(scheduledEvent.scheduledEndTimestamp).format("DD.MM.YYYY HH:mm"));

        const scheduledEventLogMessage: string =
            properties.join("\n");

        const scheduledEventLogEmbed: EmbedBuilder = this.client.createEmbed(scheduledEventLogMessage, null, "error");
        scheduledEventLogEmbed.setTitle(this.client.emotes.events.event.delete + "Event gelöscht");
        scheduledEventLogEmbed.setThumbnail(guild.iconURL());

        await guild.logAction(scheduledEventLogEmbed, "guild");
    }
}