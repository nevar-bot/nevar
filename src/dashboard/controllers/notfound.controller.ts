import { Request, Response } from "express";

import AuthController from "@dashboard/controllers/auth.controller.js";
import UserController from "@dashboard/controllers/user.controller.js";
import ErrorController from "@dashboard/controllers/error.controller.js";

export default {
	async get(req: Request, res: Response): Promise<void> {
		const access_token: string | null = AuthController.getAccessToken(req);

		/* check if user is logged in */
		const isLoggedIn: boolean | string = await AuthController.isLoggedIn(req, res);
		if (!isLoggedIn) {
			return AuthController.renderLogin(res);
		} else if (isLoggedIn === "refreshed_token") {
			return res.redirect("back");
		}

		/* get user info */
		const user: any = await UserController.getUser(access_token);

		return ErrorController.render404(res, user);
	},
};
