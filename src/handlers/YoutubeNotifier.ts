import {EmbedBuilder, Guild, GuildBasedChannel} from "discord.js";
import { NevarClient } from "@core/NevarClient";
import { google } from "googleapis";


export class YoutubeNotifier {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
		setInterval((): void => {
			this.notifyGuilds();
		}, 5 * 60 * 1000);
	}

	private async getLastVideo(youtubeInstance: any, channelId: string): Promise<object|undefined> {
		const response: any = await youtubeInstance.search.list({
			part: "snippet",
			channelId,
			order: "date",
			maxResults: 1,
		});

		const videoItem = response?.data?.items?.[0];

		if (videoItem) {
			const { id, snippet } = videoItem;
			const { videoId } = id;
			const { title, channelTitle, thumbnails } = snippet;

			return {
				id: videoId,
				title,
				url: `https://www.youtube.com/watch?v=${videoId}`,
				username: channelTitle,
				thumbnail: thumbnails?.high?.url,
			};
		}
	}

	private async notifyGuilds(): Promise<void> {
		const youtube: any = google.youtube({
			version: "v3",
			auth: this.client.config.apikeys["GOOGLE"],
		});

		await Promise.all(
			this.client.guilds.cache.map(async (guild: Guild): Promise<void> => {
				const guildData: any = await this.client.findOrCreateGuild(guild.id);
				const youtubeSettings: any = guildData.settings?.notifiers?.youtube;

				if (youtubeSettings?.enabled) {
					for (const channel of youtubeSettings.channels) {
						const lastVideo: any = await this.getLastVideo(youtube, channel.id);

						if (lastVideo && channel.lastVideoId !== lastVideo.id) {
							const foundChannel = guildData.settings.notifiers.youtube.channels.find((c: any) => c.id === channel.id);
							foundChannel.lastVideoId = lastVideo.id;
							guildData.markModified("settings.notifiers.youtube.channels");
							await guildData.save();

							const announcementChannel: any = guild.channels.cache.get(youtubeSettings.announcementChannel);
							if (announcementChannel) {
								const announcementEmbed: EmbedBuilder = this.client.createEmbed(
									"### {0} [{1}]({2})",
									null,
									"normal",
									this.client.emotes.link,
									lastVideo.title,
									lastVideo.url
								);
								announcementEmbed.setTitle(`${this.client.emotes.arrow} ${guild.translate("handlers/youtubeNotifier:userUploadedNewVideo", { user: lastVideo.username })}`);
								announcementEmbed.setImage(lastVideo.thumbnail);
								announcementChannel.send({ embeds: [announcementEmbed] });
							}
						}
					}
				}
			})
		);
	}
}
