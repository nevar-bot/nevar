import { Guild, ChannelType, Collection, GuildBasedChannel, Role, GuildMember, EmbedBuilder } from "discord.js";
const MEMBER_MENTION: RegExp = /<?@?!?(\d{17,20})>?/;

declare module "discord.js" {
    interface Guild {
        translate(key: string, args?: object): any;
        findMatchingChannels(query: string, type?: ChannelType[]): any;
        findMatchingRoles(query: string): any;
        resolveMember(query: string, exact?: boolean): Promise<any>;
        fetchMemberStats(): Promise<any>;
        logAction(embed: EmbedBuilder, type: "moderation" | "member" | "guild" | "role" | "thread" | "channel"): Promise<any>;
        data: any;
    }
}

/* add translate method to Guild */
Guild.prototype.translate = function (key: string, args?: object): any {
    const guildLocale: string = this.data?.locale?.split("-")[0] || "de";
    // @ts-ignore
    const nevarLocale: any = this.client.locales.get(guildLocale);
    return nevarLocale(key, args);
};

Guild.prototype.resolveMember = async function (query: string, exact: boolean = false): Promise<any> {
    if(!query) return;
    const { client, members } = this;

    const patternMatch: RegExpExecArray|null = RegExp(MEMBER_MENTION).exec(query);
    if(patternMatch){
        const fetched: any = await members.fetch({ user: patternMatch[1] }).catch((): void => {});
        if(fetched) return fetched;
    }

    await members.fetch({ query }).catch((): void => {});

    const matchingUsernames: any = members.cache.filter((member: any): boolean => member.user.username.toLowerCase().includes(query.toLowerCase()) || member.displayName.toLowerCase().includes(query.toLowerCase()));
    return matchingUsernames.size === 1 ? matchingUsernames.first() : !exact ? matchingUsernames.find((member: any): boolean => member.user.username === query) : undefined;
};

Guild.prototype.logAction = async function (embed: EmbedBuilder, type: "moderation" | "member" | "guild" | "role" | "thread" | "channel"): Promise<any> {
    // @ts-ignore
    const guildData = await this.client.findOrCreateGuild(this.id);
    const logChannel: any = this.channels.cache.get(guildData?.settings?.logs?.channels[type]);
    if (logChannel) logChannel.send({ embeds: [embed] }).catch(() => {});
};
