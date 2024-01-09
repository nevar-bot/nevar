import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder, ButtonBuilder, Attachment } from "discord.js";
import { AttachmentBuilder } from "discord.js";

export default class ExportdataCommand extends BaseCommand {
	constructor(client: BaseClient) {
		super(client, {
			name: "exportdata",
			description: "Exports your data as a JSON file",
			localizedDescriptions: {
				de: "Exportiert deine Daten als JSON Datei"
			},
			cooldown: 5000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addStringOption((option: any) =>
					option
						.setName("data")
						.setNameLocalizations({
							de: "daten"
						})
						.setDescription("Choose which data you want to export")
						.setDescriptionLocalizations({
							de: "Wähle, welche Daten du exportieren möchtest"
						})
						.setRequired(true)
						.addChoices(
							{
								name: "your user data",
								name_localizations: {
									de: "deine Nutzerdaten"
								},
								value: "user",
							},
							{
								name: "your member data on this server",
								name_localizations: {
									de: "deine Mitgliedsdaten auf diesem Server"
								},
								value: "member",
							},
							{
								name: "data of this server",
								name_localizations: {
									de: "Daten dieses Servers"
								},
								value: "guild",
							},
						),
				),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.exportData(interaction.member, interaction.options.getString("data"), data);
	}

	private async exportData(member: any, type: string, data: any): Promise<any> {
		const removedToSecurityReasons: string = this.translate("removedToSecurityReasons");
		if (type === "user") {
			const userData = data.user.toObject();
			const fieldsToReplace: string[] = ["_id", "__v"];
			for (const field of fieldsToReplace) {
				userData[field] = removedToSecurityReasons;
			}
			const attachment: AttachmentBuilder = new AttachmentBuilder(
				Buffer.from(JSON.stringify(userData, null, 4)),
				{
					name: this.interaction.user.id + ".json",
				},
			);
			const embed: EmbedBuilder = this.client.createEmbed(
				this.translate("exported:user"),
				"success",
				"success",
			);
			return this.interaction.followUp({
				embeds: [embed],
				files: [attachment],
			});
		}

		if (type === "member") {
			const userData = data.member.toObject();
			const fieldsToReplace: string[] = ["_id", "__v"];
			for (const field of fieldsToReplace) {
				userData[field] = removedToSecurityReasons;
			}
			const attachment: AttachmentBuilder = new AttachmentBuilder(
				Buffer.from(JSON.stringify(userData, null, 4)),
				{
					name: this.interaction.user.id + ".json",
				},
			);
			const embed: EmbedBuilder = this.client.createEmbed(
				this.translate("exported:member"),
				"success",
				"success",
			);
			return this.interaction.followUp({
				embeds: [embed],
				files: [attachment],
			});
		}

		if (type === "guild") {
			if ((await this.interaction.guild!.fetchOwner()).user.id !== this.interaction.user.id) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("errors:onlyOwnerCanExportGuildData"),
					"error",
					"error",
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			}

			const userData = data.guild.toObject();
			const fieldsToReplace: string[] = ["_id", "__v", "members", "membersData"];
			for (const field of fieldsToReplace) {
				userData[field] = removedToSecurityReasons;
			}
			const attachment: AttachmentBuilder = new AttachmentBuilder(
				Buffer.from(JSON.stringify(userData, null, 4)),
				{
					name: this.interaction.user.id + ".json",
				},
			);
			const embed: EmbedBuilder = this.client.createEmbed(
				this.translate("exported:guild"),
				"success",
				"success",
			);
			return this.interaction.followUp({
				embeds: [embed],
				files: [attachment],
			});
		}
	}
}
