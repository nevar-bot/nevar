import BaseCommand from '@structures/BaseCommand';
import BaseClient from '@structures/BaseClient';
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from 'discord.js';

export default class WelcomeCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'welcome',
			description: 'Stellt die Willkommensnachricht ein',
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
								'Legt fest, ob die Willkommensnachricht aktiviert oder deaktiviert ist'
							)
							.addStringOption((option: any) =>
								option
									.setName('status')
									.setDescription('Wähle einen Status')
									.setRequired(true)
									.addChoices(
										{ name: 'an', value: 'true' },
										{ name: 'aus', value: 'false' }
									)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName('test')
							.setDescription('Sendet eine Testnachricht')
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName('channel')
							.setDescription(
								'Legt fest, in welchem Channel die Willkommensnachricht gesendet wird'
							)
							.addChannelOption((option: any) =>
								option
									.setName('channel')
									.setRequired(true)
									.setDescription('Wähle einen Channel')
									.addChannelTypes(
										ChannelType.GuildText,
										ChannelType.GuildNews
									)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName('typ')
							.setDescription(
								'Ob die Willkommensnachricht als Embed oder als Text gesendet wird'
							)
							.addStringOption((option: any) =>
								option
									.setName('typ')
									.setDescription('Wähle einen Typ')
									.setRequired(true)
									.addChoices(
										{ name: 'embed', value: 'embed' },
										{ name: 'text', value: 'text' }
									)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName('nachricht')
							.setDescription(
								'Definiert die Willkommensnachricht (Variablen siehe /welcome variablen)'
							)
							.addStringOption((option: any) =>
								option
									.setName('nachricht')
									.setDescription('Gib die Nachricht ein')
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName('variablen')
							.setDescription(
								'Listet alle Variablen, die in der Willkommensnachricht verwendet werden können'
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName('color')
							.setDescription(
								'Die Farbe des Embeds (Standard: #5865F2)'
							)
							.addStringOption((option: any) =>
								option
									.setName('farbe')
									.setDescription(
										'Gib eine Farbe im HEX-Format ein'
									)
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName('thumbnail')
							.setDescription(
								'Soll das Profilbild im Embed angezeigt werden?'
							)
							.addStringOption((option: any) =>
								option
									.setName('status')
									.setDescription('Wähle einen Status')
									.setRequired(true)
									.addChoices(
										{ name: 'an', value: 'true' },
										{ name: 'aus', value: 'false' }
									)
							)
					)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;

		const subcommand: string = interaction.options.getSubcommand();

		switch (subcommand) {
			case 'status':
				await this.setStatus(
					interaction.options.getString('status'),
					data
				);
				break;
			case 'test':
				await this.sendPreview(data);
				break;
			case 'channel':
				await this.setChannel(
					interaction.options.getChannel('channel'),
					data
				);
				break;
			case 'typ':
				await this.setType(interaction.options.getString('typ'), data);
				break;
			case 'nachricht':
				await this.setMessage(
					interaction.options.getString('nachricht'),
					data
				);
				break;
			case 'color':
				await this.setColor(
					interaction.options.getString('farbe'),
					data
				);
				break;
			case 'thumbnail':
				await this.setThumbnail(
					interaction.options.getString('status'),
					data
				);
				break;
			case 'variablen':
				await this.showVariables();
				break;
		}
	}

	private async setStatus(status: any, data: any): Promise<void> {
		if (data.guild.settings.welcome.enabled === JSON.parse(status)) {
			const statusString: string = JSON.parse(status)
				? 'aktiviert'
				: 'deaktiviert';
			const isAlreadyEmbed: EmbedBuilder = this.client.createEmbed(
				'Die Willkommensnachricht ist bereits {0}.',
				'error',
				'error',
				statusString
			);
			return this.interaction.followUp({ embeds: [isAlreadyEmbed] });
		}

		data.guild.settings.welcome.enabled = JSON.parse(status);
		data.guild.markModified('settings.welcome.enabled');
		await data.guild.save();

		const statusString: string = JSON.parse(status)
			? 'aktiviert'
			: 'deaktiviert';
		const successEmbed: EmbedBuilder = this.client.createEmbed(
			'Die Willkommensnachricht wurde {0}.',
			'success',
			'success',
			statusString
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async sendPreview(data: any): Promise<void> {
		if (!data.guild.settings.welcome.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				'Die Willkommensnachricht ist nicht aktiviert.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}
		if (
			!data.guild.settings.welcome.channel ||
			!this.client.channels.cache.get(data.guild.settings.welcome.channel)
		) {
			const noChannelEmbed: EmbedBuilder = this.client.createEmbed(
				'Es wurde kein Channel für die Willkommensnachricht festgelegt.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [noChannelEmbed] });
		}
		if (!data.guild.settings.welcome.message) {
			const noMessageEmbed: EmbedBuilder = this.client.createEmbed(
				'Es wurde keine Nachricht für die Willkommensnachricht festgelegt.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [noMessageEmbed] });
		}
		if (!data.guild.settings.welcome.type) {
			const noTypeEmbed: EmbedBuilder = this.client.createEmbed(
				'Es wurde kein Typ für die Willkommensnachricht festgelegt.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [noTypeEmbed] });
		}

		const member = this.interaction.member;
		const self = this;
		function parseMessage(str: string): string {
			return str
				.replaceAll(/{user}/g, member)
				.replaceAll(/{user:username}/g, member.user.username)
				.replaceAll(/{user:displayname}/g, member.user.displayName)
				.replaceAll(/{user:id}/g, member.user.id)
				.replaceAll(/{server:name}/g, self.interaction.guild.name)
				.replaceAll(/{server:id}/g, self.interaction.guild.id)
				.replaceAll(
					/{server:membercount}/g,
					self.interaction.guild.memberCount
				)
				.replaceAll(/{inviter}/g, member)
				.replaceAll(/{inviter:username}/g, member.user.username)
				.replaceAll(/{inviter:displayname}/g, member.user.displayName)
				.replaceAll(/{inviter:id}/g, member.user.id)
				.replaceAll(/{inviter:invites}/g, String(1))
				.replaceAll(/{newline}/g, '\n');
		}

		const channel: any = this.client.channels.cache.get(
			data.guild.settings.welcome.channel
		);
		const message: string = parseMessage(
			data.guild.settings.welcome.message
		);

		if (data.guild.settings.welcome.type === 'embed') {
			const previewEmbed: EmbedBuilder = new EmbedBuilder()
				.setAuthor({
					name: this.client.user!.username,
					iconURL: this.client.user!.displayAvatarURL()
				})
				.setDescription(message)
				.setColor(
					data.guild.settings.welcome.color ||
						this.client.config.embeds['DEFAULT_COLOR']
				)
				.setFooter({ text: this.client.config.embeds['FOOTER_TEXT'] });

			if (data.guild.settings.welcome.thumbnail) {
				previewEmbed.setThumbnail(
					member.user.displayAvatarURL({ dynamic: true, size: 512 })
				);
			}

			await channel
				.send({ embeds: [previewEmbed] })
				.catch((e: any): void => {});
		} else if (data.guild.settings.welcome.type === 'text') {
			await channel
				.send({ content: message })
				.catch((e: any): void => {});
		}

		const testExecutedEmbed: EmbedBuilder = this.client.createEmbed(
			'Die Willkommensnachricht wurde getestet',
			'success',
			'success'
		);
		return this.interaction.followUp({ embeds: [testExecutedEmbed] });
	}

	private async setChannel(channel: any, data: any): Promise<void> {
		if (!data.guild.settings.welcome.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				'Die Willkommensnachricht ist nicht aktiviert.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		data.guild.settings.welcome.channel = channel.id;
		data.guild.markModified('settings.welcome.channel');
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			'Die Willkommensnachricht wird ab jetzt in {0} gesendet.',
			'success',
			'success',
			channel.toString()
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setType(type: any, data: any): Promise<void> {
		if (!data.guild.settings.welcome.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				'Die Willkommensnachricht ist nicht aktiviert.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		if (data.guild.settings.welcome.type === type) {
			const statusString: string =
				type === 'embed' ? 'Embed' : 'Textnachricht';
			const isAlreadyEmbed: EmbedBuilder = this.client.createEmbed(
				'Die Willkommensnachricht wird bereits als {0} gesendet.',
				'error',
				'error',
				statusString
			);
			return this.interaction.followUp({ embeds: [isAlreadyEmbed] });
		}

		data.guild.settings.welcome.type = type;
		data.guild.markModified('settings.welcome.type');
		await data.guild.save();

		const statusString: string =
			type === 'embed' ? 'Embed' : 'Textnachricht';
		const successEmbed: EmbedBuilder = this.client.createEmbed(
			'Die Willkommensnachricht wird ab jetzt als {0} gesendet.',
			'success',
			'success',
			statusString
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setMessage(message: string, data: any): Promise<void> {
		if (!data.guild.settings.welcome.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				'Die Willkommensnachricht ist nicht aktiviert.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		data.guild.settings.welcome.message = message;
		data.guild.markModified('settings.welcome.message');
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			'Die Willkommensnachricht wurde geändert.',
			'success',
			'success'
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	async showVariables(): Promise<void> {
		const variables: string[] = [
			'**{user}** - Erwähnt das Mitglied',
			'**{user:username}** - Der Nutzername des Mitglieds',
			'**{user:displayname}** - Der Anzeigename des Mitglieds',
			'**{user:id}** - ID des Mitglieds',
			'**{server:name}** - Name des Servers',
			'**{server:id}** - ID des Servers',
			'**{server:membercount}** - Anzahl an Mitgliedern des Servers',
			'**{inviter}** - Erwähnt den Einladenden',
			'**{inviter:username}** - Der Nutzername des Einladenden',
			'**{inviter:displayname}** - Der Anzeigename des Einladenden',
			'**{inviter:id}** - ID des Einladenden',
			'**{inviter:invites}** - Anzahl der Einladungen des Einladenden',
			'**{newline}** - Fügt eine neue Zeile ein'
		];
		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			10,
			variables,
			'Verfügbare Variablen',
			'Es sind keine Variablen verfügbar',
			'shine'
		);
	}

	private async setThumbnail(status: any, data: any): Promise<void> {
		if (!data.guild.settings.welcome.profilePicture) {
			data.guild.settings.welcome.profilePicture = true;
			data.guild.markModified('settings.welcome.profilePicture');
		}

		if (!data.guild.settings.welcome.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				'Die Willkommensnachricht ist nicht aktiviert.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		if (data.guild.settings.welcome.type === 'text') {
			const embedNotEnabled: EmbedBuilder = this.client.createEmbed(
				'Der Typ der Verabschiedungsnachricht muss auf Embed gesetzt sein.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [embedNotEnabled] });
		}

		if (data.guild.settings.welcome.profilePicture === JSON.parse(status)) {
			const statusString: string = JSON.parse(status)
				? 'aktiviert'
				: 'deaktiviert';
			const isAlreadyEmbed: EmbedBuilder = this.client.createEmbed(
				'Das Profilbild im Embed ist bereits {0}.',
				'error',
				'error',
				statusString
			);
			return this.interaction.followUp({ embeds: [isAlreadyEmbed] });
		}

		data.guild.settings.welcome.profilePicture = JSON.parse(status);
		data.guild.markModified('settings.welcome.profilePicture');
		await data.guild.save();

		const statusString: string = JSON.parse(status)
			? 'aktiviert'
			: 'deaktiviert';
		const successEmbed: EmbedBuilder = this.client.createEmbed(
			'Das Profilbild im Embed wurde {0}.',
			'success',
			'success',
			statusString
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setColor(color: any, data: any): Promise<void> {
		if (!data.guild.settings.welcome.color) {
			data.guild.settings.welcome.color = '#5865F2';
			data.guild.markModified('settings.welcome.color');
		}

		if (!data.guild.settings.welcome.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				'Die Willkommensnachricht ist nicht aktiviert.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		if (data.guild.settings.welcome.type === 'text') {
			const embedNotEnabled: EmbedBuilder = this.client.createEmbed(
				'Der Typ der Willkommensnachricht muss auf Embed gesetzt sein.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [embedNotEnabled] });
		} else if (data.guild.settings.welcome.type === 'embed') {
			if (!this.client.utils.stringIsHexColor(color)) {
				const invalidColorEmbed: EmbedBuilder = this.client.createEmbed(
					'Du musst eine gültige Farbe im HEX-Format angeben.',
					'error',
					'error'
				);
				return this.interaction.followUp({
					embeds: [invalidColorEmbed]
				});
			}
			data.guild.settings.welcome.color = color;
			data.guild.markModified('settings.welcome.color');
			await data.guild.save();

			const successEmbed: EmbedBuilder = this.client.createEmbed(
				'Die Farbe des Embeds wurde auf {0} geändert.',
				'success',
				'success',
				color
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		}
	}
}
