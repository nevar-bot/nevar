import { Request, Response } from 'express';
import { client } from '@src/app';

export async function get(req: Request, res: Response)
{
	const { app } = req;

	const guildId: string = req.params.guildID;
	const userId: string = req.params.memberID;

	if (!guildId || typeof guildId !== 'string') {
		return res.sendStatus(400);
	}
	if (!userId || typeof userId !== 'string') {
		return res.sendStatus(400);
	}

	const guild: any = client.guilds.cache.get(guildId);
	if (!guild) {
		return res.sendStatus(404);
	}

	if (!guild.members.cache.get(userId)) {
		await guild.members.fetch(userId).catch((): void => { });
	}
	const member: any = guild.members.cache.get(userId);
	if (!member) {
		return res.sendStatus(404);
	}

	const levelUser: any = await client.levels.fetch(userId, guildId, true);
	if (!levelUser) {
		return res.sendStatus(404);
	}

	const jsonUser: any = {
		status_code: 200,
		status_message: null,
		res: {
			level: levelUser.level,
			xp: levelUser.xp,
			neededXp: client.levels.xpFor(levelUser.level + 1),
			position: levelUser.position,
			tag: member.user.tag,
			userID: userId,
			guildID: guildId,
			avatar: member.user?.displayAvatarURL({ size: 2048 }) || 'https://brandlogos.net/wp-content/uploads/2021/11/discord-logo.png'
		}
	};

	res.setHeader('Content-Type', 'application/json');
	return res.end(JSON.stringify(jsonUser, null, 4));
}