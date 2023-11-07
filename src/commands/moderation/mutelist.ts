import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import moment from "moment";
import { SlashCommandBuilder } from "discord.js";

export default class MutelistCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "mutelist",
			description: "Listet alle gemuteten Mitglieder",
			memberPermissions: ["ManageRoles"],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		await this.showMuteList(data);
	}

	private async showMuteList(data: any): Promise<void> {
		const mutedUsers: any[] = [];

		for (const memberData of this.client.databaseCache.mutedUsers) {
			if (memberData[1].guildID === this.interaction.guild.id) {
				const victimData: any = memberData[1];
				const member: any = await this.interaction.guild.resolveMember(victimData.id);
				const text: string =
					member.user.username +
					"\n" +
					this.client.emotes.arrow +
					"Begründung: " +
					victimData.muted.reason +
					"\n" +
					this.client.emotes.arrow +
					"Moderator: " +
					victimData.muted.moderator.name +
					"\n" +
					this.client.emotes.arrow +
					"Dauer: " +
					this.client.utils.getDiscordTimestamp(
						Date.now() + victimData.muted.duration,
						"R"
					) +
					"\n" +
					this.client.emotes.arrow +
					"Gemutet am: " +
					moment(victimData.muted.mutedAt).format("DD.MM.YYYY, HH:mm") +
					"\n" +
					this.client.emotes.arrow +
					"Gemutet bis: " +
					moment(victimData.muted.mutedUntil).format("DD.MM.YYYY, HH:mm") +
					"\n";
				mutedUsers.push(text);
			}
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			3,
			mutedUsers,
			"Gemutete Mitglieder",
			"Es sind keine Mitglieder gemutet",
			"timeout"
		);
	}
}
