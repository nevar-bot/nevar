import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default class KickCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "kick",
			description: "Kicks a member from the server",
			localizedDescriptions: {
				de: "Kickt ein Mitglied vom Server",
			},
			memberPermissions: ["KickMembers"],
			botPermissions: ["KickMembers"],
			cooldown: 1000,
			dirname: __dirname,
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
					.addStringOption((option: any) =>
						option
							.setName("reason")
							.setNameLocalization("de", "grund")
							.setDescription("Enter a reason")
							.setDescriptionLocalization("de", "Gib ggf. einen Grund an")
							.setRequired(false),
					),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction;
		this.data = data;
		await this.kick(interaction.options.getMember("member"), interaction.options.getString("reason"));
	}

	private async kick(member: any, reason: string): Promise<any> {
		if (member.user.id === this.interaction.member!.user.id) {
			const cantKickYourselfEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:cantKickYourself"),
				"error",
				"error",
			);
			return this.interaction.followUp({
				embeds: [cantKickYourselfEmbed],
			});
		}
		if (member.user.id === this.client.user!.id) {
			const cantKickBotEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:cantKickMyself"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [cantKickBotEmbed] });
		}
		if (!member.kickable) {
			const cantKickEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:targetIsNotKickable", { user: member.toString() }),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [cantKickEmbed] });
		}
		if (member.roles.highest.position >= this.interaction.member!.roles.highest.position) {
			const higherRoleEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:targetHasHigherRole"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [higherRoleEmbed] });
		}
		if (!reason) reason = this.translate("noKickReasonSpecified");

		member
			.kick(this.interaction.member!.user.username + " - " + reason)
			.then(async (): Promise<any> => {
				const privateText: string =
					"### " +
					this.client.emotes.leave + " " +
					this.translate("privateInformationTitle", { guild: this.interaction.guild!.name }) + "\n\n" +
					this.client.emotes.arrow + " " +
					this.getBasicTranslation("reason") + ": " +
					reason +
					"\n" +
					this.client.emotes.arrow + " " +
					this.getBasicTranslation("moderator") + ": " +
					this.interaction.member!.user.username;
				const privateEmbed: EmbedBuilder = this.client.createEmbed(privateText, null, "error");
				await member.send({ embeds: [privateEmbed] }).catch((): void => {});

				const logText: string =
					"### " +
					this.client.emotes.events.member.ban + " " +
					this.translate("publicInformationTitle", { user: member.user.username }) + "\n\n" +
					this.client.emotes.user + " " +
					this.getBasicTranslation("moderator") + ": " +
					this.interaction.member!.user.username +
					"\n" +
					this.client.emotes.text + " " +
					this.getBasicTranslation("reason") + ": " +
					reason;
				const logEmbed: EmbedBuilder = this.client.createEmbed(logText, null, "error");
				logEmbed.setThumbnail(member.user.displayAvatarURL());
				await this.interaction.guild!.logAction(logEmbed, "moderation");

				const publicText: string =
					"### " +
					this.client.emotes.leave + " " +
					this.translate("publicInformationTitle", { user: member.user.username }) + "\n\n" +
					this.client.emotes.arrow + " " +
					this.getBasicTranslation("reason") + ": " +
					reason +
					"\n" +
					this.client.emotes.arrow + " " +
					this.getBasicTranslation("moderator") + ": " +
					this.interaction.member!.user.username;
				const publicEmbed: EmbedBuilder = this.client.createEmbed(publicText, null, "error");
				return this.interaction.followUp({ embeds: [publicEmbed] });
			})
			.catch(async (): Promise<any> => {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("errors:kickFailed", { user: member.user.toString() }),
					"error",
					"error",
					member.user.username,
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			});
	}
}
