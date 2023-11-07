import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(message: any, data: any, guild: any): Promise<void> {
		let afkUsers: any[] = [];

		if (message.mentions.repliedUser) {
			const mentionData = await this.client.findOrCreateUser(message.mentions.repliedUser.id);

			if (mentionData.afk?.state) {
				const afkSince: string = this.client.utils.getDiscordTimestamp(
					mentionData.afk.since,
					"R"
				);
				afkUsers = afkUsers.filter(
					(u): boolean => u.id !== message.mentions.repliedUser.id
				);

				afkUsers.push({
					name: message.mentions.repliedUser.username,
					id: message.mentions.repliedUser.id,
					reason: mentionData.afk.reason || "Kein Grund angegeben",
					since: afkSince
				});
			}
		}

		if (message.mentions.users) {
			const users: any = Array.from(message.mentions.users);

			for (const user of users) {
				const mentionData = await this.client.findOrCreateUser(user[1].id);

				if (mentionData.afk?.state) {
					const afkSince: string = this.client.utils.getDiscordTimestamp(
						mentionData.afk.since,
						"R"
					);
					afkUsers = afkUsers.filter((u: any): boolean => u.id !== user[1].id);
					afkUsers.push({
						name: user[1].username,
						displayName: user[1].displayName,
						id: user[1].id,
						reason: mentionData.afk.reason,
						since: afkSince
					});
				}
			}
		}

		for (let afkUser of afkUsers) {
			const awayText: string =
				"Begründung: " +
				afkUser.reason +
				"\n" +
				this.client.emotes.reminder +
				" Abwesend seit: " +
				afkUser.since;

			const isAwayEmbed: EmbedBuilder = this.client.createEmbed(
				"{0}",
				"reminder",
				"normal",
				awayText
			);
			isAwayEmbed.setTitle(
				this.client.emotes.status.idle +
					" " +
					afkUser.displayName +
					" (@" +
					afkUser.name +
					")" +
					" ist aktuell abwesend!"
			);
			await message.reply({ embeds: [isAwayEmbed] }).catch((): void => {});
		}
	}
}
