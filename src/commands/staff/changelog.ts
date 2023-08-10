import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import moment from "moment";
import { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder } from "discord.js";

export default class ChangelogCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "changelog",
			description: "Sendet den Changelog als übersichtliche Nachricht",
			ownerOnly: true,
			dirname: __dirname,
			slashCommand: {
				addCommand: false,
				data: null
			}
		});
	}

	private message: any;

	public async dispatch(message: any, args: any[], data: any): Promise<void> {
		this.message = message;
		await this.sendChangelog();
	}

	private async sendChangelog(): Promise<void> {
		const createButton: ButtonBuilder = this.client.createButton("create", "Changelog erstellen", "Secondary", "text");
		const createEmbed: EmbedBuilder = this.client.createEmbed("Wenn du einen Changelog erstellen möchtest, drücke den Button", "arrow", "normal");
		const buttonRow: any = this.client.createMessageComponentsRow(createButton);

		const embedMessage: any = await this.message.reply({
			embeds: [createEmbed],
			components: [buttonRow]
		});

		const buttonCollector: any = embedMessage.createMessageComponentCollector({
			filter: (i: any): boolean => i.user.id === this.message.author.id
		});
		buttonCollector.on("collect", async (interaction: any): Promise<void> => {
			// Create changelog modal
			const modal: ModalBuilder = new ModalBuilder().setCustomId("changelog").setTitle("Changelog erstellen");

			const newInput: TextInputBuilder = new TextInputBuilder()
				.setCustomId("new")
				.setLabel("Neue Funktionen")
				.setRequired(false)
				.setStyle(TextInputStyle.Paragraph);

			const improvedInput: TextInputBuilder = new TextInputBuilder()
				.setCustomId("improved")
				.setLabel("Verbesserte Funktionen")
				.setRequired(false)
				.setStyle(TextInputStyle.Paragraph);

			const fixedInput: TextInputBuilder = new TextInputBuilder()
				.setCustomId("fixed")
				.setLabel("Gefixte Bugs")
				.setRequired(false)
				.setStyle(TextInputStyle.Paragraph);

			const removedInput: TextInputBuilder = new TextInputBuilder()
				.setCustomId("removed")
				.setLabel("Entfernte Funktionen")
				.setRequired(false)
				.setStyle(TextInputStyle.Paragraph);

			const newActionRow: any = new ActionRowBuilder().addComponents(newInput);
			const fixedActionRow: any = new ActionRowBuilder().addComponents(fixedInput);
			const improvedActionRow: any = new ActionRowBuilder().addComponents(improvedInput);
			const removedActionRow: any = new ActionRowBuilder().addComponents(removedInput);
			await modal.addComponents(newActionRow, fixedActionRow, improvedActionRow, removedActionRow);

			await interaction.showModal(modal);
			interaction
				.awaitModalSubmit({
					filter: (int: any): boolean => int.user.id === this.message.author.id,
					time: 10 * 60 * 1000
				})
				.then(async (int: any): Promise<void> => {
					let newFeatures: any = int.fields.getTextInputValue("new");
					let improvedFeatures: any = int.fields.getTextInputValue("improved");
					let fixedFeatures: any = int.fields.getTextInputValue("fixed");
					let removedFeatures: any = int.fields.getTextInputValue("removed");

					if (newFeatures === "") newFeatures = "/";
					newFeatures = newFeatures.split(/\r?\n/);

					if (improvedFeatures === "") improvedFeatures = "/";
					improvedFeatures = improvedFeatures.split(/\r?\n/);

					if (fixedFeatures === "") fixedFeatures = "/";
					fixedFeatures = fixedFeatures.split(/\r?\n/);

					if (removedFeatures === "") removedFeatures = "/";
					removedFeatures = removedFeatures.split(/\r?\n/);

					const date: string = moment(Date.now()).format("DD.MM.YYYY, HH:mm");

					const text: string =
						"### " +
						this.client.emotes.shine +
						" Neue Funktionen\n" +
						this.client.emotes.arrow +
						" " +
						newFeatures.join("\n" + this.client.emotes.arrow + " ") +
						"\n\n\n\n" +
						"### " +
						this.client.emotes.rocket +
						"Verbesserte Funktionen\n" +
						this.client.emotes.arrow +
						" " +
						improvedFeatures.join("\n" + this.client.emotes.arrow + " ") +
						"\n\n\n\n" +
						"### " +
						this.client.emotes.bug +
						" Behobene Fehler\n" +
						this.client.emotes.arrow +
						" " +
						fixedFeatures.join("\n" + this.client.emotes.arrow + " ") +
						"\n\n\n\n" +
						"### " +
						this.client.emotes.error +
						" Entfernte Funktionen\n" +
						this.client.emotes.arrow +
						" " +
						removedFeatures.join("\n" + this.client.emotes.arrow + " ") +
						"\n\n\n\n";

					const changelogEmbed: EmbedBuilder = this.client.createEmbed("{0}", null, "normal", text);
					changelogEmbed.setThumbnail(this.client.user!.displayAvatarURL());
					changelogEmbed.setTitle("Changelog vom " + date);
					this.message.channel.send({ embeds: [changelogEmbed] });

					// Delete messages and close modal
					const sentEmbed: EmbedBuilder = await this.client.createEmbed("Der Changelog wurde erstellt und gesendet", "success", "success");
					await int.update({
						embeds: [sentEmbed],
						components: []
					});
					await this.message.delete().catch((): void => {});
				});
		});
	}
}
