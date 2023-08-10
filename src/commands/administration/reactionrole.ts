import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";
import Utils from "@helpers/Utils";

export default class ReactionroleCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "reactionrole",
			description: "Erstellt eine neue Reaktions-Rolle",
			memberPermissions: ["ManageGuild"],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addChannelOption((option: any) =>
						option
							.setName("channel")
							.setDescription("Wähle, in welchem Channel du eine Reaktions-Rolle erstellen möchtest")
							.setRequired(true)
							.addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
					)
					.addStringOption((option: any) => option.setName("id").setDescription("Gib die ID der Nachricht ein").setRequired(true))
					.addRoleOption((option: any) =>
						option.setName("rolle").setDescription("Wähle die Rolle, die vergeben werden soll").setRequired(true)
					)
					.addStringOption((option: any) => option.setName("emoji").setDescription("Gib einen Emoji ein").setRequired(true))
			}
		});
	}

	private interaction: any;
	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		await this.addReactionRole(
			interaction.options.getChannel("channel"),
			interaction.options.getString("id"),
			interaction.options.getRole("rolle"),
			interaction.options.getString("emoji"),
			data
		);
	}

	private async addReactionRole(channel: any, id: string, role: any, emote: string, data: any): Promise<void> {
		/* Role is @everyone */
		if (role.id === this.interaction.guild.roles.everyone.id) {
			const everyoneEmbed: EmbedBuilder = this.client.createEmbed(
				"Die @everyone Rolle kann nicht als eine Reactionrole hinzugefügt werden.",
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [everyoneEmbed] });
		}

		/* Role is managed */
		if (role.managed) {
			const roleIsManagedEmbed: EmbedBuilder = this.client.createEmbed(
				"Rollen welche durch eine Integration verwaltet werden, können nicht als Reactionrole hinzugefügt werden.",
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [roleIsManagedEmbed] });
		}

		/* Role is too high */
		if (this.interaction.guild.members.me.roles.highest.position <= role.position) {
			const roleIsTooHighEmbed: EmbedBuilder = this.client.createEmbed(
				"Da {0} eine höhere oder gleiche Position wie meine höchste Rolle ({1}) hat, kann sie nicht als Reactionrole hinzugefügt werden.",
				"error",
				"error",
				role,
				this.interaction.guild.members.me.roles.highest
			);
			return this.interaction.followUp({ embeds: [roleIsTooHighEmbed] });
		}

		/* Invalid emoji */
		const { stringIsEmoji, stringIsCustomEmoji } = Utils;
		if (!stringIsEmoji(emote) && !stringIsCustomEmoji(emote)) {
			const invalidEmojiEmbed: EmbedBuilder = this.client.createEmbed("Du musst einen gültigen Emoji angeben.", "error", "error");
			return this.interaction.followUp({ embeds: [invalidEmojiEmbed] });
		}

		/* Get emoji id */
		const originEmote: string = emote;
		if (stringIsCustomEmoji(emote)) emote = emote.replace(/<a?:\w+:(\d+)>/g, "$1");
		/* Emoji is not available */
		if (stringIsCustomEmoji(originEmote) && !this.client.emojis.cache.find((e: any): boolean => e.id === emote)) {
			const unusableEmojiEmbed: EmbedBuilder = this.client.createEmbed(
				"Der Emoji muss auf einem Server wo ich bin verfügbar sein.",
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [unusableEmojiEmbed] });
		}

		/* Get message */
		const message: any = await channel.messages.fetch(id).catch(() => {});

		/* Message not found */
		if (!message) {
			const messageNotFoundEmbed: EmbedBuilder = this.client.createEmbed("Die Nachricht konnte nicht gefunden werden.", "error", "error");
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
			const reactionFailedEmbed: EmbedBuilder = this.client.createEmbed("Ich konnte nicht auf die Nachricht reagieren.", "error", "error");
			return this.interaction.followUp({ embeds: [reactionFailedEmbed] });
		});

		const successEmbed: EmbedBuilder = this.client.createEmbed("Die Reactionrole wurde hinzugefügt.", "success", "success");
		return this.interaction.followUp({ embeds: [successEmbed] });
	}
}
