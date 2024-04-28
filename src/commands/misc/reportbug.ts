import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import moment from "moment";
import path from "path";

export default class ReportbugCommand extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "reportbug",
			description: "Report a bug to our development team",
			localizedDescriptions: {
				de: "Melde einen Fehler an unser Entwickler-Team"
			},
			cooldown: 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addStringOption((option: any) =>
					option
						.setName("description")
						.setNameLocalization("de", "beschreibung")
						.setDescription("Describe the error as precisely as possible")
						.setDescriptionLocalization("de", "Beschreibe den Fehler so genau wie möglich")
						.setRequired(true),
				),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
		await this.reportBug(this.interaction.options.getString("description"));
	}

	private async reportBug(bug: string): Promise<void> {
		const date: string = moment(Date.now()).format("DD.MM.YYYY, HH:mm");
		const supportGuild: any = this.client.guilds.cache.get(this.client.config.support["ID"]);

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.client.emotes.flags.BugHunterLevel1 + " " +
			this.translate("bugIsReported"),
			null,
			"success"
		);
		await this.interaction.followUp({ embeds: [successEmbed] });


		const supportEmbed: EmbedBuilder = this.client.createEmbed(
			supportGuild.translate("commands/misc/reportbug:internalBugEmbed", { user: this.interaction.user.username, server: this.interaction.guild.name, e: this.client.emotes, description: bug }),
			null,
			"warning"
		);

		const errorLogChannel: any = await supportGuild.channels.fetch(this.client.config.support["ERROR_LOG"]);
		if (!errorLogChannel) return;

		return errorLogChannel.send({ embeds: [supportEmbed] });
	}
}
