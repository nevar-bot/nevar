import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default class UntimeoutCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "untimeout",
			description: "Cancels a member's timeout",
			localizedDescriptions: {
				de: "Hebt den Timeout eines Mitgliedes auf"
			},
			memberPermissions: ["KickMembers"],
			cooldown: 1000,
			dirname: __dirname,
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

		await this.untimeout(interaction.options.getMember("member"));
	}

	private async untimeout(member: any): Promise<any> {
		if(!member){
			const invalidMemberEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:memberIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidMemberEmbed] });
		}

		if(!member.communicationDisabledUntil){
			const memberIsNotTimeoutedEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:userIsNotTimeouted", { user: member.toString() }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [memberIsNotTimeoutedEmbed] });
		}

		member.timeout(null, this.interaction.user.username);
		const untimeoutedEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("untimeoutedUser", { user: member.toString() }),
			"success",
			"success",
		);
		await this.interaction.followUp({ embeds: [untimeoutedEmbed] });

		const logMessageText: string =
			"### " + this.translate("loggingMessage", { user: member.toString() }) + "\n\n" +
			this.client.emotes.user + " " + this.getBasicTranslation("moderator") + ": " + this.interaction.user.toString();

		const logMessageEmbed: EmbedBuilder = this.client.createEmbed(logMessageText, null, "normal");
		return this.interaction.guild!.logAction(logMessageEmbed, "moderation");
	}
}
