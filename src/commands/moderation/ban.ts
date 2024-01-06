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
			description: "Bannt ein Mitglied für eine bestimmte Zeit",
			memberPermissions: ["BanMembers"],
			botPermissions: ["BanMembers"],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addUserOption((option: any) =>
						option.setName("mitglied").setDescription("Wähle ein Mitglied").setRequired(true),
					)
					.addStringOption((option: any) =>
						option.setName("grund").setDescription("Gib einen Grund an").setRequired(false),
					)
					.addStringOption((option: any) =>
						option
							.setName("dauer")
							.setDescription("Gib eine Dauer an (bspw. 1h, 1d, 1h 30m, etc.)")
							.setRequired(false),
					),
			},
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		await this.ban(
			interaction.options.getUser("mitglied"),
			interaction.options.getString("grund"),
			interaction.options.getString("dauer"),
			data,
		);
	}

	private async ban(member: any, reason: string, duration: string, data: any): Promise<void> {
		member = await this.interaction.guild.resolveMember(member.id);
		if (!member) {
			const noMemberEmbed: EmbedBuilder = this.client.createEmbed(
				"Du musst ein Mitglied angeben.",
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [noMemberEmbed] });
		}

		if (member.user.id === this.interaction.user.id) {
			const selfEmbed: EmbedBuilder = this.client.createEmbed(
				"Du kannst dich nicht selbst bannen.",
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [selfEmbed] });
		}

		if (member.user.id === this.client.user!.id) {
			const meEmbed: EmbedBuilder = this.client.createEmbed(
				"Ich kann mich nicht selbst bannen.",
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [meEmbed] });
		}

		if (member.roles.highest.position >= this.interaction.member.roles.highest.position) {
			const higherRoleEmbed: EmbedBuilder = this.client.createEmbed(
				"Du kannst keine Mitglieder bannen, die eine höhere Rolle haben als du.",
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [higherRoleEmbed] });
		}

		if (!member.bannable) {
			const cantBanEmbed: EmbedBuilder = this.client.createEmbed(
				"Ich kann dieses Mitglied nicht bannen.",
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [cantBanEmbed] });
		}

		if (duration && !ms(duration)) {
			const invalidDurationEmbed: EmbedBuilder = this.client.createEmbed(
				"Du hast eine ungültige Dauer angegeben.",
				"error",
				"error",
			);
			return this.interaction.followUp({
				embeds: [invalidDurationEmbed],
			});
		}

		const ban: any = {
			victim: member,
			reason: reason || "Kein Grund angegeben",
			duration: duration ? ms(duration) : 200 * 60 * 60 * 24 * 365 * 1000,
		};

		let relativeTime: string = this.client.utils.getDiscordTimestamp(Date.now() + ban.duration, "R");
		if (ban.duration === 200 * 60 * 60 * 24 * 365 * 1000) {
			relativeTime = "Permanent";
		}
		let unbanDate: string = moment(Date.now() + ban.duration).format("DD.MM.YYYY, HH:mm");
		if (ban.duration === 200 * 60 * 60 * 24 * 365 * 1000) {
			unbanDate = "/";
		}

		const areYouSureEmbed: EmbedBuilder = this.client.createEmbed(
			"Bist du dir sicher, dass du {0} bannen möchtest?",
			"arrow",
			"warning",
			member.user.username,
		);
		const buttonYes: ButtonBuilder = this.client.createButton("confirm", "Ja", "Secondary", "success");
		const buttonNo: ButtonBuilder = this.client.createButton("decline", "Nein", "Secondary", "error");
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
						this.client.emotes.ban +
						" Du wurdest auf {0} gebannt.\n\n" +
						this.client.emotes.arrow +
						" Begründung: " +
						ban.reason +
						"\n" +
						this.client.emotes.arrow +
						" Dauer: " +
						relativeTime +
						"\n" +
						this.client.emotes.arrow +
						" Moderator: " +
						this.interaction.user.username +
						"\n" +
						this.client.emotes.arrow +
						" Unban am: " +
						unbanDate;
					const privateBanEmbed: EmbedBuilder = this.client.createEmbed(
						privateText,
						null,
						"error",
						this.interaction.guild.name,
					);
					const privateMessage = await ban.victim.send({ embeds: [privateBanEmbed] }).catch((): void => {});
					try {
						await ban.victim.ban({
							reason:
								"BAN - Dauer: " +
								relativeTime +
								" | Begründung: " +
								ban.reason +
								" | Moderator: " +
								this.interaction.user.username +
								" | Unban am: " +
								unbanDate,
						});
						const victimData = await this.client.findOrCreateMember(
							ban.victim.user.id,
							this.interaction.guild.id,
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
							ban.victim.user.id + this.interaction.guild.id,
							victimData,
						);

						const publicText: string =
							"### " +
							this.client.emotes.ban +
							" {0} wurde gebannt.\n\n" +
							this.client.emotes.arrow +
							" Begründung: " +
							ban.reason +
							"\n" +
							this.client.emotes.arrow +
							" Dauer: " +
							relativeTime +
							"\n" +
							this.client.emotes.arrow +
							" Moderator: " +
							this.interaction.user.username +
							"\n" +
							this.client.emotes.arrow +
							" Unban am: " +
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
							"Ich konnte {0} nicht bannen.",
							"error",
							"error",
							ban.victim.user.username,
						);
						await clicked.update({
							embeds: [cantBanEmbed],
							components: [],
						});
					}
					break;
				case "decline":
					const declineEmbed: EmbedBuilder = this.client.createEmbed(
						"{0} wurde nicht gebannt.",
						"error",
						"error",
						ban.victim.user.username,
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
