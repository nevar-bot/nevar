import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import path from "path";

export default class ResetwarnsCommand extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "resetwarns",
			description: "Resets a member's warnings",
			localizedDescriptions: {
				de: "Setzt die Verwarnungen eines Mitgliedes zurück",
			},
			memberPermissions: ["KickMembers"],
			cooldown: 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addUserOption((option: any) =>
					option
						.setName("member")
						.setNameLocalization("de", "mitglied")
						.setDescription("Choose a member")
						.setDescriptionLocalization("de", "Wähle ein Mitglied")
						.setRequired(true),
				),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
		await this.resetWarns(interaction.options.getMember("member"));
	}

	private async resetWarns(member: any): Promise<any> {
		if(!member){
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:memberIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		const memberData: any = await this.client.findOrCreateMember(member.id, this.interaction.guild!.id);

		memberData.warnings = {
			count: 0,
			list: [],
		};
		memberData.markModified("warnings");
		await memberData.save();

		const logText: string =
			"### " + this.client.emotes.delete + " " +
			this.translate("loggingTitle", { user: member.toString() }) + "\n\n" +
			this.client.emotes.user + " " +
			this.getBasicTranslation("moderator") + ": " +
			this.interaction.member!.toString();

		const logEmbed: EmbedBuilder = this.client.createEmbed(logText, null, "normal");
		logEmbed.setThumbnail(member.displayAvatarURL());
		await this.interaction.guild!.logAction(logEmbed, "moderation");

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("warningsResetted", { user: member.toString() }),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}
}
