/** @format */

import BaseClient from '@structures/BaseClient';
import {
	EmbedBuilder,
	ChannelType,
	PermissionsBitField,
	ButtonBuilder
} from 'discord.js';
import moment from 'moment';

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(guild: any): Promise<any> {
		await guild.fetch().catch((e: any): void => {});
		if (!guild || !guild.available || !guild.id) return;

		/* Add guild invites to invite cache */
		guild.invites
			.fetch()
			.then((invites: any): void => {
				this.client.invites.set(
					guild.id,
					new Map(
						invites.map((invite: any): any => [
							invite.code,
							invite.uses
						])
					)
				);
			})
			.catch((e: any): void => {});

		/* Send welcome message */
		const firstChannel: any = guild.channels.cache.find(
			(c: any) =>
				(c.type === ChannelType.GuildText ||
					c.type === ChannelType.GuildAnnouncement) &&
				c
					.permissionsFor(guild.members.me)
					.has(PermissionsBitField.Flags.SendMessages)
		);

		const welcomeMessage: string =
			this.client.emotes.arrow +
			' Eine **Übersicht meiner Befehle** erhältst du mit {0}\n' +
			this.client.emotes.arrow +
			' Unten sind zusätzlich einige **hilfreiche Links** zu finden.\n\n' +
			this.client.emotes.arrow +
			' Bei Fragen oder Problemen stehen wir jederzeit gerne zur Verfügung.';

		const helpCommand: any = (
			await this.client.application!.commands.fetch()
		).find((cmd) => cmd.name === 'help')?.id;
		const welcomeMessageEmbed: EmbedBuilder = this.client.createEmbed(
			welcomeMessage,
			null,
			'normal',
			helpCommand ? '</help:' + helpCommand + '>' : '/help'
		);
		welcomeMessageEmbed.setTitle(
			this.client.emotes.shine + ' Danke, dass ich hier sein darf!'
		);
		welcomeMessageEmbed.setThumbnail(this.client.user!.displayAvatarURL());

		const buttonInvite: ButtonBuilder = this.client.createButton(
			null,
			'Einladen',
			'Link',
			'growth_up',
			false,
			this.client.createInvite()
		);
		const buttonSupport: ButtonBuilder = this.client.createButton(
			null,
			'Support',
			'Link',
			'discord',
			false,
			this.client.config.support['INVITE']
		);
		const buttonWebsite: ButtonBuilder = this.client.createButton(
			null,
			'Website',
			'Link',
			'globe',
			true,
			this.client.config.general['WEBSITE']
		);
		const buttonVote: ButtonBuilder = this.client.createButton(
			null,
			'Voten',
			'Link',
			'heart',
			false,
			'https://discordbotlist.com/bots/' +
				this.client.user!.id +
				'/upvote'
		);
		const buttonDonate: ButtonBuilder = this.client.createButton(
			null,
			'Unterstützen',
			'Link',
			'gift',
			false,
			'https://prohosting24.de/cp/donate/nevar'
		);

		const buttonRow = this.client.createMessageComponentsRow(
			buttonInvite,
			buttonSupport,
			buttonWebsite,
			buttonVote,
			buttonDonate
		);
		await firstChannel
			.send({ embeds: [welcomeMessageEmbed], components: [buttonRow] })
			.catch((e: any): void => {});
		await firstChannel
			.send({ content: this.client.config.support['INVITE'] })
			.catch((e: any): void => {});

		/* Support log message */
		const supportGuild: any = this.client.guilds.cache.get(
			this.client.config.support['ID']
		);
		if (!supportGuild) return;

		const supportLogChannel: any = supportGuild.channels.cache.get(
			this.client.config.support['BOT_LOG']
		);
		if (!supportLogChannel) return;

		const owner: any = await guild.fetchOwner().catch((e: any): void => {});
		const createdAt: string = moment(guild.createdTimestamp).format(
			'DD.MM.YYYY, HH:mm'
		);
		const createdDiff: string = this.client.utils.getRelativeTime(
			guild.createdTimestamp
		);

		const supportGuildLogMessage: string =
			'Name: **' +
			guild.name +
			'**\n' +
			this.client.emotes.crown +
			' Eigentümer: **' +
			owner.user.displayName + " (@" + owner.user.username + ")" +
			'**\n' +
			this.client.emotes.id +
			' ID: **' +
			guild.id +
			'**\n' +
			this.client.emotes.users +
			' Mitglieder: **' +
			guild.memberCount +
			'**\n' +
			this.client.emotes.calendar +
			' Erstellt am: **' +
			createdAt +
			'**\n' +
			this.client.emotes.reminder +
			' Erstellt vor: **' +
			createdDiff +
			'**';

		const supportGuildLogEmbed: EmbedBuilder = this.client.createEmbed(
			supportGuildLogMessage,
			'discord',
			'success'
		);
		supportGuildLogEmbed.setTitle(
			this.client.user!.username + ' wurde einem neuen Server hinzugefügt'
		);
		supportGuildLogEmbed.setThumbnail(
			guild.iconURL({ dynamic: true, size: 512 })
		);

		await supportLogChannel
			.send({ embeds: [supportGuildLogEmbed] })
			.catch((e: any): void => {});
	}
}
