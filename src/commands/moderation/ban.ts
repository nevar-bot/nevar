import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import moment from "moment";
import ems from "enhanced-ms";
const ms: any = ems("de");

export default class BanCommand extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "ban",
			description: "Ban members for a time specified by you",
			localizedDescriptions: {
				de: "Banne Mitglieder für eine von dir bestimmte Zeit"
			},
			memberPermissions: ["BanMembers"],
			botPermissions: ["BanMembers"],
			cooldown: 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addUserOption((option: any) =>
						option
							.setName("member")
							.setNameLocalization("de", "mitglied")
							.setDescription("Select a member")
							.setDescriptionLocalization("de", "Wähle ein Mitglied")
							.setRequired(true),
					)
					.addStringOption((option: any) =>
						option
							.setName("reason")
							.setNameLocalization("de", "grund")
							.setDescription("Choose a reason")
							.setDescriptionLocalization("de", "Gib einen Grund an")
							.setRequired(false),
					)
					.addStringOption((option: any) =>
						option
							.setName("duration")
							.setNameLocalization("de", "dauer")
							.setDescription("Choose a duration (e.g. 1h, 1d, 1h 30m, etc.)")
							.setDescriptionLocalization("de", "Gib eine Dauer an (bspw. 1h, 1d, 1h 30m, etc.)")
							.setRequired(false),
					),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
		await this.ban(
			interaction.options.getUser("member"),
			interaction.options.getString("reason"),
			interaction.options.getString("duration")
		);
	}

	private async ban(member: any, reason: string, duration: string): Promise<any> {
		member = await this.guild!.resolveMember(member.id);
		if (!member) {
			const noMemberEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:memberIsMissing"),
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
				this.translate("errors:targetHasHigherRole"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [higherRoleEmbed] });
		}

		if (!member.bannable) {
			const cantBanEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:targetIsNotBannable", { user: member.toString() }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [cantBanEmbed] });
		}

		if (duration && !ms(duration)) {
			const invalidDurationEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:durationIsInvalid"),
				"error",
				"error",
			);
			return this.interaction.followUp({
				embeds: [invalidDurationEmbed],
			});
		}

		const ban: any = {
			victim: member,
			reason: reason || this.translate("noBanReasonSpecified"),
			duration: duration ? ms(duration) : 200 * 60 * 60 * 24 * 365 * 1000,
		};

		let relativeTime: string = this.client.utils.getDiscordTimestamp(Date.now() + ban.duration, "R");
		if (ban.duration === 200 * 60 * 60 * 24 * 365 * 1000) {
			relativeTime = this.translate("permanentDuration");
		}
		let unbanDate: string = moment(Date.now() + ban.duration).format("DD.MM.YYYY, HH:mm");
		if (ban.duration === 200 * 60 * 60 * 24 * 365 * 1000) {
			unbanDate = "/";
		}

		const privateText: string =
			"### " +
			this.client.emotes.ban + " " +
			this.translate("privateInformationTitle", { guild: this.interaction.guild!.name }) + "\n\n" +
			this.client.emotes.arrow + " " +
			this.getBasicTranslation("reason") + ": " +
			ban.reason +
			"\n" +
			this.client.emotes.arrow + " " +
			this.getBasicTranslation("duration") + ": " +
			relativeTime +
			"\n" +
			this.client.emotes.arrow + " " +
			this.getBasicTranslation("moderator") + ": " +
			this.interaction.user.toString() +
			"\n" +
			this.client.emotes.arrow + " " +
			this.translate("unbanIsAt") + ": " +
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
					this.getBasicTranslation("moderator") + ": " +
					this.interaction.user.username + ", " +
					this.getBasicTranslation("reason") + ": " +
					ban.reason
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
				this.translate("publicInformationTitle", { user: ban.victim.user.username }) + "\n\n" +
				this.client.emotes.arrow + " " +
				this.getBasicTranslation("reason") + ": " +
				ban.reason +
				"\n" +
				this.client.emotes.arrow + " " +
				this.getBasicTranslation("duration") + ": " +
				relativeTime +
				"\n" +
				this.client.emotes.arrow + " " +
				this.getBasicTranslation("moderator") + ": " +
				this.interaction.user.toString() +
				"\n" +
				this.client.emotes.arrow + " " +
				this.translate("unbanIsAt") + ": " +
				unbanDate;
			const publicBanEmbed: EmbedBuilder = this.client.createEmbed(
				publicText,
				null,
				"error",
				ban.victim.user.username,
			);
			publicBanEmbed.setImage("https://media4.giphy.com/media/H99r2HtnYs492/giphy.gif");
			await this.interaction.followUp({
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
			await this.interaction.followUp({
				embeds: [cantBanEmbed],
				components: [],
			});
		}
	}
}
