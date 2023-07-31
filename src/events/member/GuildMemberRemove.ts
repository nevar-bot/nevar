/** @format */

import { EmbedBuilder } from 'discord.js';
import BaseClient from '@structures/BaseClient';

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(member: any): Promise<any> {
		if (!member || !member.id || !member.guild) return;
		const { guild } = member;

		const guildData = await this.client.findOrCreateGuild(guild.id);
		const memberData = await this.client.findOrCreateMember(
			member.id,
			guild.id
		);

		/* Update invite cache */
		if (memberData?.inviteUsed) {
			const invite: any = await guild.invites
				.fetch(memberData.inviteUsed)
				.catch((e: any): void => {});
			if (invite) {
				const inviterData = await this.client.findOrCreateMember(
					invite.inviterId,
					guild.id
				);
				if (!inviterData.invites) inviterData.invites = [];
				inviterData.invites.find(
					(i: any): boolean => i.code === invite.code
				).left++;
				inviterData.markModified('invites');
				await inviterData.save();
			}
		}

		/* Send log */
		const memberLeaveText: string =
			this.client.emotes.edit +
			' Anzeigename: ' +
			member.user.displayName +
			'\n' +
			this.client.emotes.user +
			' Nutzername: ' +
			member.user.username +
			'\n' +
			this.client.emotes.id +
			' ID: ' +
			member.id;

		const memberLeaveEmbed: EmbedBuilder = this.client.createEmbed(
			memberLeaveText,
			null,
			'error'
		);
		memberLeaveEmbed.setTitle(
			this.client.emotes.events.member.ban +
				'Mitglied hat den Server verlassen'
		);
		memberLeaveEmbed.setThumbnail(member.user.displayAvatarURL());

		await guild.logAction(memberLeaveEmbed, 'member');

		/* Send farewell message */
		if (guildData.settings?.farewell.enabled) {
			function parseMessage(str: string): string {
				return str
					.replaceAll(/{user}/g, member)
					.replaceAll(/{user:username}/g, member.user.username)
					.replaceAll(/{user:displayname}/g, member.user.displayName)
					.replaceAll(/{user:id}/g, member.user.id)
					.replaceAll(/{server:name}/g, guild.name)
					.replaceAll(/{server:id}/g, guild.id)
					.replaceAll(/{server:membercount}/g, guild.memberCount)
					.replaceAll(/{newline}/g, '\n');
			}

			const farewellMessage: string = parseMessage(
				guildData.settings.farewell.message
			);
			const farewellChannel: any =
				guild.channels.cache.get(guildData.settings.farewell.channel) ||
				(await guild.channels
					.fetch(guildData.settings.farewell.channel)
					.catch((e: any): void => {
						const errorText: string =
							this.client.emotes.user +
							' Mitglied: ' +
							member.user.username +
							'\n' +
							this.client.emotes.arrow +
							' Kanal: ' +
							guildData.settings.welcome.channel;

						const errorEmbed: EmbedBuilder =
							this.client.createEmbed(errorText, null, 'error');
						errorEmbed.setTitle(
							this.client.emotes.error +
								' Verabschiedungsnachricht fehlgeschlagen'
						);
						errorEmbed.setThumbnail(member.user.displayAvatarURL());

						guild.logAction(errorEmbed, 'guild');
					}));

			if (guildData.settings.farewell.type === 'embed') {
				const farewellEmbed: EmbedBuilder = this.client.createEmbed(
					farewellMessage,
					null,
					'normal'
				);
				farewellEmbed.setColor(
					guildData.settings.farewell.color ||
						this.client.config.embeds['DEFAULT_COLOR']
				);
				if (guildData.settings.farewell?.thumbnail)
					farewellEmbed.setThumbnail(member.user.displayAvatarURL());
				return farewellChannel
					.send({ embeds: [farewellEmbed] })
					.catch((e: any): void => {
						const errorText: string =
							this.client.emotes.user +
							' Mitglied: ' +
							member.user.username +
							'\n' +
							this.client.emotes.arrow +
							' Kanal: ' +
							farewellChannel.toString();

						const errorEmbed: EmbedBuilder =
							this.client.createEmbed(errorText, null, 'error');
						errorEmbed.setTitle(
							this.client.emotes.error +
								' Verabschiedungsnachricht fehlgeschlagen'
						);
						errorEmbed.setThumbnail(member.user.displayAvatarURL());

						return guild.logAction(errorEmbed, 'guild');
					});
			} else if (guildData.settings.welcome.type === 'text') {
				return farewellChannel
					.send({ content: farewellMessage })
					.catch((e: any): void => {
						const errorText: string =
							this.client.emotes.user +
							' Mitglied: ' +
							member.user.username +
							'\n' +
							this.client.emotes.arrow +
							' Kanal: ' +
							farewellChannel.toString();

						const errorEmbed: EmbedBuilder =
							this.client.createEmbed(errorText, null, 'error');
						errorEmbed.setTitle(
							this.client.emotes.error +
								' Verabschiedungsnachricht fehlgeschlagen'
						);
						errorEmbed.setThumbnail(member.user.displayAvatarURL());

						return guild.logAction(errorEmbed, 'guild');
					});
			}
		}
	}
}
