import { Request, Response } from "express";

import AuthController from "@dashboard/controllers/auth.controller";
import UserController from "@dashboard/controllers/user.controller";
import {client} from "@src/app";

export default {
    async get(req: Request, res: Response): Promise<void> {
        const access_token: string | null = AuthController.getAccessToken(req);

        /* if user is not logged in, redirect to website privacy */
        const isLoggedIn: boolean|string = await AuthController.isLoggedIn(req, res);
        if (!isLoggedIn) {
            return AuthController.renderLogin(res);
        }else if(isLoggedIn === "refreshed_token"){
            return res.redirect("back");
        }

        /* get user info */
        const user: any = await UserController.getUser(access_token);

        /* render page */
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
