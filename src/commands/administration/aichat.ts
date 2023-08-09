import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import {
	EmbedBuilder,
	SlashCommandBuilder,
	ChannelType,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder
} from "discord.js";

export default class AichatCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "aichat",
			description: "Verwaltet den KI-Chat des Servers",
			localizedDescriptions: {
				"en-US": "Manages the AI chat of the guild",
				"en-GB": "Manages the AI chat of the guild"
			},
			memberPermissions: ["ManageGuild"],
			cooldown: 2 * 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName("action")
							.setDescription(
								"Wähle aus den folgenden Aktionen"
							)
							.setDescriptionLocalization("en-US", "Choose from the following actions")
							.setDescriptionLocalization("en-GB", "Choose from the following actions")
							.setRequired(true)
							.addChoices(
								{
									name: "status",
									value: "status"
								},
								{
									name: "channel",
									value: "channel"
								},
								{
									name: "mode",
									value: "mode"
								}
							)
					)
					.addChannelOption((option: any) =>
						option
							.setName("channel")
							.setDescription(
								"Wähle den Kanal, in dem der KI-Chat aktiv sein soll"
							)
							.setDescriptionLocalization("en-US", "Choose the channel where the AI chat should be active")
							.setDescriptionLocalization("en-GB", "Choose the channel where the AI chat should be active")
							.setRequired(false)
							.addChannelTypes(
								ChannelType.GuildText,
								ChannelType.GuildAnnouncement,
								ChannelType.GuildForum,
								ChannelType.PublicThread
							)
					)
					.addStringOption((option: any) =>
						option
							.setName("status")
							.setDescription(
								"Wähle, ob der KI-Chat aktiviert oder deaktiviert sein soll"
							)
							.setDescriptionLocalization("en-US", "Choose whether the AI chat should be enabled or disabled")
							.setDescriptionLocalization("en-GB", "Choose whether the AI chat should be enabled or disabled")
							.setRequired(false)
							.addChoices(
								{
									name: "an",
									name_localizations: {
										"en-US": "on",
										"en-GB": "on"
									},
									value: "on"
								},
								{
									name: "aus",
									name_localizations: {
										"en-US": "off",
										"en-GB": "off"
									},
									value: "off"
								}
							)
					)
			}
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;

		if (!data.guild.settings.aiChat) {
			data.guild.settings.aiChat = {
				enabled: false,
				channel: null,
				mode: "normal"
			};
			data.guild.markModified("settings.aiChat");
			await data.guild.save();
		}

		const action: string = interaction.options.getString("action");
		switch (action) {
			case "status":
				await this.setStatus(
					interaction.options.getString("status"),
					data
				);
				break;
			case "channel":
				await this.setChannel(
					interaction.options.getChannel("channel"),
					data
				);
				break;
			case "mode":
				await this.setMode(data);
				break;
		}
	}

	private async setMode(data: any): Promise<void> {
		const availableModes: any[] = Object.entries(
			this.client.aiChatPrompts.prompts
		).map(([key, prompt]: any): any => ({
			mode: key,
			name: prompt.name
		}));

		const selectNameMenu: StringSelectMenuBuilder =
			new StringSelectMenuBuilder()
				.setCustomId(`${this.interaction.user.id}-aichat-mode`)
				.setPlaceholder(
					this.translate(
						"administration/aichat:mode:selectMenuDescription"
					)
				);

		for (const mode of availableModes) {
			selectNameMenu.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(mode.name)
					.setDescription(
						this.translate(
							"administration/aichat:mode:selectMenuItem",
							{ mode }
						)
					)
					.setValue(mode.mode)
					.setEmoji(this.client.emotes.arrow)
					.setDefault(mode.mode === data.guild.settings.aiChat.mode)
			);
		}

		const row: any = this.client.createMessageComponentsRow(selectNameMenu);

		const embed: EmbedBuilder = this.client.createEmbed(
			this.translate(
				"administration/aichat:mode:chooseEmbedDescription"
			),
			"arrow",
			"normal"
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
			data.guild.markModified("settings.aiChat");
			await data.guild.save();

			const confirmationEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate(
					"administration/aichat:mode:set",
					{ mode: chosenMode }
				),
				"success",
				"normal"
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
				.push({ role: "system", content: prompt });
		}
	}

	private async setChannel(channel: any, data: any): Promise<void> {
		if (!channel) {
			const missingOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate(
					"administration/aichat:channel:errors:missingChannel"
				),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [missingOptionsEmbed] });
		}

		data.guild.settings.aiChat.channel = channel.id;
		data.guild.markModified("settings.aiChat");
		await data.guild.save();

		const embed: EmbedBuilder = this.client.createEmbed(
			this.translate(
				"administration/aichat:channel:set",
				{ channel: channel.toString() }
			),
			"success",
			"normal"
		);
		return this.interaction.followUp({ embeds: [embed] });
	}

	private async setStatus(status: string, data: any): Promise<void> {
		if (!status) {
			const missingOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate(
					"administration/aichat:status:errors:missingStatus"
				),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [missingOptionsEmbed] });
		}

		const statuses: any = {
			on: true,
			off: false
		};
		data.guild.settings.aiChat.enabled = statuses[status];
		data.guild.markModified("settings.aiChat");
		await data.guild.save();

		const statusString: string = statuses[status]
			? this.translate("basics:enabled")
			: this.translate("basics:disabled");
		const embed: EmbedBuilder = this.client.createEmbed(
			this.translate(
				"administration/aichat:status:set",
				{ status: statusString }
			),
			"success",
			"normal"
		);
		return this.interaction.followUp({ embeds: [embed] });
	}
}
