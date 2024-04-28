import { ActivityType } from "discord.js";
import { NevarClient } from "@core/NevarClient";

export class PresenceManager {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
		this.updatePresence();
	}

	private updatePresence(): void {
		const { client } = this;
		const presences: any[] = client.config.presence;
		let presenceIndex: number = 0;

		function setPresence(): void {
			const presence: any = presences[presenceIndex];
			const guildCount: number = client.guilds.cache.size;
			const memberCount: number = client.guilds.cache.reduce((total: any, guild: any) => total + guild.memberCount, 0);
			const message: string = presence["MESSAGE"]
				.replace("{guilds}", client.format(guildCount))
				.replace("{users}", client.format(memberCount));

			client.user!.setPresence({
				status: presence["STATUS"],
				activities: [
					{
						name: message,
						// @ts-ignore
						type: ActivityType[presence["TYPE"]],
						url: presence["URL"] ? presence["URL"] : null,
					},
				],
			});

			presenceIndex = (presenceIndex + 1) % presences.length;
		}

		setPresence();

		setInterval(setPresence, 30 * 1000);

	}
}