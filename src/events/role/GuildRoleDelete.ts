import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";

export default class
{
    public client: BaseClient;

    constructor(client: BaseClient)
    {
        this.client = client;
    }

    async dispatch(role: any): Promise<any>
    {
        if(!role || !role.guild) return;

        const { guild } = role;

        const roleLogMessage: string =
            this.client.emotes.edit + " Name: " + role.name + "\n" +
            this.client.emotes.id + " ID: "+ role.id;

        const roleLogEmbed: EmbedBuilder = this.client.createEmbed(roleLogMessage, null, "error");
        roleLogEmbed.setTitle(this.client.emotes.events.role.delete + " Rolle gelöscht");
        roleLogEmbed.setThumbnail(guild.iconURL());

        await guild.logAction(roleLogEmbed, "role");
    }
}