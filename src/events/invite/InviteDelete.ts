import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";

export default class
{
    public client: BaseClient;

    constructor(client: BaseClient)
    {
        this.client = client;
    }

    async dispatch(invite: any): Promise<any>
    {
        if(!invite || !invite.guild) return;
        const { guild } = invite;

        /* Update invite cache */
        this.client.invites.get(guild.id).delete(invite.code);

        /* Remove invite from user */
        const memberData: any = await this.client.findOrCreateMember(invite.inviterId, guild.id);
        if(!memberData.invites) memberData.invites = [];
        memberData.invites = memberData.invites.filter((i: any): boolean => i.code !== invite.code);
        memberData.markModified("invites");
        await memberData.save();

        const inviteDeleteText: string =
            this.client.emotes.link + " Link: " + invite.url;

        const inviteDeleteEmbed: EmbedBuilder = this.client.createEmbed(inviteDeleteText, null, "error");
        inviteDeleteEmbed.setTitle(this.client.emotes.invite + " Einladung gelöscht");
        inviteDeleteEmbed.setThumbnail(guild.iconURL());

        await guild.logAction(inviteDeleteEmbed, "guild");
    }
}