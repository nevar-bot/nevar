import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";

export default class Join2CreateCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "join2create",
			description: "Create personal channels for your members",
			localizedDescriptions: {
				de: "Erstelle persönliche Kanäle für deine Mitglieder",
			},
			memberPermissions: ["ManageGuild"],
			botPermissions: ["ManageChannels"],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addChannelOption((option) => option
						.setName("channel")
						.setNameLocalization("de", "kanal")
						.setDescription("Select a channel")
						.setDescriptionLocalization("de", "Wähle einen Kanal")
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildVoice),
					)
					.addIntegerOption((option) => option
						.setName("limit")
						.setDescription("Set the maximum number of users in a channel (0 = unlimited)")
						.setDescriptionLocalization("de", "Setze die maximale Anzahl an Nutzern in einem Channel (0 = unbegrenzt)")
						.setMinValue(0)
						.setMaxValue(99)
						.setRequired(true),
					)
					.addIntegerOption((option) => option
						.setName("bitrate")
						.setDescription("Set the bit rate of the channel (8 - 96kbps, default: 64kbps)")
						.setDescriptionLocalization("de", "Setze die Bitrate des Kanals (8 - 96kbps, Standard: 64kbps)")
						.setRequired(true)
						.setMinValue(8)
						.setMaxValue(96),
					)
					.addStringOption((option) => option
						.setName("name")
						.setDescription("Set the default name for the channels (variables: %count and %user)")
						.setDescriptionLocalization("de", "Setze den Standard-Namen für die Kanäle (Variablen: %count und %user)")
						.setRequired(true)
						.setMaxLength(100),
					)
					.addChannelOption((option) => option
						.setName("category")
						.setNameLocalization("de", "kategorie")
						.setDescription("Select the category in which the channels are created")
						.setDescriptionLocalization("de", "Wähle die Kategorie, in der die Kanäle erstellt werden")
						.setRequired(false)
						.addChannelTypes(ChannelType.GuildCategory),
					),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;

		await this.setJoinToCreate(
			interaction.options.getChannel("channel"),
			interaction.options.getInteger("limit"),
			interaction.options.getInteger("bitrate"),
			interaction.options.getString("name"),
			interaction.options.getChannel("category")
		);
	}

	private async setJoinToCreate(
		channel: any,
		userlimit: number,
		bitrate: number,
		name: string,
		category: any
	): Promise<any> {
		this.data.guild.settings.joinToCreate = {
			enabled: true,
			channel: channel.id,
			category: category ? category.id : null,
			userLimit: userlimit,
			bitrate: bitrate,
			defaultName: name,
			channels: [],
		};
		this.data.guild.markModified("settings.joinToCreate");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("joinToCreateSet"), "success", "success");
		return this.interaction.followUp({ embeds: [successEmbed] });
	}
}
