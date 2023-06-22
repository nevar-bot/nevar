import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";

export default class
{
    private client: BaseClient;

    public constructor(client: BaseClient)
    {
        this.client = client;
    }

    public async dispatch(ban: any): Promise<void>
    {
        await ban.fetch().catch((e: any): void => {});
        if(!ban || !ban.guild) return;
        const { guild } = ban;

        const banLogMessage: string =
            this.client.emotes.user + " Nutzer: " + ban.user.tag + " (" + ban.user.id + ")";

        const banLogEmbed: EmbedBuilder = this.client.createEmbed(banLogMessage, null, "success");
        banLogEmbed.setTitle(this.client.emotes.events.member.unban + " Nutzer entbannt");
        banLogEmbed.setThumbnail(ban.user.displayAvatarURL());

        await guild.logAction(banLogEmbed, "moderation");
    }
}