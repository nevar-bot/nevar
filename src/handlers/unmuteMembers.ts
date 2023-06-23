import { EmbedBuilder, Guild } from "discord.js";
import BaseClient from "@structures/BaseClient";

export default
	{
		init(client: BaseClient): void
		{
			client.membersData.find({ "muted.state": true }).then((members: any): void =>
			{
				members.forEach((member: any): void =>
				{
					client.databaseCache.mutedUsers.set(member.id + member.guildID, member);
				});
			});

			setInterval((): void =>
			{
				for (const memberData of [...client.databaseCache.mutedUsers.values()].filter((m: any): boolean => m.muted.mutedUntil <= Date.now())) {
					const guild: Guild | undefined = client.guilds.cache.get(memberData.guildID);
					if (!guild) continue;

					client.findOrCreateGuild(guild.id)
						.then((guildData: any): void =>
						{
							guild.members.fetch(memberData.id)
								.then((member: any): void =>
								{
									member.roles.remove(guildData.settings.muterole, "Mute-Dauer abgelaufen")
										.then(async (): Promise<void> =>
										{
											const unmuteMessage: string =
												client.emotes.user + " Nutzer: " + member.user.username + "\n" +
												client.emotes.arrow + " Begründung: Mute-Dauer ist abgelaufen";

											const unmuteEmbed: EmbedBuilder = client.createEmbed(unmuteMessage, null, "success");
											unmuteEmbed.setTitle("Auto-Unmute durchgeführt");
											unmuteEmbed.setThumbnail(member.user.displayAvatarURL());
											await guild.logAction(unmuteEmbed, "moderation");
										})
										.catch(async (e: any): Promise<void> =>
										{
											const errorMessage: string =
												client.emotes.user + " Nutzer: " + member.user.username;

											const errorEmbed: EmbedBuilder = client.createEmbed(errorMessage, null, "error");
											errorEmbed.setTitle("Auto-Unmute fehlgeschlagen");
											errorEmbed.setThumbnail(member.user.displayAvatarURL());
											await guild.logAction(errorEmbed, "moderation");
										});
								})
								.catch(async (e: any): Promise<void> =>
								{
									const user = await client.users.fetch(memberData.id).catch((): void => { });
									const errorMessage: string =
										client.emotes.user + " Nutzer: " + (user ? user.username : memberData.id)

									const errorEmbed: EmbedBuilder = client.createEmbed(errorMessage, null, "error");
									errorEmbed.setTitle("Auto-Unmute fehlgeschlagen");
									errorEmbed.setThumbnail(user!.displayAvatarURL());
									await guild.logAction(errorEmbed, "moderation");
								});
						})
						.catch((): void => { });
				}
			})
		}
	}