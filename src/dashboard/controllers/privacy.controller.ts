import { Request, Response } from "express";

import AuthController from "@dashboard/controllers/auth.controller.js";
import UserController from "@dashboard/controllers/user.controller.js";
import { client } from "@src/app.js";

export default {
	/* Handle get request */
	async get(req: Request, res: Response): Promise<void> {
		/* Get access token */
		const access_token: string | null = AuthController.getAccessToken(req);

		/* Check if request is logged in */
		const isLoggedIn: boolean | string = await AuthController.isLoggedIn(req, res);
		if (!isLoggedIn) {
			return res.redirect("https://nevar.eu/privacy");
		}

		/* Get user data */
		const user: any = await UserController.getUser(access_token);

		/* Render page */
		res.render("privacy", {
			client: client,
			title: "Datenschutzerklärung",
			module: "further_privacy",
			guild: null,
			guildData: null,
			user: user,
			avatarUrl: UserController.getAvatarURL(user),
		});
	},
};
