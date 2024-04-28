import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";
import { Utils } from "@helpers/Utils.js";
import path from "path";

export default class AutoreactCommand extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "autoreact",
			description: "Automatically react to new messages with your favourite emojis",
			localizedDescriptions: {
				de: "Reagiere mit deinen Lieblingsemojis automatisch auf neue Nachrichten",
			},
			memberPermissions: ["ManageGuild"],
			botPermissions: ["AddReactions"],
			cooldown: 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName("action")
							.setNameLocalization("de", "aktion")
							.setDescription("Choose one of the above actions")
							.setDescriptionLocalization("de", "Wähle eine der genannten Aktionen")
							.setRequired(true)
							.addChoices(
								{
									name: "add",
									name_localizations: {
										de: "hinzufügen",
									},
									value: "add",
								},
								{
									name: "remove",
									name_localizations: {
										de: "entfernen",
									},
									value: "remove",
								},
								{
									name: "list",
									name_localizations: {
										de: "liste",
									},
									value: "list",
								},
							),
					)
					.addChannelOption((option: any) =>
						option
							.setName("channel")
							.setNameLocalization("de", "kanal")
							.setDescription("Select a channel")
							.setDescriptionLocalization("de", "Wähle einen Kanal")
							.setRequired(false)
							.addChannelTypes(
								ChannelType.GuildText,
								ChannelType.GuildAnnouncement,
								ChannelType.GuildForum,
								ChannelType.PublicThread,
							),
					)
					.addStringOption((option: any) =>
						option
							.setName("emoji")
							.setDescription("Select your desired emoji")
							.setDescriptionLocalization("de", "Wähle deinen gewünschten Emoji")
							.setRequired(false),
					),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<any> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;

		const action: string = interaction.options.getString("action");

		switch (action) {
			case "add":
				await this.addAutoReact(
					interaction.options.getChannel("channel"),
					interaction.options.getString("emoji"),
				);
				break;
			case "remove":
				await this.removeAutoReact(
					interaction.options.getChannel("channel"),
					interaction.options.getString("emoji"),
				);
				break;
			case "list":
				await this.showList();
				break;
		}
	}

	private async addAutoReact(channel: any, emote: string): Promise<any> {
		/* Missing arguments */
		if (!channel || !channel.id || !emote) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:channelOrEmojiIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Invalid emoji */
		const { stringIsEmoji, stringIsCustomEmoji } = new Utils();
		if (!stringIsEmoji(emote) && !stringIsCustomEmoji(emote)) {
			const invalidEmojiEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:emojiIsInvalid"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidEmojiEmbed] });
		}

		/* Get emoji id, if custom emoji is chosen */
		const originEmote: string = emote;
		if (stringIsCustomEmoji(emote)) emote = emote.replace(/<a?:\w+:(\d+)>/g, "$1");
		/* Bot can't use this emoji */
		if (stringIsCustomEmoji(originEmote) && !this.client.emojis.cache.find((e: any): boolean => e.id === emote)) {
			const unusableEmojiEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:emojiIsNotUsable"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [unusableEmojiEmbed] });
		}

		/* Emoji is already added to this channel */
		if (this.data.guild.settings.autoreact.find((r: any): boolean => r.channel === channel.id && r.emoji === emote)) {
			const alreadyAddedEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:emojiIsAlreadyAddedToAutoreact", { channel: channel.toString() }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [alreadyAddedEmbed] });
		}

		/* Add emoji to autoreact */
		this.data.guild.settings.autoreact.push({
			channel: channel.id,
			emoji: emote,
		});
		this.data.guild.markModified("settings.autoreact");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("emojiAddedToAutoreact", {
				emoji: originEmote,
				channel: channel.toString(),
			}),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async removeAutoReact(channel: any, emote: string): Promise<any> {
		/* Missing arguments */
		if (!channel || !channel.id || !emote) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:channelOrEmojiIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Invalid emoji */
		const { stringIsEmoji, stringIsCustomEmoji } = new Utils();
		if (!stringIsEmoji(emote) && !stringIsCustomEmoji(emote)) {
			const invalidEmojiEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:emojiIsInvalid"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidEmojiEmbed] });
		}

		/* Get emoji id, if custom emoji is chosen */
		const originEmote: string = emote;
		if (stringIsCustomEmoji(emote)) emote = emote.replace(/<a?:\w+:(\d+)>/g, "$1");

		/* Emoji is not added to this channel */
		if (!this.data.guild.settings.autoreact.find((r: any): boolean => r.channel === channel.id && r.emoji === emote)) {
			const alreadyAddedEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:emojiIsNotAddedToAutoreact", { channel: channel.toString() }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [alreadyAddedEmbed] });
		}

		/* Remove emoji from autoreact */
		this.data.guild.settings.autoreact = this.data.guild.settings.autoreact.filter(
			(r: any): boolean => r.channel !== channel.id || r.emoji !== emote,
		);
		this.data.guild.markModified("settings.autoreact");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("emojiRemovedFromAutoreact", { emoji: originEmote, channel: channel.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async showList(): Promise<void> {
		const response: any = this.data.guild.settings.autoreact;
		const sortedAutoReactArray: any[] = [];
		const finalSortedAutoReactArray: any[] = [];

		for (const item of response) {
			if (typeof item !== "object") continue;
			const cachedChannel: any = this.interaction.guild!.channels.cache.get(item.channel);
			if (cachedChannel) {
				const cachedEmoji: any = this.client.emojis.cache.get(item.emoji);
				if (!sortedAutoReactArray[cachedChannel.toString()])
					sortedAutoReactArray[cachedChannel.toString()] = [];
				sortedAutoReactArray[cachedChannel.toString()].push(cachedEmoji ? cachedEmoji.toString() : item.emoji);
			}
		}

		for (const item in sortedAutoReactArray) {
			finalSortedAutoReactArray.push(
				this.client.emotes.channel + " **" +
				this.getBasicTranslation("channel") +
				":** " +
				item +
				"\n" +
				this.client.emotes.wave + " **" +
				this.getBasicTranslation("emojis") +
				":** " +
				sortedAutoReactArray[item].join(" ") +
				"\n",
			);
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			5,
			finalSortedAutoReactArray,
			this.translate("list:title"),
			this.translate("list:noEmojisAddedToAutoreact"),
		);
	}
}
