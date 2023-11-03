import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default class AfkCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "afk",
			description: "Marks you as absent",
			localizedDescriptions: {
				de: "Markiert dich als abwesend"
			},
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addStringOption((option: any) =>
					option
						.setName("reason")
						.setDescription("Why are you absent?")
						.setDescriptionLocalizations({
							de: "Warum bist du abwesend?"
						})
						.setRequired(false)
				)
			}
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.setAfk(interaction.member, interaction.options.getString("reason"), data);
	}

	private async setAfk(member: any, reason: string, data: any) {
		if (data.user.afk.state) {
			const afkSince: any = data.user.afk.since;
			const reason: string = data.user.afk.reason || this.translate("noReason");

			const relativeTime: string = this.client.utils.getDiscordTimestamp(afkSince, "f");
			const welcomeBackEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("welcomeBack", { time: relativeTime, reason }),
				"reminder",
				"normal"
			);

			data.user.afk = {
				state: false,
				reason: null,
				since: null
			};
			data.user.markModified("afk");
			await data.user.save();

			return this.interaction.followUp({ embeds: [welcomeBackEmbed] });
		}

		data.user.afk = {
			state: true,
			reason: reason,
			since: Date.now()
		};
		data.user.markModified("afk");
		await data.user.save();

		const afkEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("afk", { reason: reason || this.translate("noReason") }),
			"reminder",
			"normal"
		);
		return this.interaction.followUp({ embeds: [afkEmbed] });
	}
}
