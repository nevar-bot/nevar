import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";

export default class Join2CreateCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "join2create",
			description: "Verwaltet den Join-2-Create Kanal des Servers",
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
							.setRequired(true)
							.addChannelTypes(ChannelType.GuildVoice)
					)
					.addIntegerOption((option) =>
						option
							.setName("limit")
							.setDescription(
								"Wähle, wieviele Leute maximal in einem Channel sein dürfen (0 = unbegrenzt)"
							)
							.setMinValue(0)
							.setMaxValue(99)
							.setRequired(true)
					)
					.addIntegerOption((option) =>
						option
							.setName("bitrate")
							.setDescription(
								"Wähle die Bitrate (8 - 96kbps, Standard: 64kbps)"
							)
							.setRequired(true)
							.setMinValue(8)
							.setMaxValue(96)
					)
					.addStringOption((option) =>
						option
							.setName("name")
							.setDescription(
								"Setze den Standard-Namen für die Channel (Variablen: {count} und {user})"
							)
							.setRequired(true)
							.setMaxLength(100)
					)
					.addChannelOption((option) =>
						option
							.setName("kategorie")
							.setDescription(
								"Wähle, in welcher Kategorie die Channel erstellt werden"
							)
							.setRequired(false)
							.addChannelTypes(ChannelType.GuildCategory)
					)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		await this.setJoinToCreate(
			interaction.options.getChannel("channel"),
			interaction.options.getInteger("limit"),
			interaction.options.getInteger("bitrate"),
			interaction.options.getString("name"),
			interaction.options.getChannel("kategorie"),
			data
		);
	}

	private async setJoinToCreate(
		channel: any,
		userlimit: number,
		bitrate: number,
		name: string,
		category: any,
		data: any
	): Promise<void> {
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

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			"Join2Create wurde eingerichtet.",
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}
}
