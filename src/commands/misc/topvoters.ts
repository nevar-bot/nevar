import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import mongoose from "mongoose";

export default class TopvotersCommand extends BaseCommand
{
	public constructor(client: BaseClient)
	{
		super(client, {
			name: "topvoters",
			description: "Zeigt die Topvoter an",
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
			}
		})
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void>
	{
		this.interaction = interaction;
		await this.showTopVoters();
	}

	private async showTopVoters(): Promise<void>
	{
		const topVoters: any = (await (await mongoose.connection.db.collection("users")).find({ "voteCount": { $ne: null } }).sort({ voteCount: -1 }).limit(10).toArray())
		const voters: any[] = [];

		let i: number = 0;
		for (let topVoter of topVoters) {
			const user: any = await this.client.users.fetch(topVoter.id).catch((): void => { });
			if (user) {
				i++;
				voters.push((i <= 3 ? this.client.emotes[i] : this.client.emotes.arrow) + " **" + user.username + "** - " + topVoter.voteCount + " Votes" + "\n");
			}
		}
		await this.client.utils.sendPaginatedEmbed(this.interaction, 10, voters, "Topvoter", "Es gibt noch keine Topvoter");
	}
}