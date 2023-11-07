import axios, { AxiosResponse } from "axios";
const BASE_API_URL: string = "https://discord.com/api";

export default {
	async getUser(access_token: string | null): Promise<any> {
		/* check if access token is set */
		if (!access_token) return null;

		/* get user data */
		const user: AxiosResponse = await axios.get(BASE_API_URL + "/users/@me", {
			headers: { authorization: `Bearer ${access_token}` },
			validateStatus: (status: number): boolean => true
		});

		return user.data;
	},

	async getGuilds(access_token: string | null): Promise<any> {
		/* check if access token is set */
		if (!access_token) return null;

		/* get user guilds */
		const userGuilds: AxiosResponse = await axios.get(BASE_API_URL + "/users/@me/guilds", {
			headers: { authorization: `Bearer ${access_token}` },
			validateStatus: (status: number): boolean => true
		});

		return userGuilds.data;
	},

	getAvatarURL(user: any): string {
		if (!user.avatar)
			return (
				"https://cdn.discordapp.com/embed/avatars/" + Math.floor(Math.random() * 6) + ".png"
			);
		return (
			"https://cdn.discordapp.com/avatars/" + user.id + "/" + user.avatar + ".webp?size=256"
		);
	}
};
