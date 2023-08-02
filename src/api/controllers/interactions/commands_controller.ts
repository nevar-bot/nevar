import { Request, Response } from 'express';
import { client } from '@src/app';

export async function get(req: Request, res: Response) {
	const { app } = req;

	const commands: any[] = [];

	for (const command of client.commands.values()) {
		commands.push({
			name: command.help.name,
			description: command.help.description,
			category: command.help.category,
			cooldown: command.conf.cooldown / 1000,
			member_permissions: command.conf.memberPermissions,
			bot_permissions: command.conf.botPermissions,
			nsfw: command.conf.nsfw,
			staff_only: command.conf.staffOnly,
			owner_only: command.conf.ownerOnly
		});
	}

	const json: any = {
		status_code: 200,
		status_message: null,
		res: {
			command_count: commands.length,
			command_list: commands
		}
	};

	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(json, null, 4));
}
