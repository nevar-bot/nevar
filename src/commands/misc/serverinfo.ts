import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder, ChannelType } from "discord.js";
import moment from "moment";

export default class ServerinfoCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "serverinfo",
			description: "Take a look at general information about the server",
			localizedDescriptions: {
				de: "Schau dir allgemeine Informationen über den Server an",
			},
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder(),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
		await this.showServerInfo();
	}

	private async showServerInfo(): Promise<any> {
		const name: string = this.interaction.guild!.name;
		const id: string = this.interaction.guild!.id;
		const owner: any = await this.interaction.guild!.fetchOwner();
		const memberCount: number = this.interaction.guild!.memberCount;
		const channelCount: number = this.interaction.guild!.channels.cache.size;
		await this.interaction.guild!.channels.fetch().catch((): void => {});
		const textCount: number = this.interaction.guild!.channels.cache.filter(
			(c: any): boolean => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement,
		).size;
		const voiceCount: number = this.interaction.guild!.channels.cache.filter(
			(c: any): boolean => c.type === ChannelType.GuildVoice,
		).size;
		const forumCount: number = this.interaction.guild!.channels.cache.filter(
			(c: any): boolean => c.type === ChannelType.GuildForum,
		).size;
		const categoryCount: number = this.interaction.guild!.channels.cache.filter(
			(c: any): boolean => c.type === ChannelType.GuildCategory,
		).size;
		const threadCount: number = this.interaction.guild!.channels.cache.filter(
			(c: any): boolean => c.type === ChannelType.GuildPublicThread,
		).size;
		const createdAt: string = this.client.utils.getDiscordTimestamp(this.interaction.guild!.createdTimestamp, "f");
		const createdAgo: string = this.client.utils.getDiscordTimestamp(this.interaction.guild!.createdTimestamp, "R");
		const text: string =
			this.client.emotes.discord + " " + this.translate("name") + ": **" + name + "**\n" +
			this.client.emotes.id + " " + this.translate("id") + ": **" + id + "**\n" +
			this.client.emotes.crown + " " + this.translate("owner") + ": **" + owner.user.displayName + "**\n" +
			this.client.emotes.users + " " + this.translate("members") + ": **" + memberCount + "**\n\n" +
			this.client.emotes.list + " " + this.translate("channels") + ": **" + channelCount + "**\n" +
			this.client.emotes.folder + " " + this.translate("categories") + ": **" + categoryCount + "**\n" +
			this.client.emotes.channel + " " + this.translate("textChannels") + ": **" + textCount + "**\n" +
			this.client.emotes.voice + " " + this.translate("voiceChannels") + ": **" + voiceCount + "**\n" +
			this.client.emotes.thread + " " + this.translate("threadChannels") + ": **" + threadCount + "**\n" +
			this.client.emotes.forum + " " + this.translate("forumChannels") + ": **" + forumCount + "**\n\n" +
			this.client.emotes.calendar + " " + this.translate("createdAt") + ": **" + createdAt + "**\n" +
			this.client.emotes.reminder + " " + this.translate("createdAgo") + ": **" + createdAgo + "**";

		const serverInfoEmbed: EmbedBuilder = this.client.createEmbed(text, null, "normal");

		serverInfoEmbed.setTitle(this.translate("title", { guild: this.interaction.guild }))
		serverInfoEmbed.setThumbnail(this.interaction.guild!.iconURL());
		return this.interaction.followUp({ embeds: [serverInfoEmbed] });
	}
}
