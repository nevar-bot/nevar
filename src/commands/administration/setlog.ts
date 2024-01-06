import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";

export default class SetlogCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "setlog",
			description: "Sets the different log channels",
			localizedDescriptions: {
				de: "Setzt die verschiedenen Log-Channel",
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
							.setDescription("Sets the channel in which moderation logs are sent")
							.setDescriptionLocalizations({
								de: "Setzt den Channel, in welchem Moderations-Logs gesendet werden",
							})
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
							.setNameLocalizations({
								de: "mitglieder",
							})
							.setDescription("Sets the channel in which member logs are sent")
							.setDescriptionLocalizations({
								de: "Setzt den Channel, in welchem Logs zu Mitgliedern gesendet werden",
							})
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
							.setDescription("Sets the channel in which general server logs are sent")
							.setDescriptionLocalizations({
								de: "Setzt den Channel, in welchem allgemeine Logs zum Server gesendet werden",
							})
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
							.setNameLocalizations({
								de: "rollen",
							})
							.setDescription("Sets the channel in which role logs are sent")
							.setDescriptionLocalizations({
								de: "Setzt den Channel, in welchem Logs zu Rollen gesendet werden",
							})
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
							.setDescription("Sets the channel in which thread logs are sent")
							.setDescriptionLocalizations({
								de: "Setzt den Channel, in welchem Logs zu Threads gesendet werden",
							})
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
							.setDescription("Sets the channel in which channel logs are sent")
							.setDescriptionLocalizations({
								de: "Setzt den Channel, in welchem Logs zu Channels gesendet werden",
							})
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

		await this.setLogs(data);
	}

	private async setLogs(data: any): Promise<void> {
		const moderation: any = this.interaction.options.getChannel("moderation");
		const members: any = this.interaction.options.getChannel("members");
		const server: any = this.interaction.options.getChannel("server");
		const roles: any = this.interaction.options.getChannel("roles");
		const threads: any = this.interaction.options.getChannel("threads");
		const channel: any = this.interaction.options.getChannel("channel");

		if (moderation) data.guild.settings.logs.channels.moderation = moderation.id;
		if (members) data.guild.settings.logs.channels.member = members.id;
		if (server) data.guild.settings.logs.channels.guild = server.id;
		if (roles) data.guild.settings.logs.channels.role = roles.id;
		if (threads) data.guild.settings.logs.channels.thread = threads.id;
		if (channel) data.guild.settings.logs.channels.channel = channel.id;

		data.guild.markModified("settings.logs");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("set"), "success", "success");
		return this.interaction.followUp({ embeds: [successEmbed] });
	}
}
