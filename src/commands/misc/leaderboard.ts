import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default class LeaderboardCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "leaderboard",
			description: "Sends the level leaderboard",
			localizedDescriptions: {
				de: "Sendet das Level-Leaderboard"
			},
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
			}
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.sendLeaderboard(data);
	}

	private async sendLeaderboard(data: any): Promise<any> {
		if(!data.guild.settings.levels.enabled){
			return this.interaction.followUp({ content: this.client.emotes.error + " " + this.translate("misc/leaderboard:errors:levelsystemIsDisabled") });
		}

		const leaderboardData: any[] = [
			...(await this.client.levels.computeLeaderboard(
				this.client,
				await this.client.levels.fetchLeaderboard(this.interaction.guild.id, 10),
				true
			))
		];

		const beautifiedLeaderboard: any[] = [];
		for (let user of leaderboardData) {
			const emote: any = user.position < 4 ? this.client.emotes[user.position] : this.client.emotes.arrow;
			beautifiedLeaderboard.push(
				"### " +
					emote +
					" " +
					user.displayName +
					" (*@" +
					user.username +
					"*)" +
					"\n" +
					this.client.emotes.shine2 +
					" " + this.translate("misc/leaderboard:level") + " " +
					user.level +
					"\n" +
					this.client.emotes.shine2 +
					" " +
					this.client.format(user.xp) +
					" / " +
					this.client.format(this.client.levels.xpFor(user.level + 1)) +
					" " + this.translate("misc/leaderboard:xp")
			);
		}
		const leaderboardEmbed: EmbedBuilder = this.client.createEmbed(beautifiedLeaderboard.join("\n\n"), null, "normal");
		leaderboardEmbed.setThumbnail(this.interaction.guild.iconURL());
		if(beautifiedLeaderboard.length === 0) leaderboardEmbed.setDescription(this.client.emotes.error + " " + this.translate("misc/leaderboard:errors:noXp"));
		return this.interaction.followUp({ embeds: [leaderboardEmbed] });
	}
}
