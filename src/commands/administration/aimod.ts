import BaseCommand from '@structures/BaseCommand';
import BaseClient from '@structures/BaseClient';
import { EmbedBuilder, SlashCommandBuilder, ChannelType } from 'discord.js';

export default class AimodCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'aimod',
			description:
				'Verwaltet die AI-gestützte Chatmoderation des Servers',
			memberPermissions: ['ManageGuild'],
			cooldown: 2 * 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName('status')
							.setDescription(
								'Aktiviert oder deaktiviert die AI-gestützte Chatmoderation'
							)
							.addStringOption((option: any) =>
								option
									.setName('status')
									.setDescription('Wähle einen Status')
									.setRequired(true)
									.addChoices(
										{
											name: 'aktiv',
											value: 'on'
										},
										{
											name: 'inaktiv',
											value: 'off'
										}
									)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName('exclude')
							.setDescription(
								'Exkludiert einen Channel oder eine Rolle von der AI-gestützten Chatmoderation'
							)
							.addStringOption((option: any) =>
								option
									.setName('aktion')
									.setDescription('Wähle eine Aktion')
									.setRequired(true)
									.addChoices(
										{
											name: 'hinzufügen',
											value: 'add'
										},
										{
											name: 'entfernen',
											value: 'remove'
										},
										{
											name: 'liste',
											value: 'list'
										}
									)
							)
							.addRoleOption((option: any) =>
								option
									.setName('rolle')
									.setDescription('Wähle eine Rolle')
									.setRequired(false)
							)
							.addChannelOption((option: any) =>
								option
									.setName('channel')
									.setDescription('Wähle einen Channel')
									.setRequired(false)
									.addChannelTypes(
										ChannelType.GuildText,
										ChannelType.GuildNews,
										ChannelType.GuildForum,
										ChannelType.GuildPublicThread
									)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName('threshold')
							.setDescription(
								'Wähle, ab welchem Wert gewarnt werden soll (0 = nicht unangemessen, 1 = sehr unangemessen)'
							)
							.addNumberOption((option: any) =>
								option
									.setName('wert')
									.setDescription('Wähle einen Wert')
									.setRequired(true)
									.setMinValue(0)
									.setMaxValue(1)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName('channel')
							.setDescription(
								'Wähle den Kanal, in dem die AI-gestützte Chatmoderation warnen soll'
							)
							.addChannelOption((option: any) =>
								option
									.setName('channel')
									.setDescription('Wähle einen Channel')
									.setRequired(true)
									.addChannelTypes(
										ChannelType.GuildText,
										ChannelType.GuildNews,
										ChannelType.GuildForum,
										ChannelType.GuildPublicThread
									)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName('explain')
							.setDescription(
								'Erklärt die AI-gestützte Chatmoderation'
							)
					)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		const subcommand: string = interaction.options.getSubcommand();

		if (!data.guild.settings.aiModeration) {
			data.guild.settings.aiModeration = {
				enabled: false,
				excludedChannels: [],
				excludedRoles: [],
				threshold: 0.6,
				alertChannel: null
			};
			data.guild.markModified('settings.aiModeration');
			await data.guild.save();
		}

		switch (subcommand) {
			case 'status':
				await this.setStatus(
					interaction.options.getString('status'),
					data
				);
				break;
			case 'exclude':
				await this.exclude(
					interaction.options.getString('aktion'),
					interaction.options.getChannel('channel'),
					interaction.options.getRole('rolle'),
					data
				);
				break;
			case 'threshold':
				await this.setThreshold(
					interaction.options.getNumber('wert'),
					data
				);
				break;
			case 'channel':
				await this.setChannel(
					interaction.options.getChannel('channel'),
					data
				);
				break;
			case 'explain':
				await this.explain();
		}
	}

	private async setStatus(status: string, data: any): Promise<void> {
		data.guild.settings.aiModeration.enabled = status === 'on';
		data.guild.markModified('settings.aiModeration.status');
		await data.guild.save();

		const embed: EmbedBuilder = this.client.createEmbed(
			'Die AI-gestützte Chatmoderation wurde {0}',
			'success',
			'normal',
			status === 'on' ? 'aktiviert' : 'deaktiviert'
		);
		return this.interaction.followUp({ embeds: [embed] });
	}

	private async exclude(
		action: string,
		channel: any,
		role: any,
		data: any
	): Promise<void> {
		if (action === 'add') {
			if (!channel && !role) {
				const embed: EmbedBuilder = this.client.createEmbed(
					'Du musst einen Channel oder eine Rolle angeben.',
					'error',
					'error'
				);
				return this.interaction.followUp({ embeds: [embed] });
			}
			if (channel) {
				if (
					data.guild.settings.aiModeration.excludedChannels.includes(
						channel.id
					)
				) {
					const embed: EmbedBuilder = this.client.createEmbed(
						'In {0} ist die AI-gestützte Chatmoderation bereits deaktiviert.',
						'error',
						'error',
						channel.toString()
					);
					return this.interaction.followUp({ embeds: [embed] });
				}
				data.guild.settings.aiModeration.excludedChannels.push(
					channel.id
				);
				data.guild.markModified(
					'settings.aiModeration.excludedChannels'
				);
				await data.guild.save();

				const successEmbed: EmbedBuilder = this.client.createEmbed(
					'In {0} ist die AI-gestützte Chatmoderation ab sofort deaktiviert.',
					'success',
					'success',
					channel.toString()
				);
				return this.interaction.followUp({ embeds: [successEmbed] });
			}
			if (role) {
				if (
					data.guild.settings.aiModeration.excludedRoles.includes(
						role.id
					)
				) {
					const embed: EmbedBuilder = this.client.createEmbed(
						'Für {0} ist die AI-gestützte Chatmoderation bereits deaktiviert.',
						'error',
						'error',
						role.toString()
					);
					return this.interaction.followUp({ embeds: [embed] });
				}
				data.guild.settings.aiModeration.excludedRoles.push(role.id);
				data.guild.markModified('settings.aiModeration.excludedRoles');
				await data.guild.save();

				const successEmbed: EmbedBuilder = this.client.createEmbed(
					'Für {0} ist die AI-gestützte Chatmoderation ab sofort deaktiviert.',
					'success',
					'success',
					role.toString()
				);
				return this.interaction.followUp({ embeds: [successEmbed] });
			}
		}

		if (action === 'remove') {
			if (!channel && !role) {
				const embed: EmbedBuilder = this.client.createEmbed(
					'Du musst einen Channel oder eine Rolle angeben.',
					'error',
					'error'
				);
				return this.interaction.followUp({ embeds: [embed] });
			}
			if (channel) {
				if (
					!data.guild.settings.aiModeration.excludedChannels.includes(
						channel.id
					)
				) {
					const embed: EmbedBuilder = this.client.createEmbed(
						'In {0} ist die AI-gestützte Chatmoderation nicht deaktiviert.',
						'error',
						'error',
						channel.toString()
					);
					return this.interaction.followUp({ embeds: [embed] });
				}
				data.guild.settings.aiModeration.excludedChannels =
					data.guild.settings.aiModeration.excludedChannels.filter(
						(id: string): boolean => id !== channel.id
					);
				data.guild.markModified(
					'settings.aiModeration.excludedChannels'
				);
				await data.guild.save();

				const successEmbed: EmbedBuilder = this.client.createEmbed(
					'In {0} ist die AI-gestützte Chatmoderation ab sofort aktiviert.',
					'success',
					'success',
					channel.toString()
				);
				return this.interaction.followUp({ embeds: [successEmbed] });
			}
			if (role) {
				if (
					!data.guild.settings.aiModeration.excludedRoles.includes(
						role.id
					)
				) {
					const embed: EmbedBuilder = this.client.createEmbed(
						'Für {0} ist die AI-gestützte Chatmoderation bereits deaktiviert.',
						'error',
						'error',
						role.toString()
					);
					return this.interaction.followUp({ embeds: [embed] });
				}
				data.guild.settings.aiModeration.excludedRoles =
					data.guild.settings.aiModeration.excludedRoles.filter(
						(id: string): boolean => id !== role.id
					);
				data.guild.markModified('settings.aiModeration.excludedRoles');
				await data.guild.save();

				const successEmbed: EmbedBuilder = this.client.createEmbed(
					'Für {0} ist die AI-gestützte Chatmoderation ab sofort aktiviert.',
					'success',
					'success',
					role.toString()
				);
				return this.interaction.followUp({ embeds: [successEmbed] });
			}
		}

		if (action === 'list') {
			const excludedChannelsAndRoles: string[] = [];

			for (const channelID of data.guild.settings.aiModeration
				.excludedChannels) {
				const channel: any =
					await this.interaction.guild.channels.cache.get(channelID);
				if (channel)
					excludedChannelsAndRoles.push(
						this.client.emotes.channel + ' ' + channel.toString()
					);
			}

			for (const roleID of data.guild.settings.aiModeration
				.excludedRoles) {
				const role: any = await this.interaction.guild.roles.cache.get(
					roleID
				);
				if (role)
					excludedChannelsAndRoles.push(
						this.client.emotes.ping + ' ' + role.toString()
					);
			}

			await this.client.utils.sendPaginatedEmbed(
				this.interaction,
				10,
				excludedChannelsAndRoles,
				'Deaktivierte Channel und Rollen',
				'Es sind bisher keine Channel oder Rollen von der AI-gestützten Chatmoderation ausgeschlossen worden.',
				''
			);
		}
	}

	private async setThreshold(number: any, data: any): Promise<void> {
		data.guild.settings.aiModeration.threshold = number;
		data.guild.markModified('settings.aiModeration.threshold');
		await data.guild.save();

		const embed: EmbedBuilder = this.client.createEmbed(
			'Die AI-gestützte Chatmoderation warnt nun ab einer Bewertung von {0}.',
			'success',
			'success',
			number
		);
		return this.interaction.followUp({ embeds: [embed] });
	}

	private async setChannel(channel: any, data: any): Promise<void> {
		data.guild.settings.aiModeration.alertChannel = channel.id;
		data.guild.markModified('settings.aiModeration.alertChannel');
		await data.guild.save();

		const embed: EmbedBuilder = this.client.createEmbed(
			'Die AI-gestützte Chatmoderation sendet Warnungen ab sofort in {0}.',
			'success',
			'success',
			channel.toString()
		);
		return this.interaction.followUp({ embeds: [embed] });
	}

	private async explain(): Promise<void> {
		const explainText: string =
			this.client.emotes.information +
			' Die **Chatmoderation** von ' +
			this.client.user!.username +
			' ist eine Funktion, welche Nachrichten auf **potenziell unangemessene Inhalte** überprüft.\n' +
			this.client.emotes.search +
			' Dabei wird der Inhalt der gesendeten Nachrichten mit Hilfe einer **künstlichen Intelligenz** analysiert, und in verschiedenen Kategorien bewertet.\n\n' +
			this.client.emotes.arrow +
			' Folgende Kategorien werden währenddessen überprüft, und bewertet:\n' +
			this.client.emotes.folder +
			' **Unangemessenheit**\n' +
			this.client.emotes.folder +
			' **Schwere Unangemessenheit**\n' +
			this.client.emotes.folder +
			' **Beleidigung**\n' +
			this.client.emotes.folder +
			' **Vulgäre Inhalte**\n' +
			this.client.emotes.folder +
			' **Bedrohung**\n\n' +
			this.client.emotes.bot +
			' Jeder Kategorie wird hierbei ein Wert zwischen **0 und 1** zugewiesen.\n' +
			this.client.emotes.arrow +
			' Dabei steht 0 für **nicht unangemessen**, und 1 für **sehr unangemessen**.\n\n' +
			this.client.emotes.search +
			' Abschließend wird der errechnete **Durchschnittswert** mit dem individuell festgelegten **Schwellenwert verglichen**.\n' +
			this.client.emotes.arrows.up +
			' Ist der Durchschnittswert **höher** als der Schwellenwert, wird die Nachricht als **potenziell unangemessen** eingestuft und eine Warnung mit entsprechenden Handlungsmöglichkeiten wird an die Moderatoren gesendet.\n' +
			this.client.emotes.arrows.down +
			' Ist der Durchschnittswert **niedriger** als der Schwellenwert, wird die Nachricht als **nicht unangemessen** eingestuft und es ist kein Eingreifen erforderlich.\n\n' +
			this.client.emotes.beta +
			' **Hinweis:** Diese Funktion befindet sich derzeit noch in der **Beta-Phase** und kann daher Fehler enthalten. Die AI-gestützte Chatmoderation **handelt nicht selber**, sondern gibt lediglich Warnungen ab. Für jede Handlung ist **menschliches Eingreifen erforderlich**.';

		const embed: EmbedBuilder = this.client.createEmbed(
			explainText,
			null,
			'normal'
		);
		embed.setTitle(
			this.client.emotes.flags.CertifiedModerator +
				' Erklärung der AI-gestützten Chatmoderation'
		);
		return this.interaction.followUp({ embeds: [embed] });
	}
}
