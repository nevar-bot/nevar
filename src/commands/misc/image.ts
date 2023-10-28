import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder } from "discord.js";
import OpenAI from "openai";

export default class ImageCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "image",
			description: "Generates an image from the given text",
			localizedDescriptions: {
				de: "Generiert ein Bild aus dem gegebenen Text"
			},
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addStringOption((option) =>
					option
						.setName("text")
						.setDescription("The text to generate the image from")
						.setDescriptionLocalizations({
							de: "Der Text, aus dem das Bild generiert werden soll"
						})
						.setRequired(true)
				)
			}
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.generateImage(interaction.options.getString("text"));
	}

	private async generateImage(text: string): Promise<void> {
		const answerMessage: any = await this.interaction.followUp({
			content: this.client.emotes.loading + " " + this.translate("misc/image:generating")
		});

		const openai: OpenAI = new OpenAI({
			apiKey: this.client.config.apikeys["OPENAI"]
		});

		const response: OpenAI.ImagesResponse = await openai.images.generate({
			prompt: text
		});

		answerMessage.edit({ content: response.data[0].url });
	}
}
