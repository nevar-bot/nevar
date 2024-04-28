import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import * as timers from "timers";
import path from "path";

export default class RemovewarnCommand extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "remove-warn",
			description: "Removes a member's warning",
			localizedDescriptions: {
				de: "Entfernt eine Verwarnung eines Mitglieds"
			},
			memberPermissions: ["KickMembers"],
			cooldown: 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addUserOption((option: any) =>
						option
							.setName("member")
							.setNameLocalization("de", "mitglied")
							.setDescription("Choose a member")
							.setDescriptionLocalization("de", "Wähle ein Mitglied")
							.setRequired(true),
					)
					.addIntegerOption((option: any) =>
						option
							.setName("number")
							.setNameLocalization("de", "nummer")
							.setDescription("Enter the warning's number")
							.setDescriptionLocalization("de", "Wähle die Nummer der Verwarnung")
							.setRequired(true)
							.setMinValue(1),
					),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
		await this.removeWarn(interaction.options.getMember("member"), interaction.options.getInteger("number"));
	}

	private async removeWarn(member: any, num: number): Promise<any> {
		if (!member) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:memberIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		if (member.user.id === this.interaction.user.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:cantRemoveWarnsFromYourself"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		const targetData: any = await this.client.findOrCreateMember(member.user.id, this.interaction.guild.id);

		if (!targetData.warnings.list[num - 1]) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:numberIsMissing"),
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
			this.translate("loggingTitle", { user: member.toString() }) + "\n\n" +
			this.client.emotes.user + " " +
			this.getBasicTranslation("moderator") + ": " +
			this.interaction.member!.toString() + "\n" +
			this.client.emotes.text + " " +
			this.translate("warningNumber") + ": " + num;
		const logEmbed: EmbedBuilder = this.client.createEmbed(logText, null, "normal");
		logEmbed.setThumbnail(member.user.displayAvatarURL());
		await this.interaction.guild!.logAction(logEmbed, "moderation");

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("warningRemoved", { number: num, user: member.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}
}
