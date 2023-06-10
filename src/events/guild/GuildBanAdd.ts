import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";

export default class {
    public client: BaseClient;

    constructor(client: BaseClient) {
        this.client = client;
    }

    async dispatch(ban: any): Promise<void> {
        await ban.fetch().catch((e: any): void => {});
        if(!ban || !ban.guild) return;
        const { guild } = ban;

        const banLogMessage: string =
            this.client.emotes.user + " Nutzer: " + ban.user.tag + " (" + ban.user.id + ")\n" +
            this.client.emotes.text + " Begründung: " + (ban.reason ? ban.reason : "N/A");

        const banLogEmbed: EmbedBuilder = this.client.createEmbed(banLogMessage, null, "error");
        banLogEmbed.setTitle(this.client.emotes.events.member.ban + " Nutzer gebannt");
        banLogEmbed.setThumbnail(ban.user.displayAvatarURL());

        await guild.logAction(banLogEmbed, "moderation");
    }
}