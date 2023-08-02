import { EmbedBuilder, Guild } from 'discord.js';
import BaseClient from '@structures/BaseClient';

export default {
	init(client: BaseClient): void {
		client.membersData
			.find({ 'banned.state': true })
			.then((members: any): void => {
				members.forEach((member: any): void => {
					client.databaseCache.bannedUsers.set(
						member.id + member.guildID,
						member
					);
				});
			});

		setInterval((): void => {
			for (const memberData of [
				...client.databaseCache.bannedUsers.values()
			].filter((m: any): boolean => m.banned.bannedUntil <= Date.now())) {
				const guild: Guild | undefined = client.guilds.cache.get(
					memberData.guildID
				);
				if (!guild) continue;

				guild.members
					.unban(memberData.id, 'Ban-Dauer abgelaufen')
					.then(async (): Promise<void> => {
						const user: any = await client.users
							.fetch(memberData.id)
							.catch((): void => {});
						const unbanMessage: string =
							client.emotes.user +
							' Nutzer: ' +
							(user ? user.username : memberData.id) +
							'\n' +
							client.emotes.arrow +
							' Begründung: Ban-Dauer ist abgelaufen';

						const unbanEmbed: EmbedBuilder = client.createEmbed(
							unbanMessage,
							null,
							'success'
						);
						unbanEmbed.setTitle('Auto-Unban durchgeführt');
						unbanEmbed.setThumbnail(user!.displayAvatarURL());
						await guild.logAction(unbanEmbed, 'moderation');
					})
					.catch(async (e: any): Promise<void> => {
						const user: any = await client.users
							.fetch(memberData.id)
							.catch((): void => {});
						const errorMessage: string =
							client.emotes.user +
							' Nutzer: ' +
							(user ? user.username : memberData.id);

						const errorEmbed: EmbedBuilder = client.createEmbed(
							errorMessage,
							null,
							'error'
						);
						errorEmbed.setTitle('Auto-Unban fehlgeschlagen');
						errorEmbed.setThumbnail(user.displayAvatarURL());
						await guild.logAction(errorEmbed, 'moderation');
					});

				memberData.banned = {
					state: false,
					reason: null,
					moderator: {
						name: null,
						id: null
					},
					duration: null,
					bannedAt: null,
					bannedUntil: null
				};
				memberData.markModified('banned');
				memberData.save();
				client.databaseCache.bannedUsers.delete(
					memberData.id + memberData.guildID
				);
			}
		}, 1000);
	}
};
