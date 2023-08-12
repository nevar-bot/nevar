import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(reaction: any, user: any): Promise<void> {
		if (!user || !reaction || user.bot) return;

		const guildData: any = await this.client.findOrCreateGuild(reaction.message.guild.id);

		for (let reactionRole of guildData.settings.reactionroles) {
			const channelId: string = reactionRole.channelId;
			const messageId: string = reactionRole.messageId;
			const emojiId: string = reactionRole.emoteId;
			const roleId: string = reactionRole.roleId;

			let emoji: any = reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name;

			if (reaction.message.channel.id === channelId && reaction.message.id === messageId && emoji === emojiId) {
				const member: any = await reaction.message.guild.members.fetch(user.id).catch(() => {});
				if (!member) return;
				member.roles.remove(roleId, "REACTION ROLE").catch((e: any): void => {
					const errorText: string =
						this.client.emotes.ping +
						" Rolle: <@&" +
						roleId +
						">\n" +
						this.client.emotes.user +
						" Nutzer/-in: " +
						user.displayName +
						" (@" +
						user.username +
						")";

					const errorEmbed: EmbedBuilder = this.client.createEmbed(errorText, null, "error");
					errorEmbed.setTitle(this.client.emotes.error + " Entziehen von Reaction-Rolle fehlgeschlagen");

					reaction.guild.logAction(errorEmbed, "moderation");
				});
			}
		}
	}
}
