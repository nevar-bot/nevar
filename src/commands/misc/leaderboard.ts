import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import path from "path";

export default class LeaderboardCommand extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "leaderboard",
			description: "Take a look at the server leaderboard",
			localizedDescriptions: {
				de: "Sieh dir das Server-Leaderboard an",
			},
			cooldown: 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder(),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
		await this.sendLeaderboard();
	}

	private async sendLeaderboard(): Promise<any> {
		if (!this.data.guild.settings.levels.enabled) {
			return this.interaction.followUp({
				content: this.client.emotes.error + " " + this.translate("errors:levelsystemIsNotEnabled"),
			});
		}

		const leaderboardData: any[] = [
			...(await this.client.levels.computeLeaderboard(
				this.client,
				await this.client.levels.fetchLeaderboard(this.interaction.guild!.id, 10),
				true,
			)),
		];

		const beautifiedLeaderboard: any[] = [];
		for (const user of leaderboardData) {
			const emote: any = user.position < 4 ? this.client.emotes[user.position] : this.client.emotes.arrow;
			beautifiedLeaderboard.push(
					"**" + emote + " " +
					user.user.username +
					"**\n" +
					this.client.emotes.rocket +
					" " +
					this.getBasicTranslation("level") +
					" " +
					user.level +
					" - " +
					this.client.format(user.cleanXp) + " " +
					this.getBasicTranslation("xp"),
			);
		}
		const leaderboardEmbed: EmbedBuilder = this.client.createEmbed(
			"### " + this.client.emotes.shine + " " + this.translate("viewFullLeaderboardHere", { guildId: this.interaction.guild.id }) + "\n\n" +
			beautifiedLeaderboard.join("\n\n"),
			null,
			"normal",
		);
		if (beautifiedLeaderboard.length === 0)
			leaderboardEmbed.setDescription(this.client.emotes.error + " " + this.translate("errors:noMembersGainedXp"));


		return this.interaction.followUp({ embeds: [leaderboardEmbed] });
	}
}
