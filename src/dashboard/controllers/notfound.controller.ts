import { Request, Response } from "express";

import AuthController from "@dashboard/controllers/auth.controller";
import UserController from "@dashboard/controllers/user.controller";
import ErrorController from "@dashboard/controllers/error.controller";

export default {
    async get(req: Request, res: Response): Promise<void> {
        const access_token: string | null = AuthController.getAccessToken(req);

        /* check if user is logged in */
        if (!(await AuthController.isLoggedIn(req))) {
            return AuthController.renderLogin(res);
        }

        /* get user info */
        const user: any = await UserController.getUser(access_token);

        return ErrorController.render404(res, user);
    },
};
