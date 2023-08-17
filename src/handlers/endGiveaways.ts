import BaseClient from "@structures/BaseClient";

async function processGiveaways(client: BaseClient): Promise<void> {
    const giveaways: any[] = await client.giveawayManager.getGiveaways();
    for (const giveaway of giveaways) {
        if (giveaway.ended) continue;
        if (giveaway.endAt > Date.now()) continue;

        const guild: any = client.guilds.cache.get(giveaway.guildId);
        if (!guild) continue;
        const channel: any = guild.channels.cache.get(giveaway.channelId);
        if (!channel) continue;

        const message: any = await channel.messages.fetch(giveaway.messageId).catch((): any => null);
        if (!message) {
            await client.giveawayManager.deleteGiveaway(giveaway.messageId);
            continue;
        }

        await client.giveawayManager.endGiveaway(message.id);
    }
}

export default {
    init(client: BaseClient): void {
        setInterval((): void => {
            processGiveaways(client).catch((e: any): void => {});
        }, 1000);
    }
}