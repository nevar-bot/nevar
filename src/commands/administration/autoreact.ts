import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";
import Utils from "@helpers/Utils";

export default class AutoreactCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "autoreact",
			description: "Verwaltet das automatische Reagieren auf Nachrichten",
			localizedDescriptions: {
				"en-US": "Manages automatic reactions to messages",
				"en-GB": "Manages automatic reactions to messages"
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
							.setDescription("Wähle aus den folgenden Aktionen")
							.setDescriptionLocalizations({
								"en-US": "Choose from the following actions",
								"en-GB": "Choose from the following actions"
							})
							.setRequired(true)
							.addChoices(
								{
									name: "hinzufügen",
									name_localizations: {
										"en-US": "add",
										"en-GB": "add"
									},
									value: "add"
								},
								{
									name: "entfernen",
									name_localizations: {
										"en-US": "remove",
										"en-GB": "remove"
									},
									value: "remove"
								},
								{
									name: "liste",
									name_localizations: {
										"en-US": "list",
										"en-GB": "list"
									},
									value: "list"
								}
							)
					)
					.addChannelOption((option: any) =>
						option
							.setName("channel")
							.setDescription("Wähle, für welchen Channel du die Aktion ausführen möchtest")
							.setDescriptionLocalizations({
								"en-US": "Choose for which channel you want to perform the action",
								"en-GB": "Choose for which channel you want to perform the action"
							})
							.setRequired(false)
							.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum, ChannelType.PublicThread)
					)
					.addStringOption((option: any) =>
						option
							.setName("emoji")
							.setDescription("Gib den gewünschten Emoji ein")
							.setDescriptionLocalizations({
								"en-US": "Enter the emoji you want",
								"en-GB": "Enter the emoji you want"
							})
							.setRequired(false))
			}
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;

		const action: string = interaction.options.getString("action");

		switch (action) {
			case "add":
				await this.addAutoReact(data, interaction.options.getChannel("channel"), interaction.options.getString("emoji"));
				break;
			case "remove":
				await this.removeAutoReact(data, interaction.options.getChannel("channel"), interaction.options.getString("emoji"));
				break;
			case "list":
				await this.showList(data);
				break;
			default:
				const unexpectedErrorEmbed: EmbedBuilder = this.client.createEmbed(this.translate("basics:errors:unexpected", { support: this.client.support }), "error", "error");
				return this.interaction.followUp({
					embeds: [unexpectedErrorEmbed]
				});
		}
	}

	private async addAutoReact(data: any, channel: any, emote: string): Promise<void> {
		/* Missing arguments */
		if (!channel || !channel.id || !emote) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/autoreact:errors:missingChannelOrEmoji"), "error", "error");
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Invalid emoji */
		const { stringIsEmoji, stringIsCustomEmoji } = Utils;
		if (!stringIsEmoji(emote) && !stringIsCustomEmoji(emote)) {
			const invalidEmojiEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/autoreact:errors:invalidEmoji"), "error", "error");
			return this.interaction.followUp({ embeds: [invalidEmojiEmbed] });
		}

		/* Get emoji id, if custom emoji is chosen */
		const originEmote: string = emote;
		if (stringIsCustomEmoji(emote)) emote = emote.replace(/<a?:\w+:(\d+)>/g, "$1");
		/* Bot can't use this emoji */
		if (stringIsCustomEmoji(originEmote) && !this.client.emojis.cache.find((e: any): boolean => e.id === emote)) {
			const unusableEmojiEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/autoreact:errors:cantUseEmoji"), "error", "error");
			return this.interaction.followUp({ embeds: [unusableEmojiEmbed] });
		}

		/* Emoji is already added to this channel */
		if (data.guild.settings.autoreact.find((r: any): boolean => r.channel === channel.id && r.emoji === emote)) {
			const alreadyAddedEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/autoreact:errors:alreadyAddedInChannel", { channel: channel.toString() }),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [alreadyAddedEmbed] });
		}

		/* Add emoji to autoreact */
		data.guild.settings.autoreact.push({
			channel: channel.id,
			emoji: emote
		});
		data.guild.markModified("settings.autoreact");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("administration/autoreact:added", { emoji: originEmote, channel: channel.toString() }),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async removeAutoReact(data: any, channel: any, emote: string): Promise<void> {
		/* Missing arguments */
		if (!channel || !channel.id || !emote) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/autoreact:errors:missingChannelOrEmoji"), "error", "error");
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Invalid emoji */
		const { stringIsEmoji, stringIsCustomEmoji } = Utils;
		if (!stringIsEmoji(emote) && !stringIsCustomEmoji(emote)) {
			const invalidEmojiEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/autoreact:errors:invalidEmoji"), "error", "error");
			return this.interaction.followUp({ embeds: [invalidEmojiEmbed] });
		}

		/* Get emoji id, if custom emoji is chosen */
		const originEmote: string = emote;
		if (stringIsCustomEmoji(emote)) emote = emote.replace(/<a?:\w+:(\d+)>/g, "$1");

		/* Emoji is not added to this channel */
		if (!data.guild.settings.autoreact.find((r: any): boolean => r.channel === channel.id && r.emoji === emote)) {
			const alreadyAddedEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/autoreact:errors:notAddedInChannel", { channel: channel.toString() }),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [alreadyAddedEmbed] });
		}

		/* Remove emoji from autoreact */
		data.guild.settings.autoreact = data.guild.settings.autoreact.filter((r: any): boolean => r.channel !== channel.id || r.emoji !== emote);
		data.guild.markModified("settings.autoreact");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("administration/autoreact:removed", { emoji: originEmote, channel: channel.toString() }),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async showList(data: any): Promise<void> {
		let response: any = data.guild.settings.autoreact;
		const sortedAutoReactArray: any[] = [];
		const finalSortedAutoReactArray: any[] = [];

		for (let i: number = 0; i < response.length; i++) {
			if (typeof response[i] !== "object") continue;
			const cachedChannel: any = this.interaction.guild.channels.cache.get(response[i].channel);
			if (cachedChannel) {
				const cachedEmoji: any = this.client.emojis.cache.get(response[i].emoji);
				if (!sortedAutoReactArray[cachedChannel.toString()]) sortedAutoReactArray[cachedChannel.toString()] = [];
				sortedAutoReactArray[cachedChannel.toString()].push(cachedEmoji ? cachedEmoji.toString() : response[i].emoji);
			}
		}

		for (let item in sortedAutoReactArray) {
			finalSortedAutoReactArray.push(
				" " + this.translate("administration/autoreact:list:channel") + ": " + item + "\n" +
				this.client.emotes.arrow + " " + this.translate("administration/autoreact:list:emojis") + ": " + sortedAutoReactArray[item].join(", ") + "\n"
			);
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			5,
			finalSortedAutoReactArray,
			"Autoreact",
			this.translate("administration/autoreact:list:empty"),
			"channel"
		);
	}
}
