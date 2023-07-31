/** @format */

import BaseCommand from '@structures/BaseCommand';
import BaseClient from '@structures/BaseClient';
import fs from 'fs';
import { EmbedBuilder } from 'discord.js';

export default class EnableCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'enable',
			description: 'Aktiviert einen Befehl',
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
		await this.enableCommand(args[0]);
	}

	private async enableCommand(cmd: string): Promise<void> {
		if (!cmd) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Du musst einen Befehl angeben.',
				'error',
				'error'
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		const command: any = this.client.commands.get(cmd);
		if (command) {
			let disabledCommands = JSON.parse(
				fs.readFileSync('./assets/disabled.json').toString()
			);
			if (disabledCommands.includes(command.help.name)) {
				disabledCommands = disabledCommands.filter(
					(c: any): boolean => c !== command.help.name
				);
				fs.writeFileSync(
					'./assets/disabled.json',
					JSON.stringify(disabledCommands, null, 4)
				);

				const enabledEmbed: EmbedBuilder = this.client.createEmbed(
					'Der Befehl wurde aktiviert.',
					'success',
					'success'
				);
				return this.message.reply({ embeds: [enabledEmbed] });
			} else {
				const isNotDisabledEmbed: EmbedBuilder =
					this.client.createEmbed(
						'Der Befehl ist nicht deaktiviert.',
						'error',
						'error'
					);
				return this.message.reply({ embeds: [isNotDisabledEmbed] });
			}
		} else {
			const invalidCommandEmbed: EmbedBuilder = this.client.createEmbed(
				'Der Befehl existiert nicht.',
				'error',
				'error'
			);
			return this.message.reply({ embeds: [invalidCommandEmbed] });
		}
	}
}
