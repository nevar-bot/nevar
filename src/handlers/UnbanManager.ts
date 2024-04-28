import { EmbedBuilder, Guild } from "discord.js";
import { NevarClient } from "@core/NevarClient";

export class UnbanManager {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
		this.unbanMembers();
	}

	private unbanMembers(): void {
		this.client.membersData.find({ "banned.state": true }).then((members: any): void => {
			members.forEach((member: any): void => {
				this.client.databaseCache.bannedUsers.set(member.id + member.guildID, member);
			});
		});

		setInterval(async (): Promise<void> => {
			for (const memberData of [...this.client.databaseCache.bannedUsers.values()].filter((m: any): boolean => m.banned.bannedUntil <= Date.now())) {
				const guild: Guild | undefined = this.client.guilds.cache.get(memberData.guildID);
				if (!guild) continue;

				const user = await this.client.users.fetch(memberData.id).catch(() => null);
				const unbanReason = guild.translate("handlers/unbanMembers:unbanReason");

				guild.members
					.unban(memberData.id, unbanReason)
					.then(async (): Promise<void> => {
						const unbanMessage: string = this.client.emotes.user + " " + guild.translate("handlers/unbanMembers:user") + ": " + (user ? user.username : memberData.id) + "\n" + this.client.emotes.arrow + " " + unbanReason;
						const unbanEmbed: EmbedBuilder = this.client.createEmbed(unbanMessage, null, "success");
						unbanEmbed.setTitle(guild.translate("handlers/unbanMembers:autoUnbanExecuted"));
						unbanEmbed.setThumbnail(user ? user.displayAvatarURL() : "");
						await guild.logAction(unbanEmbed, "moderation");
					})
					.catch(async (): Promise<void> => {
						const errorMessage: string = this.client.emotes.user + " " + guild.translate("handlers/unbanMembers:user") + ": " + (user ? user.username : memberData.id);
						const errorEmbed: EmbedBuilder = this.client.createEmbed(errorMessage, null, "error");
						errorEmbed.setTitle(guild.translate("handlers/unbanMembers:autoUnbanFailed"));
						errorEmbed.setThumbnail(user ? user.displayAvatarURL() : "");
						await guild.logAction(errorEmbed, "moderation");
					});

				memberData.banned = {
					state: false,
					reason: null,
					moderator: { name: null, id: null },
					duration: null,
					bannedAt: null,
					bannedUntil: null,
				};
				memberData.markModified("banned");
				await memberData.save();
				this.client.databaseCache.bannedUsers.delete(memberData.id + memberData.guildID);
			}
		}, 1000);
	}
}
