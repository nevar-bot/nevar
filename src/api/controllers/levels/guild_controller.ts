import { Request, Response } from "express";
import { client } from "@src/app";

export async function get(req: Request, res: Response) {
	const { app } = req;

	const guildId: string = req.params.guildID;
	let amount: number = Number(req.params.amount) || 10;

	if (!guildId || !amount || typeof guildId !== "string" || typeof amount !== "number") {
		return res.sendStatus(400);
	}

	const guild: any = client.guilds.cache.get(guildId);
	if (!guild) {
		return res.sendStatus(404);
	}

	if(req.params.amount === "all") amount = guild.memberCount;

	const rawLeaderboard: any = await client.levels.fetchLeaderboard(guildId, amount);
	if (!rawLeaderboard) {
		return res.sendStatus(404);
	}

	const jsonLeaderboard: any[] = [];

	for (const entry of rawLeaderboard) {
		const levelUser: any = await client.levels.fetch(entry.userID, entry.guildID, true);
		if (!client.users.cache.get(entry.userID)) {
			await client.users.fetch(entry.userID).catch(() => {});
		}

		jsonLeaderboard.push({
			user: {
				id: entry.userID,
				username: client.users.cache.get(entry.userID)?.username || "Unbekannt",
				displayName: client.users.cache.get(entry.userID)?.displayName || "Unbekannt",
				avatar: client.users.cache.get(entry.userID)?.displayAvatarURL({ size: 2048 })
			},
			level: entry.level,
			totalXp: entry.xp,
			totalNeededXp: client.levels.xpFor(entry.level + 1),
			cleanXp: levelUser.cleanXp,
			cleanNextLevelXp: levelUser.cleanNextLevelXp,
			position: levelUser.position
		});
	}

	const json: any = {
		status_code: 200,
		status_message: null,
		res: {
			guild: {
				id: guildId,
				name: guild.name,
				icon: guild.iconURL({ size: 2048 }),
			},
			leaderboard: jsonLeaderboard,
		},
	};

	res.setHeader("Content-Type", "application/json");
	return res.end(JSON.stringify(json, null, 4));
}
