import BaseCommand from '@structures/BaseCommand';
import BaseClient from '@structures/BaseClient';
import {
	EmbedBuilder,
	SlashCommandBuilder,
	ChannelType,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder
} from 'discord.js';

export default class AichatCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'aichat',
			description: 'administration/aichat:general:description',
			memberPermissions: ['ManageGuild'],
			cooldown: 2 * 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName('action')
							.setDescription('administration/aichat:slash_command:options:0:description')
							.setRequired(true)
							.addChoices(
								{
									name: 'status',
									value: 'status'
								},
								{
									name: 'channel',
									value: 'channel'
								},
								{
									name: 'mode',
									value: 'mode'
								}
							)
					)
					.addChannelOption((option: any) =>
						option
							.setName('channel')
							.setDescription(
								'administration/aichat:slash_command:options:1:description'
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
								'administration/aichat:slash_command:options:2:description'
							)
							.setRequired(false)
							.addChoices(
								{
									name: 'on',
									value: 'on'
								},
								{
									name: 'off',
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

		const action: string = interaction.options.getString('action');
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
				.setPlaceholder(this.interaction.guild.translate("administration/aichat:handling:mode:selectMenuDescription"));

		for (const mode of availableModes) {
			selectNameMenu.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(mode.name)
					.setDescription(
						this.interaction.guild.translate("administration/aichat:handling:mode:selectMenuItem", { mode })
					)
					.setValue(mode.mode)
					.setEmoji(this.client.emotes.arrow)
					.setDefault(mode.mode === data.guild.settings.aiChat.mode)
			);
		}

		const row: any = this.client.createMessageComponentsRow(selectNameMenu);

		const embed: EmbedBuilder = this.client.createEmbed(
			this.interaction.guild.translate("administration/aichat:handling:mode:chooseEmbedDescription"),
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
				this.interaction.guild.translate("administration/aichat:handling:mode:set", { mode: chosenMode }),
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
				this.interaction.guild.translate("administration/aichat:handling:channel:errors:missingChannel"),
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [missingOptionsEmbed] });
		}

		data.guild.settings.aiChat.channel = channel.id;
		data.guild.markModified('settings.aiChat');
		await data.guild.save();

		const embed: EmbedBuilder = this.client.createEmbed(
			this.interaction.guild.translate("administration/aichat:handling:channel:set", { channel: channel.toString()}),
			'success',
			'normal'
		);
		return this.interaction.followUp({ embeds: [embed] });
	}

	private async setStatus(status: string, data: any): Promise<void> {
		if (!status) {
			const missingOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.interaction.guild.translate("administration/aichat:handling:status:errors:missingStatus"),
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

		const statusString: string = statuses[status]
			? this.interaction.guild.translate("basics:enabled")
			: this.interaction.guild.translate("basics:disabled");
		const embed: EmbedBuilder = this.client.createEmbed(
			this.interaction.guild.translate("administration/aichat:handling:status:set", { status: statusString }),
			'success',
			'normal'
		);
		return this.interaction.followUp({ embeds: [embed] });
	}
}
