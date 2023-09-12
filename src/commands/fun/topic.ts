import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder } from "discord.js";
import fs from "fs";

export default class TopicCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "topic",
			description: "Sends a random topic for conversation",
			localizedDescriptions: {
				de: "Sendet ein zufälliges Thema für eine Unterhaltung"
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
		return await this.getTopic();
	}

	private async getTopic(): Promise<void> {
		const json = JSON.parse(String(fs.readFileSync("./assets/topics.json")));
		const topics: any[] = Object.values(json);

		return this.interaction.followUp({
			content: topics[Math.floor(Math.random() * topics.length)]
		});
	}
}
