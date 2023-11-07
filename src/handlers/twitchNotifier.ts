import { EmbedBuilder, Guild } from "discord.js";
import BaseClient from "@structures/BaseClient";
import { AppTokenAuthProvider } from "@twurple/auth";
import { ApiClient, HelixUser, HelixStream } from "@twurple/api";

async function getStream(apiClient: any, userId: string): Promise<object | null> {
	const user: HelixUser | null = await apiClient.users.getUserById(userId);
	if (user) {
		const stream: HelixStream | null = await user.getStream();
		return stream;
	}
	return null;
}

export default {
	init(client: BaseClient): void {
		const authProvider: AppTokenAuthProvider = new AppTokenAuthProvider(
			client.config.apikeys["TWITCH_CLIENT_ID"],
			client.config.apikeys["TWITCH_CLIENT_SECRET"]
		);
		const apiClient: ApiClient = new ApiClient({ authProvider });

		const checkGuilds = async (): Promise<void> => {
			await Promise.all(
				client.guilds.cache.map(async (guild: Guild): Promise<void> => {
					const guildData: any = await client.findOrCreateGuild(guild.id);
					if (guildData.settings?.notifiers?.twitch?.enabled) {
						for (let channel of guildData.settings.notifiers.twitch.channels) {
							const stream: any = await getStream(apiClient, channel.id);
							if (stream && channel.lastStreamId !== stream.id) {
								guildData.settings.notifiers.twitch.channels.find(
									(c: any): boolean => c.id === channel.id
								).lastStreamId = stream.id;
								guildData.markModified("settings.notifiers.twitch.channels");
								await guildData.save();
								const announcementChannel: any = guild.channels.cache.get(
									guildData.settings.notifiers.twitch.announcementChannel
								);
								if (announcementChannel) {
									const announcementEmbed: EmbedBuilder = client.createEmbed(
										"### {0} [{1}]({2})",
										null,
										"normal",
										client.emotes.link,
										stream.title,
										"https://twitch.tv/" + stream.userName
									);
									announcementEmbed.setTitle(
										client.emotes.arrow +
											" " +
											stream.userName +
											" streamt gerade auf Twitch!"
									);
									announcementEmbed.setImage(stream.getThumbnailUrl(1280, 720));
									announcementChannel.send({
										embeds: [announcementEmbed]
									});
								}
							}
						}
					}
				})
			);
		};

		setInterval(checkGuilds, 60 * 1000);
	}
};
