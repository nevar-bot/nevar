import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { ChannelType, SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default class SuggestsystemCommand extends BaseCommand
{
	public constructor(client: BaseClient)
	{
		super(client, {
			name: "suggestsystem",
			description: "Verwaltet das Ideen-System des Servers",
			memberPermissions: ["ManageGuild"],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) => option
						.setName("aktion")
						.setDescription("Wähle aus den folgenden Aktionen")
						.setRequired(true)
						.addChoices(
							{ name: "aktivieren", value: "enable" },
							{ name: "deaktivieren", value: "disable" },
							{ name: "channel", value: "channel" },
							{ name: "reviewchannel", value: "reviewchannel" },
						)
					)
					.addChannelOption((option: any) => option
						.setName("channel")
						.setDescription("Wähle einen Channel")
						.addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
						.setRequired(false)
					)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void>
	{
		this.interaction = interaction;

		const action: string = interaction.options.getString("aktion");
		switch (action) {
			case "enable":
				await this.enable(data);
				break;
			case "disable":
				await this.disable(data);
				break;
			case "channel":
				await this.setChannel(interaction.options.getChannel("channel"), data)
				break;
			case "reviewchannel":
				await this.setReviewChannel(interaction.options.getChannel("channel"), data)
				break;
		}
	}

	private async enable(data: any): Promise<void>
	{
		if (data.guild.settings.suggestions.enabled) {
			const isAlreadyEnabled: EmbedBuilder = this.client.createEmbed("Das Ideen-System ist bereits aktiviert.", "error", "error");
			return this.interaction.followUp({ embeds: [isAlreadyEnabled] });
		}
		data.guild.settings.suggestions.enabled = true;
		data.guild.markModified("settings.suggestions.enabled");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed("Das Ideen-System wurde aktiviert.", "success", "success");
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async disable(data: any): Promise<void>
	{
		if (!data.guild.settings.suggestions.enabled) {
			const isAlreadyDisabled: EmbedBuilder = this.client.createEmbed("Das Ideen-System ist bereits deaktiviert.", "error", "error");
			return this.interaction.followUp({ embeds: [isAlreadyDisabled] });
		}
		data.guild.settings.suggestions.enabled = false;
		data.guild.markModified("settings.suggestions.enabled");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed("Das Ideen-System wurde deaktiviert.", "success", "success");
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setChannel(channel: any, data: any): Promise<void>
	{
		if (!channel) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Du musst einen Channel eingeben.", "error", "error");
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}
		data.guild.settings.suggestions.channel = channel.id;
		data.guild.markModified("settings.suggestions.channel");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed("Neue Ideen werden absofort in {0} gesendet.", "success", "success", channel);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setReviewChannel(channel: any, data: any): Promise<void>
	{
		if (!channel) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Du musst einen Channel eingeben.", "error", "error");
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}
		data.guild.settings.suggestions.review_channel = channel.id;
		data.guild.markModified("settings.suggestions.review_channel");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed("Neue Ideen werden absofort in {0} verwaltet.", "success", "success", channel);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}
}