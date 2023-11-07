import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";
import Utils from "@helpers/Utils";

export default class ReactionroleCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "reactionrole",
			description: "Creates a new reaction role",
			localizedDescriptions: {
				de: "Erstellt eine neue Reaktions-Rolle"
			},
			memberPermissions: ["ManageGuild"],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addChannelOption((option: any) =>
						option
							.setName("channel")
							.setDescription(
								"Choose in which channel you want to create a reaction role"
							)
							.setDescriptionLocalizations({
								de: "Wähle, in welchem Channel du eine Reaktions-Rolle erstellen möchtest"
							})
							.setRequired(true)
							.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
					)
					.addStringOption((option: any) =>
						option
							.setName("id")
							.setDescription("Enter the ID of the message")
							.setDescriptionLocalizations({
								de: "Gib die ID der Nachricht ein"
							})
							.setRequired(true)
					)
					.addRoleOption((option: any) =>
						option
							.setName("role")
							.setNameLocalizations({
								de: "rollen"
							})
							.setDescription("Select the role to be assigned")
							.setDescriptionLocalizations({
								de: "Wähle die Rolle, die vergeben werden soll"
							})
							.setRequired(true)
					)
					.addStringOption((option: any) =>
						option
							.setName("emoji")
							.setDescription("Enter an emoji")
							.setDescriptionLocalizations({
								de: "Gib einen Emoji ein"
							})
							.setRequired(true)
					)
			}
		});
	}
	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;

		await this.addReactionRole(
			interaction.options.getChannel("channel"),
			interaction.options.getString("id"),
			interaction.options.getRole("role"),
			interaction.options.getString("emoji"),
			data
		);
	}

	private async addReactionRole(
		channel: any,
		id: string,
		role: any,
		emote: string,
		data: any
	): Promise<void> {
		/* Role is @everyone */
		if (role.id === this.interaction.guild.roles.everyone.id) {
			const everyoneEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:cantUseEveryone"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [everyoneEmbed] });
		}

		/* Role is managed */
		if (role.managed) {
			const roleIsManagedEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:cantUseManaged"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [roleIsManagedEmbed] });
		}

		/* Role is too high */
		if (this.interaction.guild.members.me.roles.highest.position <= role.position) {
			const roleIsTooHighEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:cantUseHigherRole", {
					role: role.toString(),
					botrole: this.interaction.guild.members.me.roles.highest.toString()
				}),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [roleIsTooHighEmbed] });
		}

		/* Invalid emoji */
		const { stringIsEmoji, stringIsCustomEmoji } = Utils;
		if (!stringIsEmoji(emote) && !stringIsCustomEmoji(emote)) {
			const invalidEmojiEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:invalidEmoji"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [invalidEmojiEmbed] });
		}

		/* Get emoji id */
		const originEmote: string = emote;
		if (stringIsCustomEmoji(emote)) emote = emote.replace(/<a?:\w+:(\d+)>/g, "$1");
		/* Emoji is not available */
		if (
			stringIsCustomEmoji(originEmote) &&
			!this.client.emojis.cache.find((e: any): boolean => e.id === emote)
		) {
			const unusableEmojiEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:unusableEmoji"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [unusableEmojiEmbed] });
		}

		/* Get message */
		const message: any = await channel.messages.fetch(id).catch(() => {});

		/* Message not found */
		if (!message) {
			const messageNotFoundEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:messageNotFound"),
				"error",
				"error"
			);
			return this.interaction.followUp({
				embeds: [messageNotFoundEmbed]
			});
		}

		/* Save to database */
		let emoteId: string;
		stringIsCustomEmoji(originEmote) ? (emoteId = emote) : (emoteId = originEmote);

		const reactionRole = {
			channelId: channel.id,
			messageId: id,
			emoteId: emoteId,
			roleId: role.id
		};
		data.guild.settings.reactionroles.push(reactionRole);
		data.guild.markModified("settings.reactionroles");
		await data.guild.save();

		await message.react(emote).catch(() => {
			const reactionFailedEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:cantReactToMessage"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [reactionFailedEmbed] });
		});

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("added"),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}
}
