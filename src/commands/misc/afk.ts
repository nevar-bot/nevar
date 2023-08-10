import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default class AfkCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "afk",
			description: "Markiert dich als abwesend",
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addStringOption((option: any) =>
					option.setName("grund").setDescription("Warum bist du abwesend?").setRequired(false)
				)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		await this.setAfk(interaction.member, interaction.options.getString("grund"), data);
	}

	private async setAfk(member: any, reason: string, data: any) {
		if (data.user.afk.state) {
			const afkSince: any = data.user.afk.since;
			const reason: string = data.user.afk.reason || "Kein Grund angegeben";

			const relativeTime: string = this.client.utils.getRelativeTime(afkSince);
			const welcomeBackEmbed: EmbedBuilder = this.client.createEmbed(
				"Willkommen zurück! Du warst abwesend für {0}.",
				"reminder",
				"normal",
				relativeTime + " (" + reason + ")"
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
			"Bis später! Du bist jetzt abwesend: {0}.",
			"reminder",
			"normal",
			reason || "Kein Grund angegeben"
		);
		return this.interaction.followUp({ embeds: [afkEmbed] });
	}
}
