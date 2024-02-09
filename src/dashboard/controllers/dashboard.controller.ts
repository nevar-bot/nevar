import { Request, Response } from "express";
import { client } from "@src/app.js";

import AuthController from "@dashboard/controllers/auth.controller.js";
import UserController from "@dashboard/controllers/user.controller.js";

export default {
	async get(req: Request, res: Response): Promise<void> {
		const isLoggedIn: boolean | string = await AuthController.isLoggedIn(req, res);
		if (!isLoggedIn) {
			return AuthController.renderLogin(res);
		} else if (isLoggedIn === "refreshed_token") {
			return res.redirect("back");
		}

		/* get access token */
		const access_token: string | null = AuthController.getAccessToken(req);

		/* get user and user guilds */
		const [user, userGuilds] = await Promise.all([
			UserController.getUser(access_token),
			UserController.getGuilds(access_token),
		]);

		/* differentiates between guilds where bot is in where bot isn't in */
		const botIsIn: any[] = [];
		const botIsNotIn: any[] = [];

		for (const guild of userGuilds) {
			/* check if user is authorized in guild */
			if (await AuthController.isAuthorizedInGuild(guild)) {
				client.guilds.cache.get(guild.id) ? botIsIn.push(guild) : botIsNotIn.push(guild);
			}
		}

		/* render page */
		res.render("guilds", {
			client: client,
			title: "Server wählen",
			module: "overview",
			guild: null,
			guildData: null,
			user: user,
			avatarUrl: UserController.getAvatarURL(user),

			/* extra data */
			guilds: botIsIn,
			notInvitedGuilds: botIsNotIn,
			inviteUrl: client.createInvite(),
		});
	},
};
