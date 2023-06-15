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

    async dispatch(oldScheduledEvent: any, newScheduledEvent: any): Promise<any>
    {
        if(!oldScheduledEvent || !newScheduledEvent || !newScheduledEvent.guild) return;
        const { guild } = newScheduledEvent;

        const properties: Array<string> = [];
        if(oldScheduledEvent.name !== newScheduledEvent.name) properties.push(this.client.emotes.edit + " Name: ~~" + oldScheduledEvent.name + "~~ **" + newScheduledEvent.name + "**");
        if(oldScheduledEvent.description !== newScheduledEvent.description) properties.push(this.client.emotes.text + " Beschreibung: ~~" + oldScheduledEvent.description + "~~ **" + newScheduledEvent.description + "**");
        if(oldScheduledEvent.scheduledStartTimestamp !== newScheduledEvent.scheduledStartTimestamp) properties.push(this.client.emotes.reminder + " Startzeit: ~~" + (oldScheduledEvent.scheduledStartTimestamp ? moment(oldScheduledEvent.scheduledStartTimestamp).format("DD.MM.YYYY HH:mm") : "/") + "~~ **" + (newScheduledEvent.scheduledStartTimestamp ? moment(newScheduledEvent.scheduledStartTimestamp).format("DD.MM.YYYY HH:mm") : "/") + "**");
        if(oldScheduledEvent.scheduledEndTimestamp !== newScheduledEvent.scheduledEndTimestamp) properties.push(this.client.emotes.reminder + " Startzeit: ~~" + (oldScheduledEvent.scheduledEndTimestamp ? moment(oldScheduledEvent.scheduledEndTimestamp).format("DD.MM.YYYY HH:mm") : "/") + "~~ **" + (newScheduledEvent.scheduledEndTimestamp ? moment(newScheduledEvent.scheduledEndTimestamp).format("DD.MM.YYYY HH:mm") : "/") + "**");
        if(properties.length < 1) return;

        const scheduledEventLogMessage: string =
            properties.join("\n");

        const scheduledEventLogEmbed: EmbedBuilder = this.client.createEmbed(scheduledEventLogMessage, null, "warning");
        scheduledEventLogEmbed.setTitle(this.client.emotes.events.event.update + "Event bearbeitet");
        scheduledEventLogEmbed.setThumbnail(guild.iconURL());

        await guild.logAction(scheduledEventLogEmbed, "guild");
    }
}