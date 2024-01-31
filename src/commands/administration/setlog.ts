import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";

export default class SetlogCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "setlog",
			description: "Monitor events on your Discord server",
			localizedDescriptions: {
				de: "Überwache Ereignisse auf deinem Discord-Server",
			},
			cooldown: 1000,
			memberPermissions: ["ManageGuild"],
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addChannelOption((option) =>
						option
							.setName("moderation")
							.setDescription("Select a channel for the moderation logs")
							.setDescriptionLocalization("de", "Wähle einen Kanal für die Moderations-Logs")
							.setRequired(false)
							.addChannelTypes(
								ChannelType.GuildText,
								ChannelType.GuildAnnouncement,
								ChannelType.PublicThread,
							),
					)
					.addChannelOption((option) =>
						option
							.setName("members")
							.setNameLocalization("de", "mitglieder")
							.setDescription("Select a channel for the member logs")
							.setDescriptionLocalization("de", "Wähle einen Kanal für die Mitglieder-Logs")
							.setRequired(false)
							.addChannelTypes(
								ChannelType.GuildText,
								ChannelType.GuildAnnouncement,
								ChannelType.PublicThread,
							),
					)
					.addChannelOption((option) =>
						option
							.setName("server")
							.setDescription("Select a channel for the server logs")
							.setDescriptionLocalization("de", "Wähle einen Kanal für die Server-Logs")
							.setRequired(false)
							.addChannelTypes(
								ChannelType.GuildText,
								ChannelType.GuildAnnouncement,
								ChannelType.PublicThread,
							),
					)
					.addChannelOption((option) =>
						option
							.setName("roles")
							.setNameLocalization("de", "rollen")
							.setDescription("Select a channel for the role logs")
							.setDescriptionLocalization("de", "Wähle einen Kanal für die Rollen-Logs")
							.setRequired(false)
							.addChannelTypes(
								ChannelType.GuildText,
								ChannelType.GuildAnnouncement,
								ChannelType.PublicThread,
							),
					)
					.addChannelOption((option) =>
						option
							.setName("threads")
							.setDescription("Select a channel for the thread logs")
							.setDescriptionLocalization("de", "Wähle einen Kanal für die Thread-Logs")
							.setRequired(false)
							.addChannelTypes(
								ChannelType.GuildText,
								ChannelType.GuildAnnouncement,
								ChannelType.PublicThread,
							),
					)
					.addChannelOption((option) =>
						option
							.setName("channel")
							.setDescription("Select a channel for the channel logs")
							.setDescriptionLocalization("de", "Wähle einen Kanal für die Kanal-Logs")
							.setRequired(false)
							.addChannelTypes(
								ChannelType.GuildText,
								ChannelType.GuildAnnouncement,
								ChannelType.PublicThread,
							),
					),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;

		if (!data.guild.settings.logs) {
			data.guild.settings.logs = {
				enabled: true,
				channels: {
					moderation: null,
					member: null,
					guild: null,
					role: null,
					thread: null,
					channel: null,
				},
			};
			data.guild.markModified("settings.logs");
			await data.guild.save();
		}

		await this.setLogs();
	}

	private async setLogs(): Promise<any> {
		const moderation: any = this.interaction.options.getChannel("moderation");
		const members: any = this.interaction.options.getChannel("members");
		const server: any = this.interaction.options.getChannel("server");
		const roles: any = this.interaction.options.getChannel("roles");
		const threads: any = this.interaction.options.getChannel("threads");
		const channel: any = this.interaction.options.getChannel("channel");

		if (moderation) this.data.guild.settings.logs.channels.moderation = moderation.id;
		if (members) this.data.guild.settings.logs.channels.member = members.id;
		if (server) this.data.guild.settings.logs.channels.guild = server.id;
		if (roles) this.data.guild.settings.logs.channels.role = roles.id;
		if (threads) this.data.guild.settings.logs.channels.thread = threads.id;
		if (channel) this.data.guild.settings.logs.channels.channel = channel.id;

		this.data.guild.markModified("settings.logs");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("logChannelsSet"), "success", "success");
		return this.interaction.followUp({ embeds: [successEmbed] });
	}
}
