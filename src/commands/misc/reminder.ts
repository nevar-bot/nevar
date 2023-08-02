import BaseCommand from '@structures/BaseCommand';
import BaseClient from '@structures/BaseClient';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import moment from 'moment';
import ems from 'enhanced-ms';
const ms: any = ems('de');

export default class ReminderCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'reminder',
			description: 'Verwaltet deine Erinnerungen',
			cooldown: 2 * 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName('aktion')
							.setDescription('Wähle eine Aktion')
							.setRequired(true)
							.addChoices(
								{ name: 'erstellen', value: 'add' },
								{ name: 'löschen', value: 'delete' },
								{ name: 'liste', value: 'list' }
							)
					)
					.addStringOption((option: any) =>
						option
							.setName('name')
							.setDescription(
								'Woran soll ich dich erinnern? (beim löschen: Name der Erinnerung)'
							)
							.setRequired(false)
							.setMaxLength(500)
					)
					.addStringOption((option: any) =>
						option
							.setName('dauer')
							.setDescription(
								'Wann soll ich dich erinnern? (z.B. 1h, 1w, 1w, 1h 30m)'
							)
							.setRequired(false)
					)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;

		const action = interaction.options.getString('aktion');
		switch (action) {
			case 'add':
				await this.addReminder(
					interaction.options.getString('name'),
					interaction.options.getString('dauer'),
					data
				);
				break;
			case 'delete':
				await this.deleteReminder(
					interaction.options.getString('name'),
					data
				);
				break;
			case 'list':
				await this.listReminders(data);
				break;
		}
	}

	private async addReminder(
		name: string,
		dauer: string,
		data: any
	): Promise<void> {
		if (!name || !dauer || !ms(dauer)) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Du musst einen Namen und eine Dauer angeben.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		const reminder: any = {
			startDate: Date.now(),
			endDate: Date.now() + ms(dauer),
			reason: name,
			channel: this.interaction.channel.id
		};

		data.member.reminders.push(reminder);
		data.member.markModified('reminders');
		await data.member.save();
		this.client.databaseCache.reminders.set(
			this.interaction.member.user.id + this.interaction.guild.id,
			data.member
		);

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			'In {0} werde ich dich erinnern.',
			'success',
			'success',
			ms(ms(dauer))
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async deleteReminder(name: string, data: any): Promise<void> {
		if (!name) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Du musst einen Namen angeben.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}
		const reminder: any = data.member.reminders.find(
			(r: any): boolean => r.reason === name
		);
		if (!reminder) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Mit dem Namen hab ich keine Erinnerung gefunden.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		data.member.reminders.splice(
			data.member.reminders.indexOf(reminder),
			1
		);
		data.member.markModified('reminders');
		await data.member.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			'Die Erinnerung wurde gelöscht.',
			'success',
			'success'
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async listReminders(data: any): Promise<void> {
		const reminders: any[] = [];
		for (let reminder of data.member.reminders) {
			const text: string =
				'### ' +
				this.client.emotes.reminder +
				' ' +
				reminder.reason +
				'\n' +
				this.client.emotes.arrow +
				' Erstellt am: ' +
				moment(reminder.startDate).format('DD.MM.YYYY, HH:mm') +
				'\n' +
				this.client.emotes.arrow +
				' Endet am: ' +
				moment(reminder.endDate).format('DD.MM.YYYY, HH:mm') +
				'\n' +
				this.client.emotes.arrow +
				' Endet in: ' +
				this.client.utils.getRelativeTime(
					Date.now() - (reminder.endDate - Date.now())
				);
			reminders.push(text);
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			5,
			reminders,
			'Erinnerungen',
			'Du hast keine Erinnerungen erstellt',
			null
		);
	}
}
