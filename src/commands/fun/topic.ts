import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";
import {EmbedBuilder, SlashCommandBuilder} from "discord.js";

export default class TopicCommand extends NevarCommand {
	public constructor(client: NevarClient) {
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
