import { Request, Response } from "express";
import { client } from "@src/app";

export async function get(req: Request, res: Response) {
	const { app } = req;

	const contexts: any[] = [];

	for (const context of client.contextMenus.values()) {
		contexts.push({
			name: context.help.name,
			type: context.help.type,
			cooldown: context.conf.cooldown / 1000,
			member_permissions: context.conf.memberPermissions
		});
	}

	const json: any = {
		status_code: 200,
		status_message: null,
		res: {
			context_count: contexts.length,
			context_list: contexts
		}
	};

	res.setHeader("Content-Type", "application/json");
	res.end(JSON.stringify(json, null, 4));
}
