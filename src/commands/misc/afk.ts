import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default class AfkCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "afk",
			description: "In case you are not there for once",
			localizedDescriptions: {
				de: "Für den Fall, dass du Mal nicht da bist",
			},
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addStringOption((option: any) =>
					option
						.setName("reason")
						.setNameLocalization("de", "grund")
						.setDescription("What is the reason for your absence?")
						.setDescriptionLocalization("de", "Was ist der Grund für deine Abwesenheit?")
						.setRequired(false),
				),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
		await this.setAfk(interaction.member, interaction.options.getString("reason"));
	}

	private async setAfk(member: any, reason: string) {
		if (this.data.user.afk.state) {
			const afkSince: any = this.data.user.afk.since;
			const reason: string = this.data.user.afk.reason || this.translate("noAbsenceReasonSpecified");

			const relativeTime: string = this.client.utils.getDiscordTimestamp(afkSince, "f");
			const welcomeBackEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("absenceIsEnded", { time: relativeTime, reason }),
				"reminder",
				"normal",
			);

			this.data.user.afk = {
				state: false,
				reason: null,
				since: null,
			};
			this.data.user.markModified("afk");
			await this.data.user.save();

			return this.interaction.followUp({ embeds: [welcomeBackEmbed] });
		}

		this.data.user.afk = {
			state: true,
			reason: reason,
			since: Date.now(),
		};
		this.data.user.markModified("afk");
		await this.data.user.save();

		const afkEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("absenceIsStarted", { reason: reason || this.translate("noReason") }),
			"reminder",
			"normal",
		);
		return this.interaction.followUp({ embeds: [afkEmbed] });
	}
}
