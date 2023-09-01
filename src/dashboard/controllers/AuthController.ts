import { Request, Response } from "express";
import { client } from "@src/app";
import axios, { AxiosResponse } from "axios";

export default {
    async login(req: Request, res: Response): Promise<void>{
        const callback_url: string = encodeURI(client.config.dashboard["REDIRECT_URI"]);
        const redirect_url: string =
            "https://discord.com/api/oauth2/authorize?client_id=" + client.user!.id +
            "&redirect_uri=" + callback_url + "&response_type=code&scope=identify%20guilds";

        res.status(301).redirect(redirect_url);
    },

    async callback(req: Request, res: Response): Promise<void> {
        const code: string = req.query["code"] as string;

        const authResponse: AxiosResponse = await axios.post('https://discord.com/api/oauth2/token',
            new URLSearchParams({
                'client_id': client.user!.id,
                'client_secret': client.config.dashboard["CLIENT_SECRET"],
                'grant_type': 'authorization_code',
                'redirect_uri': client.config.dashboard["REDIRECT_URI"],
                'code': code
            }),
            {
                headers:
                    {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                validateStatus: (status: number): boolean => { return true }
            })

        res.cookie("oauth2", JSON.stringify({ access_token: authResponse.data.access_token }), {
            secure: false,
            httpOnly: true,
            expires: new Date(Date.now() + 604800000),
        });


        res.status(301).redirect("/dashboard");
    },

    async isAuthorized(req: Request, res: Response): Promise<boolean> {
        const cookie: any = req.cookies?.["oauth2"];
        if(!cookie) return false;

        const access_token: string = JSON.parse(cookie)?.access_token;

        const userData: any = await axios.get("https://discord.com/api/users/@me", {
            headers: {
                authorization: "Bearer " + access_token
            },
            validateStatus: (status) => { return true }
        });
        if(!userData.data?.id) return false;
        return !!access_token;
    },

    async logout(req: Request, res: Response): Promise<boolean|void> {
        const cookie: any = req.cookies?.["oauth2"];
        if(!cookie) return false;

        const access_token: string = JSON.parse(cookie)?.access_token;
        if(!access_token) return false;

        await axios.post("https://discord.com/api/oauth2/token/revoke", new URLSearchParams({
            'client_id': client.user!.id,
            'client_secret': client.config.dashboard["CLIENT_SECRET"],
            'token': access_token
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            validateStatus: (status: number): boolean => { return true }
        });

        res.clearCookie("oauth2");

        return res.status(301).redirect("/");
    }
}