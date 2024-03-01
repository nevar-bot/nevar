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
            return AuthController.renderLogin(res);
        }

        /* Get user data */
        const user: any = await UserController.getUser(access_token);

        /* Check if data was saved */
        const dataSaved: boolean = !!req.session.saved;
        const saveFailure: boolean = !!req.session.saveFailure;
        delete req.session.saved;
        delete req.session.saveFailure;

        /* render page */
        res.render("feedback", {
            client: client,
            title: "Feedback",
            module: "feedback",
            guild: null,
            guildData: null,
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

        /* Check if request is logged in */
        const isLoggedIn: boolean | string = await AuthController.isLoggedIn(req, res);
        if (!isLoggedIn) {
            return AuthController.renderLogin(res);
        }

        /* Get user data */
        const user: any = await UserController.getUser(access_token);

        /* Submit feedback */
        try{
            /**
             * TODO
             * Feedback an Supportserver senden
             */

            (req as any).session.saved = true;
        }catch(error){
            (req as any).session.saveFailure = true;
        }

        /* Avoid rate limits */
        await client.wait(500);

        /* Redirect */
        res.status(200).redirect("/feedback");
    }
};