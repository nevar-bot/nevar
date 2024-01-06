import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";
import Utils from "@helpers/Utils";

export default class AutoreactCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "autoreact",
			description: "Manages automatic reactions to messages",
			localizedDescriptions: {
				de: "Verwaltet das automatische Reagieren auf Nachrichten",
			},
			memberPermissions: ["ManageGuild"],
			botPermissions: ["AddReactions"],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName("action")
							.setNameLocalizations({
								de: "aktion",
							})
							.setDescription("Choose from the following actions")
							.setDescriptionLocalizations({
								de: "Wähle aus den folgenden Aktionen",
							})
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
							.setNameLocalizations({
								de:	"kanal"
							})
							.setDescription("Choose for which channel you want to perform the action")
							.setDescriptionLocalizations({
								de: "Wähle, für welchen Channel du die Aktion ausführen möchtest",
							})
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
							.setDescription("Enter the emoji you want")
							.setDescriptionLocalizations({
								de: "Gib den gewünschten Emoji ein",
							})
							.setRequired(false),
					),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<any> {
		this.interaction = interaction;
		this.guild = interaction.guild;

		const action: string = interaction.options.getString("action");

		switch (action) {
			case "add":
				await this.addAutoReact(
					data,
					interaction.options.getChannel("channel"),
					interaction.options.getString("emoji"),
				);
				break;
			case "remove":
				await this.removeAutoReact(
					data,
					interaction.options.getChannel("channel"),
					interaction.options.getString("emoji"),
				);
				break;
			case "list":
				await this.showList(data);
				break;
			default:
				const unexpectedErrorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("basics:errors:unexpected", { support: this.client.support }, true),
					"error",
					"error",
				);
				return this.interaction.followUp({
					embeds: [unexpectedErrorEmbed],
				});
		}
	}

	private async addAutoReact(data: any, channel: any, emote: string): Promise<any> {
		/* Missing arguments */
		if (!channel || !channel.id || !emote) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:missingChannelOrEmoji"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Invalid emoji */
		const { stringIsEmoji, stringIsCustomEmoji } = Utils;
		if (!stringIsEmoji(emote) && !stringIsCustomEmoji(emote)) {
			const invalidEmojiEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:invalidEmoji"),
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
				this.translate("errors:cantUseEmoji"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [unusableEmojiEmbed] });
		}

		/* Emoji is already added to this channel */
		if (data.guild.settings.autoreact.find((r: any): boolean => r.channel === channel.id && r.emoji === emote)) {
			const alreadyAddedEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:alreadyAddedInChannel", { channel: channel.toString() }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [alreadyAddedEmbed] });
		}

		/* Add emoji to autoreact */
		data.guild.settings.autoreact.push({
			channel: channel.id,
			emoji: emote,
		});
		data.guild.markModified("settings.autoreact");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("added", {
				emoji: originEmote,
				channel: channel.toString(),
			}),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async removeAutoReact(data: any, channel: any, emote: string): Promise<any> {
		/* Missing arguments */
		if (!channel || !channel.id || !emote) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:missingChannelOrEmoji"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Invalid emoji */
		const { stringIsEmoji, stringIsCustomEmoji } = Utils;
		if (!stringIsEmoji(emote) && !stringIsCustomEmoji(emote)) {
			const invalidEmojiEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:invalidEmoji"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidEmojiEmbed] });
		}

		/* Get emoji id, if custom emoji is chosen */
		const originEmote: string = emote;
		if (stringIsCustomEmoji(emote)) emote = emote.replace(/<a?:\w+:(\d+)>/g, "$1");

		/* Emoji is not added to this channel */
		if (!data.guild.settings.autoreact.find((r: any): boolean => r.channel === channel.id && r.emoji === emote)) {
			const alreadyAddedEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:notAddedInChannel", { channel: channel.toString() }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [alreadyAddedEmbed] });
		}

		/* Remove emoji from autoreact */
		data.guild.settings.autoreact = data.guild.settings.autoreact.filter(
			(r: any): boolean => r.channel !== channel.id || r.emoji !== emote,
		);
		data.guild.markModified("settings.autoreact");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("removed", { emoji: originEmote, channel: channel.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async showList(data: any): Promise<void> {
		const response: any = data.guild.settings.autoreact;
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
				this.translate("list:channel") +
				":** " +
				item +
				"\n" +
				this.client.emotes.wave + " **" +
				this.translate("list:emojis") +
				":** " +
				sortedAutoReactArray[item].join(" ") +
				"\n",
			);
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			5,
			finalSortedAutoReactArray,
			"Autoreact",
			this.translate("list:empty"),
		);
	}
}
