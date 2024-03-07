import BaseClient from "@structures/BaseClient.js";
import { EmbedBuilder } from "discord.js";

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(guild: any): Promise<any> {
		/* Check if guild is null */
		if (!guild || !guild.ownerId || !guild.id) return;

		/* Delete guild invites from invite cache */
		this.client.invites.delete(guild.id);

		/* Support log message */
		const supportGuild: any = this.client.guilds.cache.get(this.client.config.support["ID"]);
		if (!supportGuild) return;

		const supportLogChannel: any = supportGuild.channels.cache.get(this.client.config.support["BOT_LOG"]);
		if (!supportLogChannel) return;

		const owner: any = await this.client.users.fetch(guild.ownerId).catch((e: any): void => {});
		const createdAt: string = this.client.utils.getDiscordTimestamp(guild.createdTimestamp, "f");
		const createdDiff: string = this.client.utils.getDiscordTimestamp(guild.createdTimestamp, "R");

		const supportGuildLogMessage: string =
			" ### " + this.client.emotes.discord + " " + supportGuild.translate("events/guild/GuildDelete:kicked", { client: this.client.user!.username }) + "\n\n" +
			this.client.emotes.edit + " " + supportGuild.translate("basics:name") + ": ** " + guild.name + " **\n" +
			this.client.emotes.crown + " " + supportGuild.translate("events/guild/GuildDelete:owner") + ": ** " + owner.username + " **\n" +
			this.client.emotes.users + " " + supportGuild.translate("events/guild/GuildDelete:members") + ": ** " + guild.memberCount + " **\n" +
			this.client.emotes.calendar + " " + supportGuild.translate("events/guild/GuildDelete:createdAt") + ": ** " + createdAt + " **\n" +
			this.client.emotes.reminder + " " + supportGuild.translate("events/guild/GuildDelete:createdAgo") + ": ** " + createdDiff + " **";

		const supportGuildLogEmbed: EmbedBuilder = this.client.createEmbed(supportGuildLogMessage, null, "error");
		supportGuildLogEmbed.setThumbnail(guild.iconURL({ dynamic: true, size: 512 }));

		await supportLogChannel.send({ embeds: [supportGuildLogEmbed] }).catch((e: any): void => {});
	}
}
