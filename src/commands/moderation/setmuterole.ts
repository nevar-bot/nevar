/** @format */

import BaseCommand from '@structures/BaseCommand';
import BaseClient from '@structures/BaseClient';
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default class SetmuteroleCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'setmuterole',
			description: 'Definiert, welche Rolle bei einem Mute vergeben wird',
			memberPermissions: ['KickMembers'],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addRoleOption((option: any) =>
					option
						.setName('rolle')
						.setDescription('Wähle eine Rolle')
						.setRequired(true)
				)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		await this.setMuteRole(interaction.options.getRole('rolle'), data);
	}

	private async setMuteRole(role: any, data: any): Promise<void> {
		/* Invalid options */
		if (!role || !role.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Du musst eine Rolle angeben.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Role is @everyone */
		if (role.id === this.interaction.guild.roles.everyone.id) {
			const everyoneEmbed: EmbedBuilder = this.client.createEmbed(
				'Die @everyone Rolle kann nicht als Mute-Rolle gesetzt werden.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [everyoneEmbed] });
		}

		/* Role is managed by an integration */
		if (role.managed) {
			const roleIsManagedEmbed: EmbedBuilder = this.client.createEmbed(
				'Rollen welche durch eine Integration verwaltet werden, können nicht als Mute-Rolle gesetzt werden.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [roleIsManagedEmbed] });
		}

		/* Role is higher than the bot's highest role */
		if (
			this.interaction.guild.members.me.roles.highest.position <=
			role.position
		) {
			const roleIsTooHighEmbed: EmbedBuilder = this.client.createEmbed(
				'Da {0} eine höhere oder gleiche Position wie meine höchste Rolle ({1}) hat, kann sie nicht als Mute-Rolle gesetzt werden.',
				'error',
				'error',
				role.toString(),
				this.interaction.guild.members.me.roles.highest.toString()
			);
			return this.interaction.followUp({ embeds: [roleIsTooHighEmbed] });
		}

		/* Role is already the mute role */
		if (data.guild.settings.muterole === role.id) {
			const roleIsAlreadyMuteRoleEmbed: EmbedBuilder =
				this.client.createEmbed(
					'{0} ist bereits die Mute-Rolle.',
					'error',
					'error',
					role.toString()
				);
			return this.interaction.followUp({
				embeds: [roleIsAlreadyMuteRoleEmbed]
			});
		}

		/* Save to database */
		data.guild.settings.muterole = role.id;
		data.guild.markModified('settings.muterole');
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			'{0} wurde als Mute-Rolle gesetzt.',
			'success',
			'success',
			role.toString()
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}
}
