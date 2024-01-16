import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default class RemovewarnCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "remove-warn",
			description: "Removes a member's warning",
			localizedDescriptions: {
				de: "Entfernt eine Verwarnung eines Mitglieds"
			},
			memberPermissions: ["KickMembers"],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addUserOption((option: any) =>
						option
							.setName("member")
							.setNameLocalizations({
								de: "mitglied"
							})
							.setDescription("Choose a member")
							.setDescriptionLocalizations({
								de: "Wähle ein Mitglied"
							})
							.setRequired(true),
					)
					.addIntegerOption((option: any) =>
						option
							.setName("number")
							.setNameLocalizations({
								de: "nummer"
							})
							.setDescription("Choose the warning's number")
							.setDescriptionLocalizations({
								de: "Gib die Nummer der Verwarnung an"
							})
							.setRequired(true)
							.setMinValue(1),
					),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.removeWarn(interaction.options.getMember("member"), interaction.options.getInteger("number"));
	}

	private async removeWarn(member: any, num: number): Promise<any> {
		if (!member) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("basics:errors:missingMember", {}, true),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		if (member.user.id === this.interaction.user.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:cantRemoveFromYourself"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		const targetData: any = await this.client.findOrCreateMember(member.user.id, this.interaction.guild.id);

		if (!targetData.warnings.list[num - 1]) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:missingNumber"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		targetData.warnings.list = targetData.warnings.list.filter(
			(warn: any): boolean => warn !== targetData.warnings.list[num - 1],
		);
		targetData.markModified("warnings");
		await targetData.save();

		const logText: string =
			"### " + this.client.emotes.delete + " " +
			this.translate("logText", { user: member.toString() }) + "\n\n" +
			this.client.emotes.user + " " +
			this.translate("moderator") + ": " +
			this.interaction.member!.toString() + "\n" +
			this.client.emotes.text + " " +
			this.translate("number") + ": " + num;
		const logEmbed: EmbedBuilder = this.client.createEmbed(logText, null, "normal");
		logEmbed.setThumbnail(member.user.displayAvatarURL());
		await this.interaction.guild!.logAction(logEmbed, "moderation");

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("removed", { number: num, user: member.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}
}
