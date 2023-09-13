import { client } from "@src/app";
import { Response } from "express";

import UserController from "@dashboard/controllers/user.controller";

export default {
	render404(res: Response, user: any): void {
		/* render page */
		return res.status(404).render("error/404", {
			client: client,
			title: "Fehler 404",
			module: "error404",
			guild: null,
			guildData: null,
			user: user,
			avatarUrl: UserController.getAvatarURL(user)
		});
	},

	render401(res: Response, user: any): void {
		/* render page */
		return res.status(401).render("error/401", {
			client: client,
			title: "Fehler 401",
			module: "error401",
			guild: null,
			guildData: null,
			user: user,
			avatarUrl: UserController.getAvatarURL(user)
		});
	}
};
