// @ts-ignore
import { scheduleJob } from "node-schedule";
import { Collection, Guild, Invite } from "discord.js";

import { InteractionManager } from "@handlers/InteractionManager.js";
import { TopggManager } from "@helpers/TopggManager.js";
import { PresenceManager } from "@handlers/PresenceManager.js";
import { ReminderFinisher } from "@handlers/ReminderFinisher.js";
import { TwitchNotifier } from "@handlers/TwitchNotifier.js";
import { YoutubeNotifier } from "@handlers/YoutubeNotifier.js";
import { UnbanManager } from "@handlers/UnbanManager.js";
import { PollUpdater } from "@handlers/PollUpdater.js";
import { GiveawaysFinisher } from "@handlers/GiveawaysFinisher.js";
import { NevarClient } from "@core/NevarClient";
import { Dashboard } from "@dashboard/app.js";
import { API } from "@api/app.js";

export default class {
	public client: NevarClient;
	public constructor(client: any) {
		this.client = client;
	}

	public async dispatch(): Promise<any> {
		const client: any = this.client;
		const config = client.config;

		/* Initialize levels */
		await this.client.levels.setURL(config.general["MONGO_CONNECTION"]);

		/* Update interactions every day at 00:00 */
		scheduleJob("0 0 * * *", async (): Promise<void> => {
			const iManager: InteractionManager = new InteractionManager(client);
			await iManager.register();
		});

		/* Initiate dashboard and API */
		if (config.dashboard["ENABLED"]) new Dashboard(client).init();
		if (config.api["ENABLED"]) new API(client).init();

		/* Initiate handlers */
		new TopggManager(client);
		new PresenceManager(client);
		new ReminderFinisher(client);
		new TwitchNotifier(client);
		new UnbanManager(client);
		new PollUpdater(client);
		new YoutubeNotifier(client);
		new GiveawaysFinisher(client);


		/* Cache invites */
		client.guilds.cache.forEach((guild: Guild): void => {
			guild.invites.fetch().then((invites: Collection<string, Invite>): void => {
				client.invites.set(
					guild.id,
					new Collection(invites.map((invite) => [invite.code, { uses: invite.uses, inviterId: invite.inviterId }])),
				);
			}).catch((): void => {});
		});

		client.logger.log("Loaded " + client.guilds.cache.size + " guilds");

		/* Register interactions, if bot is running on development mode */
		if (process.argv.slice(2)[0] === "--dev") {
			const iManager: InteractionManager = new InteractionManager(client);
			await iManager.register();
		}

		client.logger.success("Logged in as " + client.user.displayName);
	}
}