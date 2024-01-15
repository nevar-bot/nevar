import BaseCommand from "@structures/BaseCommand";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import BaseClient from "@structures/BaseClient";

export default class AskCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "ask",
			description: "Ask a question and get 100% correct answers",
			localizedDescriptions: {
				de: "Stelle eine Frage und erhalte 100% wahre Antworten",
			},
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addStringOption((option: any) =>
					option
						.setRequired(true)
						.setName("question")
						.setNameLocalizations({
							de: "frage",
						})
						.setDescription("Enter your question")
						.setDescriptionLocalizations({
							de: "Gib deine Frage ein",
						}),
				),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		return this.getAnswer(this.interaction.options.getString("question"));
	}

	private async getAnswer(question: string): Promise<any> {
		const eightBallAnswers: any = this.translate("answers");
		const randomAnswer: string = eightBallAnswers[Math.floor(Math.random() * eightBallAnswers.length)];
  const text: string = this.client.emotes.question + " " + question + "\n\n" + this.client.emotes.arrow + " " + randomAnswer;
		const eightBallEmbed: EmbedBuilder = this.client.createEmbed(text, null, "normal");
		return this.interaction.followUp({ embeds: [eightBallEmbed] });
	}
}
