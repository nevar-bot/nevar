import { Request, Response } from "express";
import { client } from "@src/app";
import fs from "fs";
import moment from "moment";

export async function get(req: Request, res: Response) {
	const { app } = req;

	const json: any = {
		status_code: 200,
		status_message: null,
		res: {
			server_count: client.guilds.cache.size,
			shard_count: client.shard ? client.shard.count : 1,
			user_count: client.guilds.cache.reduce(
				(sum: number, guild: any): number =>
					sum + (guild.available ? guild.memberCount : 0),
				0
			),
			channel_count: client.channels.cache.size,
			command_count: client.commands.size,
			vote_count:
				JSON.parse(fs.readFileSync("./assets/votes.json").toString())[
					moment().format("MMMM").toLowerCase()
				] || 0,
			support_url: client.config.support["INVITE"],
			invite_url: client.createInvite()
		}
	};
	res.setHeader("Content-Type", "application/json");
	return res.end(JSON.stringify(json, null, 4));
}
