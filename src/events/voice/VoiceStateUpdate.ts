import { ChannelType, EmbedBuilder, VoiceState } from "discord.js";
import { NevarClient } from "@core/NevarClient";

export default class {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async dispatch(oldState: VoiceState, newState: VoiceState): Promise<any> {
		if (!oldState || !newState || !newState.guild) return;

		const { channel: oldChannel, member: oldMember } = oldState;
		const { channel: newChannel, member: newMember, guild } = newState;

		const guildData: any = await this.client.findOrCreateGuild(guild.id);
		const { joinToCreate: joinToCreateSettings } = guildData.settings;

		/* Delete join2create channels */
		if (oldChannel) {
			if(joinToCreateSettings?.channels.includes(oldChannel.id) && oldChannel.members.size < 1) {
				await oldChannel.delete().catch((): void => {});

				guildData.settings.joinToCreate.channels = guildData.settings.joinToCreate.channels.filter((c: any): boolean => c !== oldChannel.id);
				guildData.markModified("settings.joinToCreate");
				await guildData.save();
			}
		}

		/* Create join2create channels */
		if (newChannel && joinToCreateSettings?.enabled && joinToCreateSettings?.channel) {
			const channelName: string = joinToCreateSettings.defaultName
				.replaceAll("%count", joinToCreateSettings.channels?.length || 1)
				.replaceAll("%user", newMember!.displayName);

			if (newChannel.id !== joinToCreateSettings.channel) return;

			/* Create temp channel */
			const createdTempChannel: any = await guild.channels
				.create({
					name: channelName,
					type: ChannelType.GuildVoice,
					parent: joinToCreateSettings.category ? joinToCreateSettings.category : newChannel.parentId,
					bitrate: parseInt(joinToCreateSettings.bitrate) * 1000,
					position: newChannel.rawPosition,
					userLimit: joinToCreateSettings.userLimit,
				})
				.catch((): any => {
					const errorText: string =
						this.client.emotes.channel +
						" Nutzer/-in: " +
						newMember!.displayName +
						" (@" +
						newMember!.user.username +
						")";
					const errorEmbed: EmbedBuilder = this.client.createEmbed(errorText, null, "error");
					errorEmbed.setTitle(this.client.emotes.error + " Erstellen von Join2Create-Channel fehlgeschlagen");
					return guild.logAction(errorEmbed, "guild");
				});

			if (!createdTempChannel) return;

			/* Set permissions */
			await createdTempChannel.lockPermissions();
			await createdTempChannel.permissionOverwrites
				.create(newMember!.user, {
					Connect: true,
					Speak: true,
					ViewChannel: true,
					ManageChannels: true,
					Stream: true,
					MuteMembers: true,
					DeafenMembers: true,
					MoveMembers: true,
				})
				.catch((): void => {});

			/* Move member */
			await newState
				.setChannel(createdTempChannel)
				.then(async (): Promise<void> => {
					guildData.settings.joinToCreate.channels.push(createdTempChannel.id);
					guildData.markModified("settings.joinToCreate");
					await guildData.save();
				})
				.catch((): void => {
					createdTempChannel.delete().catch((): void => {});
				});
		}
	}
}
