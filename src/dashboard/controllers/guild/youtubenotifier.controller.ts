import { Request, Response } from "express";
import { client } from "@src/app.js";

import AuthController from "@dashboard/controllers/auth.controller.js";
import UserController from "@dashboard/controllers/user.controller.js";
import ErrorController from "@dashboard/controllers/error.controller.js";

export default {
	/* Handle get request */
	async get(req: Request, res: Response): Promise<void> {
		/* Get access token */
		const access_token: string | null = AuthController.getAccessToken(req);

		/* Get guild id */
		const guildId: string = req.params.guildId;

		/* Check if request is logged in */
		const isLoggedIn: boolean | string = await AuthController.isLoggedIn(req, res);
		if (!isLoggedIn) {
			return AuthController.renderLogin(res);
		}

		/* Get user data */
		const user: any = await UserController.getUser(access_token);

		/* Bot is not in requested guild */
		if (!client.guilds.cache.get(guildId)) {
			return ErrorController.render404(res, user);
		}

		/* User is not authorized to manage requested guild */
		const guilds: any = await UserController.getGuilds(access_token);
		if (!(await AuthController.isAuthorizedInGuild(guilds.find((guild: any): boolean => guild.id === guildId)))) {
			return ErrorController.render401(res, user);
		}

		/* Check if data was saved */
		const dataSaved: boolean = !!req.session.saved;
		const saveFailure: boolean = !!req.session.saveFailure;
		delete req.session.saved;
		delete req.session.saveFailure;

		/* Render page */
		res.render("guild/youtubenotifier", {
			client: client,
			title: "YouTube Benachrichtigungen",
			module: "youtubenotifier",
			guild: client.guilds.cache.get(guildId),
			guildData: await client.findOrCreateGuild(guildId),
			user: user,
			avatarUrl: UserController.getAvatarURL(user),

			/* extra data */
			saved: dataSaved,
			saveFailure: saveFailure
		});
	},

	/* Handle post request */
	async post(req: Request, res: Response): Promise<void> {
		/* Get access token */
		const access_token: string | null = AuthController.getAccessToken(req);

		/* Get guild id */
		const guildId: string = req.params.guildId;

		/* Check if request is logged in */
		const isLoggedIn: boolean | string = await AuthController.isLoggedIn(req, res);
		if (!isLoggedIn) {
			return AuthController.renderLogin(res);
		}

		/* Get user data */
		const user: any = await UserController.getUser(access_token);

		/* User is not authorized to manage requested guild */
		const guilds: any = await UserController.getGuilds(access_token);
		if (!(await AuthController.isAuthorizedInGuild(guilds.find((guild: any): boolean => guild.id === guildId)))) {
			return ErrorController.render401(res, user);
		}

		/* Get guild data */
		const guildData: any = await client.findOrCreateGuild(guildId);

		/* Update guild data */
		try{
			/**
			 * TODO
			 * Youtubenotifier durchgehen, und wenn nötig updaten
			 */

			/* Save modified guild data */
			guildData.markModified("settings.notifiers.youtube");
			await guildData.save();

			/* Set session data */
			req.session.saved = true;
		}catch(error: any){
			req.session.saveFailure = true;
		}

		/* Avoid rate limits */
		await client.wait(500);

		/* Redirect */
		res.status(200).redirect("/dashboard/" + req.params.guildId + "/youtubenotifer");
	},
};
