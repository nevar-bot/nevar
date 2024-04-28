import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";
import { SlashCommandBuilder } from "discord.js";
import moment from "moment";
import path from "path";

export default class BanlistCommand extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "banlist",
			description: "Lists all banned members",
			localizedDescriptions: {
				de: "Listet alle gebannten Mitglieder",
			},
			memberPermissions: ["BanMembers"],
			botPermissions: ["BanMembers"],
			cooldown: 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder(),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
		await this.showBanList();
	}

	private async showBanList(): Promise<any> {
		const bannedUsers: any[] = [];
		const bans: any = await this.interaction.guild!.bans.fetch().catch((): void => {});
		for (const ban of bans) {
			const memberData: any = await this.client.findOrCreateMember(ban[1].user.id, this.interaction.guild!.id);
			if (memberData?.banned.state) {
				// Mit Nevar gebannt
				const duration: string =
					memberData.banned.duration === 200 * 60 * 60 * 24 * 365 * 1000
						? this.translate("permanentDuration")
						: this.client.utils.getDiscordTimestamp(Date.now() + memberData.banned.duration, "R");
				const bannedUntil: string =
					memberData.banned.duration === 200 * 60 * 60 * 24 * 365 * 1000
						? "/"
						: this.client.utils.getDiscordTimestamp(memberData.banned.bannedUntil, "f");

				const moderator: any = await this.client.users
					.fetch(memberData.banned.moderator.id)
					.catch((): void => {});
				const text: string =
					"### " +
					this.client.emotes.ban +
					" " +
					ban[1].user.username +
					"\n" +
					this.client.emotes.arrow + " " +
					this.getBasicTranslation("reason") + ": " +
					memberData.banned.reason +
					"\n" +
					this.client.emotes.arrow + " " +
					this.getBasicTranslation("moderator") + ": " +
					(moderator ? moderator.username : memberData.banned.moderator.name) +
					"\n" +
					this.client.emotes.arrow + " " +
					this.getBasicTranslation("duration") + ": " +
					duration +
					"\n" +
					this.client.emotes.arrow + " " +
					this.translate("bannedAt") + ": " +
					this.client.utils.getDiscordTimestamp(memberData.banned.bannedAt, "f") +
					"\n" +
					this.client.emotes.arrow + " " +
					this.translate("unbanIsAt") + ": " +
					bannedUntil +
					"\n";
				bannedUsers.push(text);
			} else {
				// Nicht mit Nevar gebannt
				const text: string =
					"### " +
					this.client.emotes.ban +
					" " +
					ban[1].user.username +
					"\n" +
					this.client.emotes.arrow + " " +
					this.getBasicTranslation("reason") + ": " +
					(ban[1].reason ? ban[1].reason : this.translate("noBanReasonSpecified")) +
					"\n";
				bannedUsers.push(text);
			}
		}
		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			3,
			bannedUsers,
			this.translate("list:title"),
			this.translate("list:noBannedUsers")
		);
	}
}
