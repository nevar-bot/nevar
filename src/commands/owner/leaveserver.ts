import BaseCommand from '@structures/BaseCommand';
import BaseClient from '@structures/BaseClient';
import { EmbedBuilder } from 'discord.js';

export default class LeaveserverCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'leaveserver',
			description: 'Verlässt einen Server',
			ownerOnly: true,
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
		await this.leaveServer(args[0]);
	}

	private async leaveServer(guildID: string): Promise<void> {
		if (!guildID) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Du musst eine Server-ID angeben.',
				'error',
				'error'
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		const guild: any = this.client.guilds.cache.get(guildID);

		if (!guild) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Der Server konnte nicht gefunden werden.',
				'error',
				'error'
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		if (guild.id === this.client.config.support['ID']) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Ich kann den Support-Server nicht verlassen.',
				'error',
				'error'
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		await guild.leave();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			'Ich habe {0} verlassen.',
			'success',
			'success',
			guild.name
		);
		return this.message.reply({ embeds: [successEmbed] });
	}
}
