/** @format */

import BaseCommand from '@structures/BaseCommand';
import BaseClient from '@structures/BaseClient';
import {
	EmbedBuilder,
	SlashCommandBuilder,
	ChannelType,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder
} from 'discord.js';

export default class AimodCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'aichat',
			description: 'Stellt den KI-Chat des Servers ein',
			memberPermissions: ['ManageGuild'],
			cooldown: 2 * 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName('aktion')
							.setDescription('Wähle aus den folgenden Aktionen')
							.setRequired(true)
							.addChoices(
								{
									name: 'status',
									value: 'status'
								},
								{
									name: 'kanal',
									value: 'channel'
								},
								{
									name: 'modus',
									value: 'mode'
								}
							)
					)
					.addChannelOption((option: any) =>
						option
							.setName('channel')
							.setDescription(
								'Wähle den Kanal, in dem der KI-Chat aktiv sein soll'
							)
							.setRequired(false)
							.addChannelTypes(
								ChannelType.GuildText,
								ChannelType.GuildNews,
								ChannelType.GuildForum,
								ChannelType.GuildPublicThread
							)
					)
					.addStringOption((option: any) =>
						option
							.setName('status')
							.setDescription(
								'Wähle, ob der KI-Chat aktiviert oder deaktiviert sein soll'
							)
							.setRequired(false)
							.addChoices(
								{
									name: 'aktiviert',
									value: 'on'
								},
								{
									name: 'deaktiviert',
									value: 'off'
								}
							)
					)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;

		if (!data.guild.settings.aiChat) {
			data.guild.settings.aiChat = {
				enabled: false,
				channel: null,
				mode: 'normal'
			};
			data.guild.markModified('settings.aiChat');
			await data.guild.save();
		}

		const action: string = interaction.options.getString('aktion');
		switch (action) {
			case 'status':
				await this.setStatus(
					interaction.options.getString('status'),
					data
				);
				break;
			case 'channel':
				await this.setChannel(
					interaction.options.getChannel('channel'),
					data
				);
				break;
			case 'mode':
				await this.setMode(data);
				break;
		}
	}

	private async setMode(data: any): Promise<void> {
		const availableModes = Object.entries(
			this.client.aiChatPrompts.prompts
		).map(([key, prompt]: any): any => ({
			mode: key,
			name: prompt.name
		}));

		const selectNameMenu: StringSelectMenuBuilder =
			new StringSelectMenuBuilder()
				.setCustomId(`${this.interaction.user.id}-aichat-mode`)
				.setPlaceholder('Wähle einen Verhaltensmodus');

		for (const mode of availableModes) {
			selectNameMenu.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(mode.name)
					.setDescription(
						`Setze den Verhaltensmodus auf ${mode.name}`
					)
					.setValue(mode.mode)
					.setEmoji(this.client.emotes.arrow)
					.setDefault(mode.mode === data.guild.settings.aiChat.mode)
			);
		}

		const row: any = this.client.createMessageComponentsRow(selectNameMenu);

		const embed: EmbedBuilder = this.client.createEmbed(
			'Wähle aus den folgenden Verhaltensmodi.',
			'arrow',
			'normal'
		);
		const message: any = await this.interaction.followUp({
			embeds: [embed],
			components: [row]
		});

		const collectedMode: any = await message
			.awaitMessageComponent({
				filter: (i: any): boolean =>
					i.user.id === this.interaction.user.id,
				time: 120 * 1000
			})
			.catch((): void => {});

		if (collectedMode?.values[0]) {
			const chosenMode =
				this.client.aiChatPrompts.prompts[collectedMode.values[0]].name;

			data.guild.settings.aiChat.mode = collectedMode.values[0];
			data.guild.markModified('settings.aiChat');
			await data.guild.save();

			const confirmationEmbed = this.client.createEmbed(
				`Der Verhaltensmodus wurde auf ${chosenMode} gesetzt.`,
				'success',
				'normal'
			);
			await collectedMode.update({
				embeds: [confirmationEmbed],
				components: []
			});

			/* Reset the AI chat, set mode */
			this.client.aiChat.set(this.interaction.guild.id, []);
			const prompt =
				this.client.aiChatPrompts.default +
				this.client.aiChatPrompts.prompts[collectedMode.values[0]]
					.prompt;
			this.client.aiChat
				.get(this.interaction.guild.id)!
				.push({ role: 'system', content: prompt });
		}
	}

	private async setChannel(channel: any, data: any): Promise<void> {
		if (!channel) {
			const missingOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Du musst einen Channel auswählen.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [missingOptionsEmbed] });
		}

		data.guild.settings.aiChat.channel = channel.id;
		data.guild.markModified('settings.aiChat');
		await data.guild.save();

		const embed: EmbedBuilder = this.client.createEmbed(
			'Der KI-Chat ist jetzt in ' + channel.toString() + ' aktiv.',
			'success',
			'normal'
		);
		return this.interaction.followUp({ embeds: [embed] });
	}

	private async setStatus(status: string, data: any): Promise<void> {
		if (!status) {
			const missingOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Du musst einen Status auswählen.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [missingOptionsEmbed] });
		}

		const statuses: any = {
			on: true,
			off: false
		};
		data.guild.settings.aiChat.enabled = statuses[status];
		data.guild.markModified('settings.aiChat');
		await data.guild.save();

		const statusString: 'aktiviert' | 'deaktiviert' = statuses[status]
			? 'aktiviert'
			: 'deaktiviert';
		const embed: EmbedBuilder = this.client.createEmbed(
			`Der KI-Chat ist jetzt ${statusString}.`,
			'success',
			'normal'
		);
		return this.interaction.followUp({ embeds: [embed] });
	}
}
