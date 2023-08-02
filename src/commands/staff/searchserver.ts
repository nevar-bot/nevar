import BaseCommand from '@structures/BaseCommand';
import BaseClient from '@structures/BaseClient';
import { EmbedBuilder } from 'discord.js';
import mongoose from 'mongoose';
import moment from 'moment';

export default class SearchserverCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'searchserver',
			description: 'Zeigt Informationen über einen Server an',
			staffOnly: true,
			dirname: __dirname,
			slashCommand: {
				addCommand: false,
				data: null
			}
		});
	}

	private message: any;

	public async dispatch(message: any, args: any[], data: any): Promise<void> {
		this.message = message;
		await this.searchServer(args[0]);
	}

	private async searchServer(id: string): Promise<void> {
		if (!id || !this.client.guilds.cache.get(id)) {
			const notFoundEmbed: EmbedBuilder = this.client.createEmbed(
				'Der Server wurde nicht gefunden.',
				'error',
				'error'
			);
			return this.message.reply({ embeds: [notFoundEmbed] });
		}

		const guild: any = this.client.guilds.cache.get(id);

		const owner: any = await guild.fetchOwner();
		const memberCount: number = guild.memberCount;
		const botCount: number = guild.members.cache.filter(
			(m: any): boolean => m.user.bot === true
		).size;
		const humanCount: number = memberCount - botCount;
		const botPercentage: number = Math.round(
			(botCount / memberCount) * 100
		);
		const humanPercentage: number = Math.round(
			(humanCount / memberCount) * 100
		);

		const createdDate: string = moment(guild.createdTimestamp).format(
			'DD.MM.YYYY HH:mm'
		);
		const createdDiff: string = this.client.utils.getRelativeTime(
			guild.createdTimestamp
		);
		const invitedDate: string = moment(guild.joinedAt).format(
			'DD.MM.YYYY HH:mm'
		);
		const invitedDiff: string = this.client.utils.getRelativeTime(
			guild.joinedTimestamp
		);
		const executedCommands: number = (
			await (await mongoose.connection.db.collection('logs'))
				.find({ 'guild.id': guild.id })
				.toArray()
		).length;

		const text: string =
			this.client.emotes.crown +
			' Eigentümer: **' +
			owner.user.username +
			'**\n\n' +
			this.client.emotes.users +
			' Mitglieder: **' +
			this.client.format(memberCount) +
			'**\n' +
			this.client.emotes.bot +
			' davon Bots: **' +
			this.client.format(botCount) +
			' (' +
			botPercentage +
			'%)**\n' +
			this.client.emotes.user +
			' davon Menschen: **' +
			this.client.format(humanCount) +
			' (' +
			humanPercentage +
			'%)**\n\n' +
			this.client.emotes.calendar +
			' Erstellt am: **' +
			createdDate +
			'**\n' +
			this.client.emotes.reminder +
			' Erstellt vor: **' +
			createdDiff +
			'**\n\n' +
			this.client.emotes.calendar +
			' Eingeladen am: **' +
			invitedDate +
			'**\n' +
			this.client.emotes.reminder +
			' Eingeladen vor: **' +
			invitedDiff +
			'**\n\n' +
			this.client.emotes.slashcommand +
			' Befehle ausgeführt: **' +
			this.client.format(executedCommands) +
			'**';

		const searchServerEmbed: EmbedBuilder = this.client.createEmbed(
			text,
			null,
			'normal'
		);
		searchServerEmbed.setTitle(
			this.client.emotes.information + ' Informationen zu ' + guild.name
		);
		searchServerEmbed.setThumbnail(guild.iconURL({ dynamic: true }));

		return this.message.reply({ embeds: [searchServerEmbed] });
	}
}
