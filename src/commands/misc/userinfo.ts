import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import moment from "moment";

export default class UserinfoCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "userinfo",
			description: "Displays information about a user",
			localizedDescriptions: {
				de: "Zeigt Informationen über eine/n Nutzer/-in an"
			},
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addUserOption((option: any) =>
					option
						.setName("user")
						.setNameLocalizations({
							de: "mitglied",
						})
						.setDescription("Select a member")
						.setDescriptionLocalizations({
							de: "Wähle ein Mitglied aus"
						})
						.setRequired(false),
				),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.showUserInfo(interaction.options.getUser("member"));
	}

	private async showUserInfo(member: any): Promise<any> {
		if (member) {
			member = await this.interaction.guild!.members.fetch(member.id);
		} else {
			member = this.interaction.member;
		}

		const data: any = await this.client.findOrCreateUser(member.user.id);

		const name: string = member.user.username;
		const displayName: string = member.user.displayName;
		const createdAt: string = this.client.utils.getDiscordTimestamp(member.user.createdTimestamp, "f");
		const createdDiff: string = this.client.utils.getDiscordTimestamp(member.user.createdTimestamp, "R");
		const memberDisplayName: string = member.displayName;
		const joinedAt: string = this.client.utils.getDiscordTimestamp(member.joinedTimestamp, "f");
		const joinedDiff: string = this.client.utils.getDiscordTimestamp(member.joinedTimestamp, "R");
		const bot: string = member.user.bot ? "Ja" : "Nein";
		const userFlags: any[] = (await member.user.fetchFlags()).toArray();

		const flags: any = {
			ActiveDeveloper: this.translate("flags:ActiveDeveloper"),
			BugHunterLevel1: this.translate("flags:BugHunterLevel1"),
			BugHunterLevel2: this.translate("flags:BugHunterLevel2"),
			CertifiedModerator: this.translate("flags:CertifiedModerator"),
			HypeSquadOnlineHouse1: this.translate("flags:HypeSquadOnlineHouse1"),
			HypeSquadOnlineHouse2: this.translate("flags:HypeSquadOnlineHouse2"),
			HypeSquadOnlineHouse3: this.translate("flags:HypeSquadOnlineHouse3"),
			HypeSquadEvents: this.translate("flags:HypeSquadEvents"),
			Partner: this.translate("flags:Partner"),
			PremiumEarlySupporter: this.translate("flags:PremiumEarlySupporter"),
			Staff: this.translate("flags:Staff"),
			VerifiedBot: this.translate("flags:VerifiedBot"),
			VerifiedDeveloper: this.translate("flags:VerifiedDeveloper"),
		};
		// Badges
		let badges: any[] = [];

		// Custom Badges
		// Nevar staff
		if (data.staff.state || this.client.config.general["OWNER_IDS"].includes(member.user.id))
			badges.push(this.client.emotes.flags.Staff + " " + this.client.user!.username + "-" + this.translate("staff"));
		// Nevar partner
		if (data.partner.state)
			badges.push(this.client.emotes.flags.Partner + " " + this.client.user!.username + "-" + this.translate("partner"));
		// Nevar Bughunter
		if (data.bughunter.state)
			badges.push(this.client.emotes.flags.BugHunterLevel1 + " " + this.client.user!.username + "-" + this.translate("bughunter"));

		// Discord badges
		for (const flag of userFlags) {
			if (flags[flag]) badges.push(this.client.emotes.flags[flag] + " " + flags[flag]);
		}

		if (badges.length === 0) badges = [this.client.emotes.arrow + " " + this.translate("noBadges")];

		const text: string =
			this.client.emotes.label + " " +
			this.translate("displayName") + ": **" +
			displayName +
			"**\n" +
			this.client.emotes.label + " " +
			this.translate("serverDisplayName") + ": **" +
			memberDisplayName +
			"**\n" +
			this.client.emotes.user + " " +
			this.translate("userName") + ": **" +
			name +
			"**\n" +
			this.client.emotes.bot + " " +
			this.translate("bot") + ": **" +
			bot +
			"**\n\n" +
			this.client.emotes.calendar + " " +
			this.translate("createdAt") + ": **" +
			createdAt +
			"**\n" +
			this.client.emotes.reminder + " " +
			this.translate("createdBefore") + ": **" +
			createdDiff +
			"**\n\n" +
			this.client.emotes.calendar + " " +
			this.translate("joinedAt") + ": **" +
			joinedAt +
			"**\n" +
			this.client.emotes.reminder + " " +
			this.translate("joinedBefore") + ": **" +
			joinedDiff +
			"**\n\n### " +
			this.client.emotes.shine + " " +
			this.translate("badges") + "\n**" +
			badges.join("\n") +
			"**";

		const userEmbedTitle: EmbedBuilder = this.client.createEmbed(text, null, "normal");
		userEmbedTitle.setTitle(this.client.emotes.information + " " + this.translate("title") + " " + member.user.displayName)
		userEmbedTitle.setThumbnail(member.user.displayAvatarURL());

		return this.interaction.followUp({ embeds: [userEmbedTitle] });
	}
}
