import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";

export default class Join2CreateCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "join2create",
			description: "Verwaltet den Join-2-Create Kanal des Servers",
			localizedDescriptions: {
				"en-US": "Manages the Join-2-Create channel of the server",
				"en-GB": "Manages the Join-2-Create channel of the server"
			},
			memberPermissions: ["ManageGuild"],
			botPermissions: ["ManageChannels"],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addChannelOption((option) =>
						option
							.setName("channel")
							.setDescription("Wähle einen Channel")
							.setDescriptionLocalizations({
								"en-US": "Choose a channel",
								"en-GB": "Choose a channel"
							})
							.setRequired(true).addChannelTypes(ChannelType.GuildVoice)
					)
					.addIntegerOption((option) =>
						option
							.setName("limit")
							.setDescription("Wähle, wieviele Leute maximal in einem Channel sein dürfen (0 = unbegrenzt)")
							.setDescriptionLocalizations({
								"en-US": "Choose how many people can be in a channel at most (0 = unlimited)",
								"en-GB": "Choose how many people can be in a channel at most (0 = unlimited)"
							})
							.setMinValue(0)
							.setMaxValue(99)
							.setRequired(true)
					)
					.addIntegerOption((option) =>
						option
							.setName("bitrate")
							.setDescription("Wähle die Bitrate (8 - 96kbps, Standard: 64kbps)")
							.setDescriptionLocalizations({
								"en-US": "Choose the bitrate (8 - 96kbps, default: 64kbps)",
								"en-GB": "Choose the bitrate (8 - 96kbps, default: 64kbps)"
							})
							.setRequired(true)
							.setMinValue(8)
							.setMaxValue(96)
					)
					.addStringOption((option) =>
						option
							.setName("name")
							.setDescription("Setze den Standard-Namen für die Channel (Variablen: {count} und {user})")
							.setDescriptionLocalizations({
								"en-US": "Set the default name for the channel (variables: {count} and {user})",
								"en-GB": "Set the default name for the channel (variables: {count} and {user})"
							})
							.setRequired(true)
							.setMaxLength(100)
					)
					.addChannelOption((option) =>
						option
							.setName("category")
							.setDescription("Wähle, in welcher Kategorie die Channel erstellt werden")
							.setDescriptionLocalizations({
								"en-US": "Choose in which category the channels will be created",
								"en-GB": "Choose in which category the channels will be created"
							})
							.setRequired(false)
							.addChannelTypes(ChannelType.GuildCategory)
					)
			}
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;

		await this.setJoinToCreate(
			interaction.options.getChannel("channel"),
			interaction.options.getInteger("limit"),
			interaction.options.getInteger("bitrate"),
			interaction.options.getString("name"),
			interaction.options.getChannel("category"),
			data
		);
	}

	private async setJoinToCreate(channel: any, userlimit: number, bitrate: number, name: string, category: any, data: any): Promise<void> {
		data.guild.settings.joinToCreate = {
			enabled: true,
			channel: channel.id,
			category: category ? category.id : null,
			userLimit: userlimit,
			bitrate: bitrate,
			defaultName: name,
			channels: []
		};
		data.guild.markModified("settings.joinToCreate");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/join2create:set"), "success", "success");
		return this.interaction.followUp({ embeds: [successEmbed] });
	}
}
