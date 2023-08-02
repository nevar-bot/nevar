import BaseCommand from '@structures/BaseCommand';
import BaseClient from '@structures/BaseClient';
import { EmbedBuilder } from 'discord.js';
import moment from 'moment';

export default class BlockCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'block',
			description: 'Blockiert einen Server oder Nutzer',
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

		const action: string = args[0].toLowerCase();
		args.shift();
		switch (action) {
			case 'add':
				await this.block(args);
				break;
			case 'remove':
				await this.unblock(args);
				break;
			case 'list':
				await this.listBlocked();
				break;
			default:
				const invalidOptionsEmbed: EmbedBuilder =
					this.client.createEmbed(
						'Du musst zwischen add, remove und list wählen.',
						'error',
						'error'
					);
				await message.reply({ embeds: [invalidOptionsEmbed] });
				break;
		}
	}

	private async block(args: any[]): Promise<void> {
		// get id and reason
		const id: string = args.shift();
		const reason: string = args.join(' ') || 'Kein Grund angegeben';

		// check if target is a user or guild
		const type: string = (await this.client.users.fetch(id).catch(() => {}))
			? 'user'
			: 'guild';

		// fetch target guild/user
		const target: any =
			type === 'user'
				? await this.client.users.fetch(id).catch(() => {})
				: await this.client.guilds.fetch(id).catch(() => {});

		// no target found
		if (!target) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Du musst die ID eines Servers oder Nutzers angeben.',
				'error',
				'error'
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		// target is client
		if (target.id === this.client.user!.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Du kannst mich nicht blockieren.',
				'error',
				'error'
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		// target is message author
		if (target.id === this.message.author.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Du kannst dich nicht selbst blockieren.',
				'error',
				'error'
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		// target is support server
		if (target.id === this.client.config.support['ID']) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Du kannst den Support-Server nicht blockieren.',
				'error',
				'error'
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		// target is bot owner
		if (this.client.config.general['OWNER_IDS'].includes(target.id)) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Du kannst den Bot-Eigentümer nicht blockieren.',
				'error',
				'error'
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		// get target data
		const targetData: any =
			type === 'user'
				? await this.client.findOrCreateUser(id)
				: await this.client.findOrCreateGuild(id);

		// target is already blocked
		if (targetData.blocked.state) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Dieser Nutzer oder Server ist bereits blockiert.',
				'error',
				'error'
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		// save to database
		targetData.blocked = {
			state: true,
			reason: reason,
			date: Date.now(),
			moderator: this.message.author.username,
			name: type === 'user' ? target.username : target.name
		};
		targetData.markModified('blocked');
		await targetData.save();

		const message: string =
			type === 'user'
				? 'Nutzer ' + target.username
				: 'Server ' + target.name;
		const successEmbed: EmbedBuilder = this.client.createEmbed(
			'Der ' + message + ' wurde blockiert.',
			'success',
			'success'
		);
		return this.message.reply({ embeds: [successEmbed] });
	}

	private async unblock(args: any[]): Promise<void> {
		// get id
		const id: string = args.shift();

		if (!id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Du musst die ID eines Servers oder Nutzers angeben.',
				'error',
				'error'
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		// get target user/guild data
		const targetData: any =
			(await this.client.usersData.find({ id: id }))[0] ||
			(await this.client.guildsData.find({ id: id }))[0];

		// no target found
		if (!targetData) {
			const noTargetEmbed: EmbedBuilder = this.client.createEmbed(
				'Es wurde kein Nutzer oder Server mit dieser ID gefunden.',
				'error',
				'error'
			);
			return this.message.reply({ embeds: [noTargetEmbed] });
		}

		// target is not blocked
		if (!targetData.blocked.state) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Dieser Nutzer oder Server ist nicht blockiert.',
				'error',
				'error'
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		// unblock target
		const name: string = targetData.blocked.name;
		targetData.blocked = {
			state: false,
			reason: null,
			date: null,
			moderator: null,
			name: null
		};
		targetData.markModified('blocked');
		await targetData.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			'{0} wurde entblockt.',
			'success',
			'success',
			name
		);
		return this.message.reply({ embeds: [successEmbed] });
	}

	private async listBlocked(): Promise<void> {
		let blocked: any[] = [];

		// blocked users
		const blockedUsers = await this.client.usersData.find({
			'blocked.state': true
		});
		for (let userData of blockedUsers) {
			const user: any = await this.client.users
				.fetch(userData.id)
				.catch(() => {});
			const text: string =
				' **' +
				(user ? user.username : userData.blocked.name) +
				'** (' +
				(user ? user.id : userData.id) +
				')\n' +
				this.client.emotes.arrow +
				' Typ: Nutzer\n' +
				this.client.emotes.arrow +
				' Begründung: ' +
				userData.blocked.reason +
				'\n' +
				this.client.emotes.arrow +
				' Blockiert am: ' +
				moment(userData.blocked.date).format('DD.MM.YYYY HH:mm') +
				'\n' +
				this.client.emotes.arrow +
				' Blockiert von: ' +
				userData.blocked.moderator +
				'\n';
			blocked.push(text);
		}

		// blocked guilds
		const blockedGuilds = await this.client.guildsData.find({
			'blocked.state': true
		});
		for (let guildData of blockedGuilds) {
			const guild: any = await this.client.guilds
				.fetch(guildData.id)
				.catch(() => {});
			const text: string =
				' **' +
				(guild ? guild.name : guildData.blocked.name) +
				'** (' +
				(guild ? guild.id : guildData.id) +
				')\n' +
				this.client.emotes.arrow +
				' Typ: Server\n' +
				this.client.emotes.arrow +
				' Begründung: ' +
				guildData.blocked.reason +
				'\n' +
				this.client.emotes.arrow +
				' Blockiert am: ' +
				moment(guildData.blocked.date).format('DD.MM.YYYY HH:mm') +
				'\n' +
				this.client.emotes.arrow +
				' Blockiert von: ' +
				guildData.blocked.moderator +
				'\n';
			blocked.push(text);
		}

		await this.client.utils.sendPaginatedEmbedMessage(
			this.message,
			3,
			blocked,
			'Blockierte Nutzer und Server',
			'Es sind keine Nutzer oder Server blockiert',
			'ban'
		);
	}
}
