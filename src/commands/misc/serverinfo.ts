import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder, ChannelType } from "discord.js";
import moment from "moment";

export default class ServerinfoCommand extends BaseCommand {
    public constructor(client: BaseClient) {
        super(client, {
            name: "serverinfo",
            description: "Zeigt allgemeine Informationen über den Server an",
            cooldown: 1000,
            dirname: __dirname,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });
    }

    private interaction: any;

    public async dispatch(interaction: any, data: any): Promise<void>{
        this.interaction = interaction;
        await this.showServerInfo();
    }

    private async showServerInfo(): Promise<void>{
        const name: string = this.interaction.guild.name;
        const id: string = this.interaction.guild.id;
        const owner: any = await this.interaction.guild.fetchOwner();
        const memberCount: number = this.interaction.guild.memberCount;
        const channelCount: number = this.interaction.guild.channels.cache.size;
        await this.interaction.guild.channels.fetch().catch((): void => {});
        const textCount: number = this.interaction.guild.channels.cache.filter((c: any): boolean => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement).size;
        const voiceCount: number = this.interaction.guild.channels.cache.filter((c: any): boolean => c.type === ChannelType.GuildVoice).size;
        const forumCount: number = this.interaction.guild.channels.cache.filter((c: any): boolean => c.type === ChannelType.GuildForum).size;
        const categoryCount: number = this.interaction.guild.channels.cache.filter((c: any): boolean => c.type === ChannelType.GuildCategory).size;
        const threadCount: number = this.interaction.guild.channels.cache.filter((c: any): boolean => c.type === ChannelType.GuildPublicThread).size;
        const createdAt: string = moment(this.interaction.guild.createdTimestamp).format("DD.MM.YYYY HH:mm");
        const createdAgo: string = this.client.utils.getRelativeTime(this.interaction.guild.createdTimestamp);

        const text: string =
            " Name: **" + name + "**\n" +
            this.client.emotes.id + " ID: **" + id + "**\n" +
            this.client.emotes.crown + " Eigentümer: **" + owner.user.tag + "**\n" +
            this.client.emotes.users + " Mitglieder: **" + memberCount + "**\n\n" +
            this.client.emotes.list + " Channel: **" + channelCount + "**\n" +
            this.client.emotes.folder + " davon Kategorien: **" + categoryCount + "**\n" +
            this.client.emotes.channel + " davon Text: **" + textCount + "**\n" +
            this.client.emotes.voice + " davon Sprache: **" + voiceCount + "**\n" +
            this.client.emotes.thread + " davon Threads: **" + threadCount + "**\n" +
            this.client.emotes.forum + " davon Foren: **" + forumCount + "**\n\n" +
            this.client.emotes.calendar + " Erstellt am: **" + createdAt + "**\n" +
            this.client.emotes.reminder + " Erstellt vor: **" + createdAgo + "**";

        const serverInfoEmbed: EmbedBuilder = this.client.createEmbed("{0}", "discord", "normal", text);

        serverInfoEmbed.setTitle(this.client.emotes.shine + " Informationen zu " + this.interaction.guild.name);
        serverInfoEmbed.setThumbnail(this.interaction.guild.iconURL({dynamic: true}));
        return this.interaction.followUp({ embeds: [serverInfoEmbed] });
    }
}