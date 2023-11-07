import { Request, Response } from "express";
import { client } from "@src/app";

import AuthController from "@dashboard/controllers/auth.controller";
import UserController from "@dashboard/controllers/user.controller";
import ErrorController from "@dashboard/controllers/error.controller";

export default {
	async get(req: Request, res: Response): Promise<void> {
		const access_token: string | null = AuthController.getAccessToken(req);

		/* get guild id */
		const guildId: string = req.params.guildId;

		/* check if user is logged in */
		if (!(await AuthController.isLoggedIn(req, res))) {
			return AuthController.renderLogin(res);
		}

		/* get user info */
		const user: any = await UserController.getUser(access_token);

		/* bot is not in guild */
		if (!client.guilds.cache.get(guildId)) {
			return ErrorController.render404(res, user);
		}

		/* user is not authorized to view this guild */
		const guilds: any = await UserController.getGuilds(access_token);
		if (
			!(await AuthController.isAuthorizedInGuild(
				guilds.find((guild: any): boolean => guild.id === guildId)
			))
		) {
			return ErrorController.render401(res, user);
		}

		/* check if data was saved */
		const dataSaved: boolean = !!(req as any).session.saved;
		delete (req as any).session.saved;

		/* render page */
		res.render("guild/levelsystem/general", {
			client: client,
			title: "Levelsystem",
			module: "levelsystem_main",
			guild: client.guilds.cache.get(guildId),
			guildData: await client.findOrCreateGuild(guildId),
			user: user,
			avatarUrl: UserController.getAvatarURL(user),

			/* extra data */
			saved: dataSaved
		});
	},

	async post(req: Request, res: Response): Promise<void> {
		/* get access token */
		const access_token: string | null = AuthController.getAccessToken(req);

		/* get guild id */
		const guildId: string = req.params.guildId;

		/* check if user is logged in */
		if (!(await AuthController.isLoggedIn(req, res))) {
			return AuthController.renderLogin(res);
		}

		/* get user info */
		const user: any = await UserController.getUser(access_token);

		/* user is not authorized to view this guild */
		const guilds: any = await UserController.getGuilds(access_token);
		if (
			!(await AuthController.isAuthorizedInGuild(
				guilds.find((guild: any): boolean => guild.id === guildId)
			))
		) {
			return ErrorController.render401(res, user);
		}

		/* get guild data */
		const guildData: any = await client.findOrCreateGuild(guildId);

		/* update guild data */
		guildData.settings.levels.enabled = !!req.body.status;
		guildData.settings.levels.channel =
			req.body.channel !== "current" ? req.body.channel : null;
		guildData.settings.levels.message = req.body.message;
		guildData.settings.levels.xp = {
			min: parseInt(req.body.minxp),
			max: parseInt(req.body.maxxp)
		};

		/* save guild data */
		guildData.markModified("settings.levels");
		await guildData.save();

		(req as any).session.saved = true;

		/* avoid rate limits */
		await client.wait(500);

		/* redirect */
		res.status(200).redirect("/dashboard/" + req.params.guildId + "/levelsystem/general");
	}
};
