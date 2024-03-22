import BaseCommand from "@structures/BaseCommand.js";
import BaseClient from "@structures/BaseClient.js";
import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder } from "discord.js";
import ems from "enhanced-ms";
import path from "path";
const ms: any = ems("de");

export default class TimeoutCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "timeout",
			description: "Timeouts a member for a certain time",
			localizedDescriptions: {
				de: "Timeoutet ein Mitglied für eine bestimmte Zeit",
			},
			memberPermissions: ["ModerateMembers"],
			botPermissions: [],
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
					.addStringOption((option: any) =>
						option
							.setName("duration")
							.setNameLocalization("de", "dauer")
							.setDescription("Choose a duration (e.g. 1h, 1d, 1h 30m, etc.)")
							.setDescriptionLocalization("de", "Gib eine Dauer an (bspw. 1h, 1d, 1h 30m, etc.)")
							.setRequired(true),
					)
					.addStringOption((option: any) =>
						option
							.setName("reason")
							.setNameLocalization("de", "grund")
							.setDescription("Enter a reason")
							.setDescriptionLocalization("de", "Gib einen Grund an")
							.setRequired(false),
					)

			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
		await this.timeout(
			interaction.options.getMember("member"),
			interaction.options.getString("reason"),
			interaction.options.getString("duration")
		);
	}

	private async timeout(targetMember: any, givenReason: string, duration: string): Promise<any> {
		await targetMember.fetch().catch((): void => {});
		const moderator: any = this.interaction.member;
		const reason: string = givenReason || this.translate("noTimeoutReasonSpecified");
		const durationInMs: string|undefined = ms(duration);

		/* No member chosen */
		if (!targetMember) {
			const noMemberEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:memberIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [noMemberEmbed] });
		}

		/* User tries to timeout himself */
		if (targetMember.user.id === this.interaction.user.id) {
			const selfEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:cantTimeoutYourself"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [selfEmbed] });
		}

		/* Target is a bot */
		if (targetMember.user.bot) {
			const botEmbed: EmbedBuilder = this.client.createEmbed(this.translate("errors:cantTimeoutBots"), "error", "error");
			return this.interaction.followUp({ embeds: [botEmbed] });
		}

		/* Target has higher role */
		if (targetMember.roles.highest.position >= this.interaction.member!.roles.highest.position) {
			const higherRoleEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:targetHasHigherRole"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [higherRoleEmbed] });
		}

		/* Target is already timeouted */
		if(targetMember.isCommunicationDisabled()){
			const timeoutedUntilString: string = this.client.utils.getDiscordTimestamp(targetMember.communicationDisabledUntilTimestamp, "R");
			const alreadyTimeoutedEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:targetIsAlreadyInTimeout", { user: targetMember.user.toString(), date: timeoutedUntilString }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [alreadyTimeoutedEmbed] });
		}

		/* Invalid duration */
		if (duration && !ms(duration)) {
			const invalidDurationEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:durationIsInvalid"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidDurationEmbed] });
		}

		/* Duration is more than 28 days */
		if (ms(duration) > 28 * 24 * 60 * 60 * 1000) {
			const tooLongDurationEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:durationIsTooLong"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [tooLongDurationEmbed] });
		}

		const relativeTimeString: string = this.client.utils.getDiscordTimestamp(Date.now() + durationInMs!, "R");
		const timeoutEndsAt: string = this.client.utils.getDiscordTimestamp(Date.now() + durationInMs!, "F");

		/* Send confirmation message */
		const confirmationEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("confirmRequestedTimeout", { user: targetMember.toString() }),
			"arrow",
			"warning"
		);

		const confirmButton: ButtonBuilder = this.client.createButton("confirm", this.getBasicTranslation("yes"), "Secondary", "success");
		const declineButton: ButtonBuilder = this.client.createButton("decline", this.getBasicTranslation("no"), "Secondary", "error");
		const buttonRow: any = this.client.createMessageComponentsRow(confirmButton, declineButton);

		const confirmationMessage: any = await this.interaction.followUp({
			embeds: [confirmationEmbed],
			components: [buttonRow],
		});

		const confirmationMessageCollector: any = confirmationMessage.createMessageComponentCollector({
			filter: (i: any): boolean => i.user.id === this.interaction.user.id,
			time: 1000 * 60 * 5,
			max: 1,
		});

		confirmationMessageCollector.on("collect", async (clicked: any): Promise<void> => {
			const confirmation = clicked.customId;

			switch (confirmation) {
				case "confirm":
					targetMember.timeout(durationInMs, moderator.user.username + " - " + reason)
						.then(async (): Promise<void> => {
							const privateMessageText: string =
								"### " + this.client.emotes.timeout + " " +
								this.translate("privateInformationTitle", { guild: this.interaction.guild!.name }) + "\n\n" +
								this.client.emotes.arrow + " " + this.getBasicTranslation("reason")+ ": " + reason + "\n" +
								this.client.emotes.arrow + " " + this.getBasicTranslation("duration") + ": " + relativeTimeString + "\n" +
								this.client.emotes.arrow + " " + this.translate("timeoutEndsAt") + ": " + timeoutEndsAt + "\n" +
								this.client.emotes.arrow + " " + this.getBasicTranslation("moderator") + ": " + moderator.toString();

							const privateMessageEmbed: EmbedBuilder = this.client.createEmbed(
								privateMessageText,
								null,
								"error",
							);

							await targetMember.send({ embeds: [privateMessageEmbed] }).catch((): void => {});

							const logMessageText: string =
								this.client.emotes.user + " " + this.getBasicTranslation("moderator") + ": " + moderator.toString() + "\n" +
								this.client.emotes.text + " " + this.getBasicTranslation("reason") + ": " + reason;

							const logMessageEmbed: EmbedBuilder = this.client.createEmbed(logMessageText, null, "normal");
							logMessageEmbed.setTitle(this.client.emotes.timeout + " " + this.translate("publicInformationTitle", { user: targetMember.toString() }));
							logMessageEmbed.setThumbnail(targetMember.displayAvatarURL());
							await this.interaction.guild!.logAction(logMessageEmbed, "moderation");

							const publicMessageText: string =
								"### " + this.client.emotes.timeout + " " +
								this.translate("publicInformationTitle", { user: targetMember.toString() }) + "\n\n" +
								this.client.emotes.arrow + " " + this.getBasicTranslation("reason") + ": " + reason + "\n" +
								this.client.emotes.arrow + " " + this.getBasicTranslation("duration") + ": " + relativeTimeString + "\n" +
								this.client.emotes.arrow + " " + this.translate("timeoutEndsAt") + ": " + timeoutEndsAt + "\n" +
								this.client.emotes.arrow + " " + this.getBasicTranslation("moderator") + ": " + moderator.toString();

							const publicMessageEmbed: EmbedBuilder = this.client.createEmbed(
								publicMessageText,
								null,
								"error"
							);
							publicMessageEmbed.setImage("https://c.tenor.com/VphNodL96w8AAAAC/mute-discord-mute.gif");

							await clicked.update({ embeds: [publicMessageEmbed], components: [] });
						})
						.catch(async (): Promise<void> => {
							const timeoutFailedEmbed: EmbedBuilder = this.client.createEmbed(
								this.translate("errors:timeoutFailed", { user: targetMember.toString() }),
								"error",
								"error"
							);
							await clicked.update({ embeds: [timeoutFailedEmbed], components: [] });
						});
					break;
				case "decline":
					const timeoutDeclinedEmbed: EmbedBuilder = this.client.createEmbed(
						this.translate("requestedTimeoutDeclined", { user: targetMember.toString() }),
						"error",
						"error",
					);
					await clicked.update({ embeds: [timeoutDeclinedEmbed], components: [] });
					break;
			}
		});
	}
}