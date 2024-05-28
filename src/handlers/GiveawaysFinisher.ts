import { NevarClient } from "@core/NevarClient";

export class GiveawaysFinisher {
	private client: NevarClient;
	public constructor(client: NevarClient) {
		this.client = client;
		setInterval((): void => {
			this.finishGiveaways().catch((): void => {});
		}, 10 * 1000);
	}

	private async finishGiveaways(): Promise<void> {
		const giveaways: any[] = await this.client.giveawayManager.getGiveaways();
		for (const giveaway of giveaways) {
			if (giveaway.ended) continue;
			if (giveaway.endAt > Date.now()) continue;

			const guild: any = this.client.guilds.cache.get(giveaway.guildId);
			if (!guild) continue;
			const channel: any = guild.channels.cache.get(giveaway.channelId);
			if (!channel) continue;

			const message: any = await channel.messages.fetch(giveaway.messageId).catch((): any => null);
			if (!message) {
				await this.client.giveawayManager.deleteGiveaway(giveaway.messageId);
				continue;
			}

			await this.client.giveawayManager.endGiveaway(message.id);
		}
	}
}
