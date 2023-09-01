import {AxiosResponse} from "axios";
import axios from "axios";
import {client} from "@src/app";

export default {
    async getUserInfo(access_token: string): Promise<any> {
        const user: AxiosResponse = await axios.get("https://discord.com/api/users/@me", {
            headers: {
                authorization: "Bearer " + access_token
            },
            validateStatus: (status: number): boolean => { return true }
        });

        return user.data;
    },

    async getUserGuilds(access_token: string): Promise<any> {
        const userGuilds: AxiosResponse = await axios.get("https://discord.com/api/users/@me/guilds", {
            headers: {
                authorization: "Bearer " + access_token
            },
            validateStatus: (status: number): boolean => { return true }
        });

        return userGuilds.data;
    },

    async getUserGuild(guild_id: string): Promise<any> {
        const userGuild: AxiosResponse = await axios.get("https://discord.com/api/guilds/" + guild_id + "?with_counts=true");
        return userGuild;
    }
}