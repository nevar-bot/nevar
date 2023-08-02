import { ChannelType, EmbedBuilder } from 'discord.js';
import BaseClient from '@structures/BaseClient';

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(oldMember: any, newMember: any): Promise<any> {
		if (!oldMember || !newMember) return;

		const newChannel: any = newMember.channel;
		const oldChannel: any = oldMember.channel;
		const { guild } = newMember;
		const guildData: any = await this.client.findOrCreateGuild(guild.id);

		if (newChannel && newMember.guild) {
			if (
				!guildData.settings?.joinToCreate?.enabled ||
				!guildData.settings?.joinToCreate?.channel
			)
				return;

			const user: any = await this.client.users
				.fetch(newMember.id)
				.catch((e: any): void => {});

			const channelName: string =
				guildData.settings.joinToCreate.defaultName
					.replaceAll(
						'{count}',
						guildData.settings.joinToCreate.channels?.length || 1
					)
					.replaceAll('{user}', user.displayName);

			/* Create temp channel */
			if (
				newMember.channel.id === guildData.settings.joinToCreate.channel
			) {
				const tempChannel: any = await newMember.guild.channels
					.create({
						name: channelName,
						reason: 'Join to create',
						type: ChannelType.GuildVoice,
						parent: guildData.settings.joinToCreate.category
							? guildData.settings.joinToCreate.category
							: newMember.channel.parentId,
						bitrate:
							parseInt(guildData.settings.joinToCreate.bitrate) *
							1000,
						position: guildData.settings.joinToCreate.category
							? 0
							: newMember.channel.position,
						userLimit: guildData.settings.joinToCreate.userLimit
					})
					.catch((e: any): any => {
						const errorText: string =
							this.client.emotes.channel +
							' Nutzer: ' +
							newMember.user.displayName + " (@" + newMember.user.username + ")";

						const errorEmbed: EmbedBuilder =
							this.client.createEmbed(errorText, null, 'error');
						errorEmbed.setTitle(
							this.client.emotes.error +
								' Erstellen von Join2Create-Channel fehlgeschlagen'
						);

						return guild.logAction(errorEmbed, 'guild');
					});

				if (tempChannel) {
					await tempChannel.lockPermissions();
					await tempChannel.permissionOverwrites
						.create(newMember.member.user, {
							Connect: true,
							Speak: true,
							ViewChannel: true,
							ManageChannels: true,
							Stream: true,
							MuteMembers: true,
							DeafenMembers: true,
							MoveMembers: true
						})
						.catch((e: any): void => {});

					await newMember.member.voice
						.setChannel(tempChannel)
						.catch((): void => {
							tempChannel.delete().catch((e: any): void => {});
						})
						.then(async (e: any): Promise<void> => {
							guildData.settings.joinToCreate.channels.push(
								tempChannel.id
							);
							guildData.markModified('settings.joinToCreate');
							await guildData.save();
						});
				}
			}
		}

		if (oldChannel && newMember.guild) {
			if (
				guildData.settings?.joinToCreate?.channels?.includes(
					oldChannel.id
				)
			) {
				if (oldChannel.members.size >= 1) return;
				await oldChannel.delete().catch((e: any): void => {
					const errorText: string =
						this.client.emotes.channel + ' Nutzer: ' + newMember;

					const errorEmbed: EmbedBuilder = this.client.createEmbed(
						errorText,
						null,
						'error'
					);
					errorEmbed.setTitle(
						this.client.emotes.error +
							' Löschen von Join2Create-Channel fehlgeschlagen'
					);

					return guild.logAction(errorEmbed, 'guild');
				});
				guildData.settings.joinToCreate.channels =
					guildData.settings.joinToCreate.channels.filter(
						(c: any): boolean => c !== oldChannel.id
					);
				guildData.markModified('settings.joinToCreate');
				await guildData.save();
			}
		}
	}
}
