import BaseCommand from "@structures/BaseCommand.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import BaseClient from "@structures/BaseClient.js";
import path from "path";

export default class AskCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "ask",
			description: "Ask a question and you will get 100% true answers",
			localizedDescriptions: {
				de: "Stelle eine Frage und du wirst 100% wahre Antworten erhalten",
			},
			cooldown: 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addStringOption((option: any) =>
					option
						.setRequired(true)
						.setName("question")
						.setNameLocalizations({
							de: "frage",
						})
						.setDescription("Ask your question")
						.setDescriptionLocalizations({
							de: "Stelle deine Frage",
						}),
				),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
		return this.getAnswer(interaction.options.getString("question"));
	}

	private async getAnswer(question: string): Promise<any> {
		const eightBallAnswers: any = this.translate("answers");
		const randomAnswer: string = eightBallAnswers[Math.floor(Math.random() * eightBallAnswers.length)];
  		const text: string = this.client.emotes.question + " " + question + "\n" + this.client.emotes.arrow + " " + randomAnswer;
		const eightBallEmbed: EmbedBuilder = this.client.createEmbed(text, null, "normal");
		return this.interaction.followUp({ embeds: [eightBallEmbed] });
	}
}
