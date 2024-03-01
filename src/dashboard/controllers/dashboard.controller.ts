import { Request, Response } from "express";
import { client } from "@src/app.js";

import AuthController from "@dashboard/controllers/auth.controller.js";
import UserController from "@dashboard/controllers/user.controller.js";

export default {
	/* Handle get request */
	async get(req: Request, res: Response): Promise<void> {
		/* Get access token */
		const access_token: string | null = AuthController.getAccessToken(req);

		/* Check if request is logged in */
		const isLoggedIn: boolean | string = await AuthController.isLoggedIn(req, res);
		if (!isLoggedIn) {
			return AuthController.renderLogin(res);
		}

		/* Get user data and user guilds */
		const [user, userGuilds] = await Promise.all([
			UserController.getUser(access_token),
			UserController.getGuilds(access_token),
		]);

		/* Sort guilds with bot in and bot not in */
		const botIsIn: any[] = [];
		const botIsNotIn: any[] = [];

		for (const guild of userGuilds) {
			/* Check if user is authorized to manage guild */
			if (await AuthController.isAuthorizedInGuild(guild)) {
				client.guilds.cache.get(guild.id) ? botIsIn.push(guild) : botIsNotIn.push(guild);
			}
		}

		/* Render page */
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
