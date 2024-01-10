import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import moment from "moment";

export default class ReportbugCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "reportbug",
			description: "Report a bug to our development team",
			localizedDescriptions: {
				de: "Meldet einen Fehler an unser Entwickler-Team",
			},
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addStringOption((option: any) =>
					option
						.setName("description")
						.setNameLocalizations({
							de: "beschreibung"
						})
						.setDescription("Please describe the bug as precisely as possible")
						.setDescriptionLocalizations({
							de: "Bitte beschreibe den Fehler so genau wie möglich"
						})
						.setRequired(true),
				),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.reportBug(this.interaction.options.getString("description"));
	}

	private async reportBug(bug: string): Promise<void> {
		const date: string = moment(Date.now()).format("DD.MM.YYYY, HH:mm");
		const supportGuild: any = this.client.guilds.cache.get(this.client.config.support["ID"]);

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.client.emotes.flags.BugHunterLevel1 + " " +
			this.translate("confirmation"),
			null,
			"success"
		);
		await this.interaction.followUp({ embeds: [successEmbed] });


		const supportEmbed: EmbedBuilder = this.client.createEmbed(
			supportGuild.translate("misc/reportbug:supportTitle", { user: this.interaction.user }) + "\n\n" +
			this.client.emotes.bug + " " + bug,
			"information",
			"warning"
		);
		supportEmbed.setFooter({
			text: supportGuild.translate("misc/reportbug:guildId") + ": " + this.interaction.guild!.id + " | " + date,
		});

		const errorLogChannel: any = await supportGuild.channels.fetch(this.client.config.support["ERROR_LOG"]);
		if (!errorLogChannel) return;

		return errorLogChannel.send({ embeds: [supportEmbed] });
	}
}
