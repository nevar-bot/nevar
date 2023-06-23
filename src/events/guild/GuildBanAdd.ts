import BaseClient from "@structures/BaseClient";
import {AuditLogEvent, EmbedBuilder} from "discord.js";

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

        let banLogMessage: string =
            this.client.emotes.user + " Nutzer: " + ban.user.username + " (" + ban.user.id + ")\n" +
            this.client.emotes.text + " Begründung: " + (ban.reason ? ban.reason : "N/A");

        const auditLogs: any = await guild.fetchAuditLogs({ type: AuditLogEvent["MemberBanAdd"], limit: 1 }).catch((e: any): void => {});
        if(auditLogs){
            const auditLogEntry: any = auditLogs.entries.first();
            if(auditLogEntry){
                const moderator: any = auditLogEntry.executor;
                if(moderator) banLogMessage += "\n\n" + this.client.emotes.user + " Moderator: " + moderator.toString();
            }
        }

        const banLogEmbed: EmbedBuilder = this.client.createEmbed(banLogMessage, null, "error");
        banLogEmbed.setTitle(this.client.emotes.events.member.ban + " Nutzer gebannt");
        banLogEmbed.setThumbnail(ban.user.displayAvatarURL());

        await guild.logAction(banLogEmbed, "moderation");
    }
}