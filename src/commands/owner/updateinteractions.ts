import BaseCommand from '@structures/BaseCommand';
import BaseClient from '@structures/BaseClient';
import { EmbedBuilder } from 'discord.js';
import registerInteractions from '@handlers/registerInteractions';

export default class UpdateinteractionsCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'updateinteractions',
			description: 'Updatet alle Slash-Commands und Kontext-Menüs',
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
		await this.updateInteractions();
	}

	private async updateInteractions() {
		const res: any = await registerInteractions(this.client);
		if (res.success) {
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				'{0} Slash-Commands und Kontext-Menüs wurden aktualisiert.',
				'slashcommand',
				'success',
				res.interactionsRegistered
			);
			return this.message.reply({ embeds: [successEmbed] });
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				'Beim Aktualisieren der Slash-Commands und Kontext-Menüs ist ein Fehler aufgetreten.',
				'error',
				'error'
			);
			return this.message.reply({ embeds: [errorEmbed] });
		}
	}
}
