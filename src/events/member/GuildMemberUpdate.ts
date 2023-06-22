import { EmbedBuilder } from "discord.js";
import BaseClient from "@structures/BaseClient";

export default class
{
    private client: BaseClient;

    public constructor(client: BaseClient)
    {
        this.client = client;
    }

    public async dispatch(oldMember: any, newMember: any): Promise<any>
    {
        if(oldMember.pending && !newMember.pending) this.client.emit("guildMemberAdd", newMember);
        if(!oldMember || !newMember || !newMember.guild || oldMember.partial) return;

        const { guild } = newMember;
        if(!guild.members.cache.find((m: any): boolean => m.id === oldMember.id)) return;

        const properties: Array<string> = [];

        if(oldMember.displayName !== newMember.displayName) properties.push(this.client.emotes.edit + " Anzeigename: ~~" + oldMember.displayName + "~~ **" + newMember.displayName + "**");

        newMember.roles.cache.forEach((role: any): void => {
            if(!oldMember.roles.cache.has(role.id)) properties.push(this.client.emotes.events.role.create + " Rolle hinzugefügt: " + role.toString());
        });

        oldMember.roles.cache.forEach((role: any): void => {
            if(!newMember.roles.cache.has(role.id)) properties.push(this.client.emotes.events.role.delete + " Rolle entfernt: " + role.toString());
        });
        if(properties.length < 1) return;

        const memberUpdateText: string =
            properties.join("\n");

        const memberUpdateEmbed: EmbedBuilder = this.client.createEmbed(memberUpdateText, null, "warning");
        memberUpdateEmbed.setTitle(this.client.emotes.events.member.update + " " + newMember.user.username + " wurde aktualisiert");
        memberUpdateEmbed.setThumbnail(newMember.user.displayAvatarURL());

        await guild.logAction(memberUpdateEmbed, "member");
    }
}