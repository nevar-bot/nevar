import { Request, Response } from "express";

import AuthController from "@dashboard/controllers/auth.controller";
import UserController from "@dashboard/controllers/user.controller";
import {client} from "@src/app";

export default {
    async get(req: Request, res: Response): Promise<void> {
        const access_token: string | null = AuthController.getAccessToken(req);

        /* if user is not logged in, redirect to website imprint */
        if (!(await AuthController.isLoggedIn(req))) {
            return res.status(302).redirect("https://nevar.eu/imprint");
        }

        /* get user info */
        const user: any = await UserController.getUser(access_token);

        /* render page */
        res.render("imprint", {
            client: client,
            title: "Impressum",
            module: "further_imprint",
            guild: null,
            guildData: null,
            user: user,
            avatarUrl: UserController.getAvatarURL(user),
        });
    },
};