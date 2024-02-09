import BaseCommand from "@structures/BaseCommand.js";
import BaseClient from "@structures/BaseClient.js";
import {EmbedBuilder, SlashCommandBuilder} from "discord.js";
import fs from "fs";
import path from "path";

export default class TopicCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "topic",
			description: "Sends a random topic for conversation",
			localizedDescriptions: {
				de: "Starte eine Unterhaltung mit einem zufälligen Thema",
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
		return await this.getTopic();
	}

	private async getTopic(): Promise<any> {
		const topics: any = this.translate("topics");

		const topicEmbed: EmbedBuilder = this.client.createEmbed(topics[Math.floor(Math.random() * topics.length)], "arrow", "normal");
		return this.interaction.followUp({
			embeds: [topicEmbed]
		});
	}
}
