import { Request, Response } from "express";
import { client } from "@src/app";
import mongoose from "mongoose";

import AuthController from "@dashboard/controllers/AuthController";
import UserController from "@dashboard/controllers/UserController";
import ErrorController from "@dashboard/controllers/ErrorController";

export default {
	async get(req: Request, res: Response): Promise<void> {
		/* get access token */
		const access_token: string | null = AuthController.getAccessToken(req);

		/* get guild id */
		const guildId: string = req.params.guildId;
		console.log(guildId);
		console.log(req.params);

		/* check if user is logged in */
		if (!(await AuthController.isLoggedIn(req))) {
			return AuthController.renderLogin(res);
		}

		/* get user */
		const user: any = await UserController.getUser(access_token);

		/* bot is not in guild */
		if (!client.guilds.cache.get(guildId)) {
			return ErrorController.render404(res, user);
		}

		/* user is not authorized to view this guild */
		const guilds: any = await UserController.getGuilds(access_token);
		if (!(await AuthController.isAuthorizedInGuild(guilds.find((guild: any): boolean => guild.id === guildId)))) {
			return ErrorController.render401(res, user);
		}

		/* get command data */
		const logsCollection: any = mongoose.connection.db.collection("logs");
		const executedCommandsCount: any = await logsCollection.countDocuments({ "guild.id": guildId });

		/* render page */
		res.render("guild/overview", {
			client: client,
			title: "Übersicht",
			module: "overview",
			guild: client.guilds.cache.get(guildId),
			guildData: await client.findOrCreateGuild(guildId),
			user: user,
			avatarUrl: UserController.getAvatarURL(user),

			/* extra data */
			executedCommandsCount: executedCommandsCount
		});
	}
};
