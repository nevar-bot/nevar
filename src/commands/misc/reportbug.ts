import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import moment from "moment";

export default class ReportbugCommand extends BaseCommand
{
	public constructor(client: BaseClient)
	{
		super(client, {
			name: "reportbug",
			description: "Meldet einen Fehler an unser Entwickler-Team",
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) => option
						.setName("beschreibung")
						.setDescription("Beschreibe den Fehler")
						.setRequired(true)
					)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void>
	{
		this.interaction = interaction;
		await this.reportBug(this.interaction.options.getString("beschreibung"));
	}

	private async reportBug(bug: string): Promise<void>
	{
		const date: string = moment(Date.now()).format("DD.MM.YYYY, HH:mm");
		const supportGuild: any = this.client.guilds.cache.get(this.client.config.support["ID"]);

		const successEmbed: EmbedBuilder = this.client.createEmbed("{0} Danke für deine Meldung! Wir werden uns so schnell wie möglich darum kümmern.", null, "success", this.client.emotes.flags.BugHunterLevel1);
		successEmbed.setThumbnail(this.client.user!.displayAvatarURL());
		await this.interaction.followUp({ embeds: [successEmbed] });

		const supportEmbed: EmbedBuilder = this.client.createEmbed("{0} ({1}) hat einen Fehler gemeldet: {2}", "information", "warning", this.interaction.user.tag, this.interaction.user.id, bug);
		supportEmbed.setFooter({ text: "Server-ID: " + this.interaction.guild.id + " | " + date });

		const errorLogChannel: any = await supportGuild.channels.fetch(this.client.config.support["ERROR_LOG"]);
		if (!errorLogChannel) return;

		return errorLogChannel.send({ embeds: [supportEmbed] });
	}
}