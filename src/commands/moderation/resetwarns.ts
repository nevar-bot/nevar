import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default class ResetwarnsCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "resetwarns",
			description: "Resets a member's warnings",
			localizedDescriptions: {
				de: "Setzt die Verwarnungen eines Mitgliedes zurück",
			},
			memberPermissions: ["KickMembers"],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addUserOption((option: any) =>
					option
						.setName("member")
						.setNameLocalizations({
							de: "mitglied"
						})
						.setDescription("Choose a member")
						.setDescriptionLocalizations({
							de: "Wähle ein Mitglied"
						})
						.setRequired(true),
				),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.resetWarns(interaction.options.getMember("member"));
	}

	private async resetWarns(member: any): Promise<any> {
		if(!member){
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("basics:errors:missingMember", {}, true),
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
			this.translate("logTitle", { user: member.toString() }) + "\n\n" +
			this.client.emotes.user + " " +
			this.translate("moderator") + ": " +
			this.interaction.member!.toString();

		const logEmbed: EmbedBuilder = this.client.createEmbed(logText, null, "normal");
		logEmbed.setThumbnail(member.displayAvatarURL());
		await this.interaction.guild!.logAction(logEmbed, "moderation");

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("reset", { user: member.toString() }),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}
}
