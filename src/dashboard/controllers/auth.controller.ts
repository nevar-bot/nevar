import { Request, Response } from "express";
import { client } from "@src/app";
import axios, { AxiosResponse } from "axios";
import * as crypto from "crypto";

import UserController from "@dashboard/controllers/user.controller";
import {EmbedBuilder} from "discord.js";

const BASE_API_URL: string = "https://discord.com/api";

function encryptAccessToken(access_token: string): string {
	/* generate iv */
	const iv: Buffer = crypto.randomBytes(16);

	/* get encryption key */
	const key: string = client.config.dashboard["ENCRYPTION_KEY"];

	/* encrypt access token */
	const cipher: crypto.CipherGCM = crypto.createCipheriv("aes-256-gcm", Buffer.from(key, 'hex'), iv);

	let encrypted: string = cipher.update(access_token, 'utf8', 'hex');
	encrypted += cipher.final('hex');

	const authTag: Buffer = cipher.getAuthTag();

	/* return encrypted access token */
	return `${iv.toString("hex")}:${authTag.toString('hex')}:${encrypted}`;
}

function decryptAccessToken(encrypted_access_token: string): string|null {
	/* split encrypted access token */
	const parts: string[] = encrypted_access_token.split(":");

	/* get encryption key and iv */
	const key: string = client.config.dashboard["ENCRYPTION_KEY"];
	const iv: Buffer = Buffer.from(parts.shift()!, "hex");

	/* get auth tag and encrypted text */
	const authTag: Buffer = Buffer.from(parts.shift()!, 'hex');
	const encryptedText: Buffer = Buffer.from(parts.join(":"), "hex");

	/* decrypt access token */
	const decipher: any = crypto.createDecipheriv("aes-256-gcm", Buffer.from(key, 'hex'), iv);
	decipher.setAuthTag(authTag);

	/* return decrypted access token */
	let decrypted: string;
	try {
		decrypted = decipher.update(encryptedText, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
	} catch (err) {
		return null;
	}

	return decrypted;
}

export default {
	getAccessToken(req: Request): string | null {
		/* get encrypted access_token */
		const encrypted_access_token = req.cookies?.["access_token"];
		if (!encrypted_access_token) return null;

		/* decrypt access token */
		const access_token: string|null = decryptAccessToken(encrypted_access_token);

		return access_token;
	},

	async login(req: Request, res: Response): Promise<void> {
		/* user is already logged in */
		if (req.cookies?.["access_token"]) return res.status(301).redirect("/dashboard");

		/* prepare redirect url */
		const { CALLBACK_URI } = client.config.dashboard;
		const callback_url: string = encodeURI(CALLBACK_URI);
		const redirect_url: string =
			BASE_API_URL +
			`/oauth2/authorize?client_id=${client.user!.id}&redirect_uri=${callback_url}&response_type=code&scope=identify%20guilds%20guilds.join`;

		/* redirect to discord oauth2 */
		res.status(301).redirect(redirect_url);
	},

	async isLoggedIn(req: Request): Promise<boolean> {
		/* get encrypted access token */
		const encrypted_access_token = req.cookies?.["access_token"];
		if (!encrypted_access_token) return false;

		/* decrypt access token */
		const access_token: string|null = decryptAccessToken(encrypted_access_token);
		if(!access_token) return false;

		/* check if access token is valid */
		const userData: AxiosResponse = await axios.get("https://discord.com/api/users/@me", {
			headers: { authorization: `Bearer ${access_token}` },
			validateStatus: (status: number): boolean => true
		});

		return Boolean(userData.data?.id && access_token);
	},

	renderLogin(res: Response): void {
		/* render login page */
		res.render("login", {
			client: client,
			title: "Login",
			module: "login",
			guild: null,
			guildData: null,
			user: null,
			avatarUrl: null
		});
	},

	async isAuthorizedInGuild(guild: any): Promise<boolean> {
		if (!guild) return false;

		/* check if user is owner or has admin or manage guild permissions */
		const ADMIN_PERMISSION: any = 0x08;
		const MANAGE_GUILD_PERMISSION: any = 0x20;
		return !(!guild || !(guild.owner || guild.permissions & ADMIN_PERMISSION || guild.permissions & MANAGE_GUILD_PERMISSION));
	},

	async callback(req: Request, res: Response): Promise<void> {
		/* handle discord oauth2 callback */
		const { code } = req.query as { code: string };
		const { CLIENT_SECRET, CALLBACK_URI } = client.config.dashboard;

		/* get access token */
		const authResponse: AxiosResponse = await axios.post(
			BASE_API_URL + "/oauth2/token",
			new URLSearchParams({
				client_id: client.user!.id,
				client_secret: CLIENT_SECRET,
				grant_type: "authorization_code",
				redirect_uri: CALLBACK_URI,
				code
			}),
			{ headers: { ["Content-Type"]: "application/x-www-form-urlencoded" }, validateStatus: (status: number): boolean => true }
		);

		const { access_token } = authResponse.data;

		/* get user info */
		const user: any = await UserController.getUser(access_token);
		/* join support server */
		await axios.put(
			BASE_API_URL + `/guilds/${client.config.support["ID"]}/members/${user.id}`,
			{ access_token },
			{
				headers: { authorization: `Bot ${client.token}`, ["Content-Type"]: "application/json" },
				validateStatus: (status: number): boolean => true
			}
		);

		/* encrypt access token */
		const encrypted_access_token: string = encryptAccessToken(access_token);

		/* send log to support server */
		const supportGuild: any = client.guilds.cache.get(client.config.support["ID"]);
		if(supportGuild){
			const logChannel: any = supportGuild.channels.cache.get(client.config.support["BOT_LOG"]);
			if(logChannel){
				const embed: EmbedBuilder = client.createEmbed(user.global_name + "(@" +  user.username + ") hat sich im Dashboard angemeldet", "arrow", "normal");
				embed.setThumbnail(UserController.getAvatarURL(user));
				logChannel.send({ embeds: [embed] })
			}
		}
		/* set access token cookie */
		res.cookie("access_token", encrypted_access_token, { secure: false, httpOnly: true, expires: new Date(Date.now() + 604800000) });
		res.status(301).redirect("/dashboard");
	},

	async logout(req: Request, res: Response): Promise<boolean | void> {
		/* get encrypted access token */
		const encrypted_access_token = req.cookies?.["access_token"];
		if (!encrypted_access_token) return false;

		/* decrypt access token */
		const access_token: string|null = decryptAccessToken(encrypted_access_token);
		if(!access_token) return false;

		const { CLIENT_SECRET } = client.config.dashboard;

		/* revoke access token */
		await axios.post(
			BASE_API_URL + "/oauth2/token/revoke",
			new URLSearchParams({ client_id: client.user!.id, client_secret: CLIENT_SECRET, token: access_token }),
			{ headers: { ["Content-Type"]: "application/x-www-form-urlencoded" }, validateStatus: (status: number): boolean => true }
		);

		/* clear cookie */
		res.clearCookie("access_token");
		return res.status(301).redirect("/");
	}
};
