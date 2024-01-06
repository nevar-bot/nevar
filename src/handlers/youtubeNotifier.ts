import { EmbedBuilder, Guild } from "discord.js";
import BaseClient from "@structures/BaseClient";
import { google } from "googleapis";

async function getLastVideo(youtubeInstance: any, channelId: string): Promise<object | null> {
	const response: any = await youtubeInstance.search.list({
		part: "snippet",
		channelId: channelId,
		order: "date",
		maxResults: 1,
	});

	if (response?.data?.items?.[0]) {
		return {
			id: response.data.items[0].id.videoId,
			title: response.data.items[0].snippet.title,
			url: `https://www.youtube.com/watch?v=${response.data.items[0].id.videoId}`,
			username: response.data.items[0].snippet.channelTitle,
			thumbnail: response.data.items[0].snippet.thumbnails.high.url,
		};
	} else {
		return null;
	}
}
export default {
	init(client: BaseClient): void {
		const youtube: any = google.youtube({
			version: "v3",
			auth: client.config.apikeys["GOOGLE"],
		});

		const checkGuilds = async (): Promise<void> => {
			await Promise.all(
				client.guilds.cache.map(async (guild: Guild): Promise<void> => {
					const guildData: any = await client.findOrCreateGuild(guild.id);
					if (guildData.settings?.notifiers?.youtube?.enabled) {
						for (const channel of guildData.settings.notifiers.youtube.channels) {
							const lastVideo: any = await getLastVideo(youtube, channel.id);
							if (lastVideo && channel.lastVideoId !== lastVideo.id) {
								guildData.settings.notifiers.youtube.channels.find(
									(c: any): boolean => c.id === channel.id,
								).lastVideoId = lastVideo.id;
								guildData.markModified("settings.notifiers.youtube.channels");
								await guildData.save();
								const announcementChannel: any = guild.channels.cache.get(
									guildData.settings.notifiers.youtube.announcementChannel,
								);
								if (announcementChannel) {
									const announcementEmbed: EmbedBuilder = client.createEmbed(
										"### {0} [{1}]({2})",
										null,
										"normal",
										client.emotes.link,
										lastVideo.title,
										lastVideo.url,
									);
									announcementEmbed.setTitle(
										client.emotes.arrow +
											" " +
											lastVideo.username +
											" hat ein neues Video hochgeladen!",
									);
									announcementEmbed.setImage(lastVideo.thumbnail);
									announcementChannel.send({
										embeds: [announcementEmbed],
									});
								}
							}
						}
					}
				}),
			);
		};

		setInterval(checkGuilds, 5 * 60 * 1000);
	},
};
