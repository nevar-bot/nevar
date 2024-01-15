import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder } from "discord.js";
import moment from "moment";
import ems from "enhanced-ms";
const ms: any = ems("de");

export default class BanCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "ban",
			description: "Ban members for a time specified by you",
			localizedDescriptions: {
				de: "Banne Mitglieder für eine von dir bestimmte Zeit"
			},
			memberPermissions: ["BanMembers"],
			botPermissions: ["BanMembers"],
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
								de: "Wähle ein Mitglied aus"
							})
							.setRequired(true),
					)
					.addStringOption((option: any) =>
						option
							.setName("reason")
							.setNameLocalizations({
								de: "grund"
							})
							.setDescription("Choose a reason")
							.setDescriptionLocalizations({
								de: "Gib einen Grund an"
							})
							.setRequired(false),
					)
					.addStringOption((option: any) =>
						option
							.setName("duration")
							.setNameLocalizations({
								de: "dauer"
							})
							.setDescription("Choose a duration (e.g. 1h, 1d, 1h 30m, etc.)")
							.setDescriptionLocalizations({
								de: "Gib eine Dauer an (bspw. 1h, 1d, 1h 30m, etc.)"
							})
							.setRequired(false),
					),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		await this.ban(
			interaction.options.getUser("member"),
			interaction.options.getString("reason"),
			interaction.options.getString("duration"),
			data,
		);
	}

	private async ban(member: any, reason: string, duration: string, data: any): Promise<any> {
		member = await this.interaction.guild!.resolveMember(member.id);
		if (!member) {
			const noMemberEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:missingMember"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [noMemberEmbed] });
		}

		if (member.user.id === this.interaction.user.id) {
			const selfEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:cantBanYourself"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [selfEmbed] });
		}

		if (member.user.id === this.client.user!.id) {
			const meEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:cantBanMyself"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [meEmbed] });
		}

		if (member.roles.highest.position >= this.interaction.member!.roles.highest.position) {
			const higherRoleEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:cantBanHigher"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [higherRoleEmbed] });
		}

		if (!member.bannable) {
			const cantBanEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:cantBan"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [cantBanEmbed] });
		}

		if (duration && !ms(duration)) {
			const invalidDurationEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:invalidDuration"),
				"error",
				"error",
			);
			return this.interaction.followUp({
				embeds: [invalidDurationEmbed],
			});
		}

		const ban: any = {
			victim: member,
			reason: reason || this.translate("noReasonSpecified"),
			duration: duration ? ms(duration) : 200 * 60 * 60 * 24 * 365 * 1000,
		};

		let relativeTime: string = this.client.utils.getDiscordTimestamp(Date.now() + ban.duration, "R");
		if (ban.duration === 200 * 60 * 60 * 24 * 365 * 1000) {
			relativeTime = this.translate("permanent");
		}
		let unbanDate: string = moment(Date.now() + ban.duration).format("DD.MM.YYYY, HH:mm");
		if (ban.duration === 200 * 60 * 60 * 24 * 365 * 1000) {
			unbanDate = "/";
		}

		const areYouSureEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("confirmation", { user: member.toString() }),
			"arrow",
			"warning",
		);
		const buttonYes: ButtonBuilder = this.client.createButton("confirm", this.translate("basics:yes", undefined, true), "Secondary", "success");
		const buttonNo: ButtonBuilder = this.client.createButton("decline", this.translate("basics:no", undefined, true), "Secondary", "error");
		const buttonRow: any = this.client.createMessageComponentsRow(buttonYes, buttonNo);

		const confirmationAskMessage: any = await this.interaction.followUp({
			embeds: [areYouSureEmbed],
			components: [buttonRow],
		});

		const confirmationButtonCollector = confirmationAskMessage.createMessageComponentCollector({
			filter: (i: any): boolean => i.user.id === this.interaction.user.id,
			time: 1000 * 60 * 5,
			max: 1,
		});
		confirmationButtonCollector.on("collect", async (clicked: any): Promise<void> => {
			const confirmation = clicked.customId;

			switch (confirmation) {
				case "confirm":
					const privateText: string =
						"### " +
						this.client.emotes.ban + " " +
						this.translate("privateMessage:title", { guild: this.interaction.guild!.name }) + "\n\n" +
						this.client.emotes.arrow + " " +
						this.translate("reason") + ": " +
						ban.reason +
						"\n" +
						this.client.emotes.arrow + " " +
						this.translate("duration") + ": " +
						relativeTime +
						"\n" +
						this.client.emotes.arrow + " " +
						this.translate("moderator") + ": " +
						this.interaction.user.username +
						"\n" +
						this.client.emotes.arrow + " " +
						this.translate("unbanAt") + ": " +
						unbanDate;

					const privateBanEmbed: EmbedBuilder = this.client.createEmbed(
						privateText,
						null,
						"error"
					);
					const privateMessage = await ban.victim.send({ embeds: [privateBanEmbed] }).catch((): void => {});
					try {
						await ban.victim.ban({
							reason:
								this.translate("duration") + ": " +
								relativeTime + " | " +
								this.translate("reason") + ": " +
								ban.reason + " | " +
								this.translate("moderator") + ": " +
								this.interaction.user.username + " | " +
								this.translate("unbanAt") + ": " +
								unbanDate,
						});
						const victimData = await this.client.findOrCreateMember(
							ban.victim.user.id,
							this.interaction.guild!.id,
						);

						victimData.banned = {
							state: true,
							reason: ban.reason,
							moderator: {
								name: this.interaction.user.username,
								id: this.interaction.user.id,
							},
							duration: ban.duration,
							bannedAt: Date.now(),
							bannedUntil: Date.now() + ban.duration,
						};
						victimData.markModified("banned");
						await victimData.save();
						this.client.databaseCache.bannedUsers.set(
							ban.victim.user.id + this.interaction.guild!.id,
							victimData,
						);

						const publicText: string =
							"### " +
							this.client.emotes.ban + " " +
							this.translate("publicMessage:title", { user: ban.victim.user.username }) + "\n\n" +
							this.client.emotes.arrow + " " +
							this.translate("reason") + ": " +
							ban.reason +
							"\n" +
							this.client.emotes.arrow + " " +
							this.translate("duration") + ": " +
							relativeTime +
							"\n" +
							this.client.emotes.arrow + " " +
							this.translate("moderator") + ": " +
							this.interaction.user.username +
							"\n" +
							this.client.emotes.arrow + " " +
							this.translate("unbanAt") + ": " +
							unbanDate;
						const publicBanEmbed: EmbedBuilder = this.client.createEmbed(
							publicText,
							null,
							"error",
							ban.victim.user.username,
						);
						publicBanEmbed.setImage("https://media4.giphy.com/media/H99r2HtnYs492/giphy.gif");
						await clicked.update({
							embeds: [publicBanEmbed],
							components: [],
						});
					} catch (exc) {
						//console.log(exc);
						privateMessage.delete().catch((): void => {});
						const cantBanEmbed: EmbedBuilder = this.client.createEmbed(
							this.translate("errors:banFailed", { user: ban.victim.user.toString() }),
							"error",
							"error",
						);
						await clicked.update({
							embeds: [cantBanEmbed],
							components: [],
						});
					}
					break;
				case "decline":
					const declineEmbed: EmbedBuilder = this.client.createEmbed(
						this.translate("banRejected", { user: ban.victim.user.toString() }),
						"error",
						"error",
					);
					await clicked.update({
						embeds: [declineEmbed],
						components: [],
					});
					break;
			}
		});
	}
}
