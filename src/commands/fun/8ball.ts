import BaseCommand from "@structures/BaseCommand";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import BaseClient from "@structures/BaseClient";

export default class EightballCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "8ball",
			description: "Ask a question and get magical answers",
			localizedDescriptions: {
				de: "Stelle eine Frage und erhalte magische Antworten",
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
		return this.getAnswer();
	}

	private async getAnswer(): Promise<void> {
		const eightBallAnswers: string[] = this.translate("answers");
		const randomAnswer: string = eightBallAnswers[Math.floor(Math.random() * eightBallAnswers.length)];
		const eightBallEmbed: EmbedBuilder = this.client.createEmbed("{0}", "question", "normal", randomAnswer);
		return this.interaction.followUp({ embeds: [eightBallEmbed] });
	}
}
