import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder, ButtonBuilder, Attachment } from "discord.js";
import { AttachmentBuilder } from "discord.js";

export default class ExportdataCommand extends BaseCommand {
	constructor(client: BaseClient) {
		super(client, {
			name: "exportdata",
			description: "Exportiert deine Daten als JSON Datei",
			cooldown: 5000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addStringOption((option: any) =>
					option
						.setName("daten")
						.setDescription("Wähle, welche Daten du exportieren möchtest")
						.setRequired(true)
						.addChoices(
							{
								name: "deine Nutzerdaten",
								value: "user"
							},
							{
								name: "deine Mitgliedsdaten auf diesem Server",
								value: "member"
							},
							{
								name: "Daten dieses Servers",
								value: "guild"
							}
						)
				)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		await this.exportData(interaction.member, interaction.options.getString("daten"), data);
	}

	private async exportData(member: any, type: string, data: any): Promise<void> {
		if (type === "user") {
			const userData = data.user.toObject();
			const fieldsToReplace: string[] = ["_id", "__v"];
			for (const field of fieldsToReplace) {
				userData[field] = "-- aus Sicherheitsgründen entfernt --";
			}
			const attachment: AttachmentBuilder = new AttachmentBuilder(
				Buffer.from(JSON.stringify(userData, null, 4)),
				{
					name: this.interaction.user.id + ".json"
				}
			);
			const embed: EmbedBuilder = this.client.createEmbed(
				"Hier sind deine exportierten Nutzerdaten:",
				"success",
				"success"
			);
			return this.interaction.followUp({
				embeds: [embed],
				files: [attachment]
			});
		}

		if (type === "member") {
			const userData = data.member.toObject();
			const fieldsToReplace: string[] = ["_id", "__v"];
			for (const field of fieldsToReplace) {
				userData[field] = "-- aus Sicherheitsgründen entfernt --";
			}
			const attachment: AttachmentBuilder = new AttachmentBuilder(
				Buffer.from(JSON.stringify(userData, null, 4)),
				{
					name: this.interaction.user.id + ".json"
				}
			);
			const embed: EmbedBuilder = this.client.createEmbed(
				"Hier sind deine exportierten Nutzerdaten:",
				"success",
				"success"
			);
			return this.interaction.followUp({
				embeds: [embed],
				files: [attachment]
			});
		}

		if (type === "guild") {
			if ((await this.interaction.guild.fetchOwner()).user.id !== this.interaction.user.id) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					"Nur der Eigentümer dieses Servers kann die Serverdaten exportieren.",
					"error",
					"error"
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			}

			const userData = data.guild.toObject();
			const fieldsToReplace: string[] = ["_id", "__v", "members", "membersData"];
			for (const field of fieldsToReplace) {
				userData[field] = "-- aus Sicherheitsgründen entfernt --";
			}
			const attachment: AttachmentBuilder = new AttachmentBuilder(
				Buffer.from(JSON.stringify(userData, null, 4)),
				{
					name: this.interaction.user.id + ".json"
				}
			);
			const embed: EmbedBuilder = this.client.createEmbed(
				"Hier sind deine exportierten Nutzerdaten:",
				"success",
				"success"
			);
			return this.interaction.followUp({
				embeds: [embed],
				files: [attachment]
			});
		}
	}
}
