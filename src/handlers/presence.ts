import
{
	ActivityType,
	Guild
} from "discord.js";

function updatePresence(client: any): void
{
	const presences: any = client.config.presence;
	let presenceIndicator: number = 0;

	function update(): void
	{
		if (presenceIndicator === presences.length) presenceIndicator = 0;
		const presence = presences[presenceIndicator];

		const message: string = presence["MESSAGE"]
			.replaceAll("{guilds}", client.format(client.guilds.cache.size))
			.replaceAll("{users}", client.format(client.guilds.cache.map((g: Guild): number => g.memberCount).reduce((partial_sum: any, a: any) => partial_sum + a, 0)));

		client.user.setPresence({
			status: presence["STATUS"],
			activities: [
				{
					name: message,
					type: ActivityType[presence["TYPE"]],
					url: presence["URL"] ? presence["URL"] : null
				}
			]
		});
		presenceIndicator++;
	}

	update();

	setInterval(() =>
	{
		update();
	}, 30 * 1000);
}

export default function handlePresence(client: any): void
{
	updatePresence(client);
}