import { EmbedBuilder, Guild } from "discord.js";
import { NevarClient } from "@core/NevarClient";
import { AppTokenAuthProvider } from "@twurple/auth";
import { ApiClient, HelixUser, HelixStream } from "@twurple/api";

export class TwitchNotifier {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
		setInterval((): void => {
			this.notifyGuilds();
		}, 5 * 60 * 1000);
	}

	private async getStream(apiClient: ApiClient, userId: string): Promise<object |null> {
		const user: HelixUser | null = await apiClient.users.getUserById(userId);
		if (user) {
			const stream: HelixStream | null = await user.getStream();
			return stream;
		}
		return null;
	}

	private async notifyGuilds(): Promise<void> {
		const authProvider: AppTokenAuthProvider = new AppTokenAuthProvider(
			this.client.config.apikeys["TWITCH_CLIENT_ID"],
			this.client.config.apikeys["TWITCH_CLIENT_SECRET"]
		);
		const apiClient: ApiClient = new ApiClient({ authProvider });

		await Promise.all(
			this.client.guilds.cache.map(async (guild: Guild): Promise<void> => {
				const guildData = await this.client.findOrCreateGuild(guild.id);
				const twitchSettings = guildData.settings?.notifiers?.twitch;
				if (twitchSettings?.enabled) {
					for (const channel of twitchSettings.channels) {
						const stream: any = await this.getStream(apiClient, channel.id);
						if (stream && channel.lastStreamId !== stream.id) {
							const foundChannel = guildData.settings.notifiers.twitch.channels.find((c: any): boolean => c.id === channel.id);
							foundChannel.lastStreamId = stream.id;
							guildData.markModified("settings.notifiers.twitch.channels");
							await guildData.save();
							const announcementChannel: any = guild.channels.cache.get(twitchSettings.announcementChannel);
							if (announcementChannel) {
								const announcementEmbed: EmbedBuilder = this.client.createEmbed(
									"### {0} [{1}]({2})",
									null,
									"normal",
									this.client.emotes.link,
									stream.title,
									"https://twitch.tv/" + stream.userName
								);
								announcementEmbed.setTitle(this.client.emotes.arrow + " " + guild.translate("handlers/twitchNotifier:userIsNowStreamingTitle", { user: stream.userName }));
								announcementEmbed.setImage(stream.getThumbnailUrl(1280, 720));
								announcementChannel.send({ embeds: [announcementEmbed] });
							}
						}
					}
				}
			})
		);
	}
}