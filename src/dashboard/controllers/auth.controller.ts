import { Request, Response } from "express";
import { client } from "@src/app.js";
import axios, { AxiosResponse } from "axios";
import * as crypto from "crypto";

import UserController from "@dashboard/controllers/user.controller.js";
import { EmbedBuilder } from "discord.js";

const BASE_API_URL: string = "https://discord.com/api";

function encryptString(access_token: string): string {
	const iv = crypto.randomBytes(16);
	const key = client.config.dashboard.ENCRYPTION_KEY;
	const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(key, "hex"), iv);
	let encrypted = cipher.update(access_token, "utf8", "hex") + cipher.final("hex");
	const authTag = cipher.getAuthTag();
	return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

function decryptString(encrypted_access_token: string): string | null {
	const [ivHex, authTagHex, encryptedTextHex] = encrypted_access_token.split(":");
	const key = client.config.dashboard.ENCRYPTION_KEY;
	const iv = Buffer.from(ivHex, "hex");
	const authTag = Buffer.from(authTagHex, "hex");
	const encryptedText = Buffer.from(encryptedTextHex, "hex");
	const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(key, "hex"), iv);
	decipher.setAuthTag(authTag);
	try {
		let decrypted = decipher.update(encryptedText, "binary", "utf8");
		decrypted += decipher.final("utf8");
		return decrypted;
	} catch (err) {
		return null;
	}
}


export default {
	getAccessToken(req: Request): string | null {
		/* Get access token from cookies or session, null if not found */
		const encryptedAccessToken = (req.cookies?.["cookieConsent"] === "true") ? req.cookies?.["access_token"] : req.session?.access_token;
		if (!encryptedAccessToken || !client.utils.stringIsValidJson(encryptedAccessToken)) return null;

		return decryptString(JSON.parse(encryptedAccessToken).value);
	},

	async login(req: Request, res: Response): Promise<void> {
		/* Check if request has access token in cookies or session */
		const cookiesAccessToken = req.cookies?.["access_token"];
		const sessionAccessToken = (req.session as any)?.access_token;

		if ((cookiesAccessToken || sessionAccessToken) && client.utils.stringIsValidJson(cookiesAccessToken || sessionAccessToken)) {
			/* User seems to be logged in, redirect to dashboard */
			return res.status(301).redirect("/dashboard");
		}else{
			/* User is not logged in, redirect to Discord OAuth2 */
			const { CALLBACK_URI } = client.config.dashboard;
			const callback_url: string = encodeURI(CALLBACK_URI);
			const redirect_url: string = BASE_API_URL + "/oauth2/authorize?client_id=" + client.user.id + "&redirect_uri=" + callback_url + "&response_type=code&scope=identify%20guilds%20guilds.join";
			res.status(301).redirect(redirect_url);
		}
	},

	async isLoggedIn(req: Request, res: Response): Promise<boolean | string> {
		/* Check if request has access token in cookies or session */
		const cookiesAccessToken = req.cookies?.["access_token"];
		const sessionAccessToken = (req.session as any)?.access_token;
		const encryptedAccessToken: string | null = cookiesAccessToken || sessionAccessToken;

		if(!encryptedAccessToken || !client.utils.stringIsValidJson(encryptedAccessToken)) return false;

		/* Decrypt access token */
		const access_token: string | null = decryptString(JSON.parse(encryptedAccessToken).value);
		if (!access_token) return false;

		/* Check if access token is valid */
		const userData: AxiosResponse = await axios.get(BASE_API_URL + "/users/@me", {
			headers: { authorization: "Bearer " + access_token },
			validateStatus: (status: number): boolean => true
		});

		return Boolean(userData.data?.id);
	},

	renderLogin(res: Response): void {
		/* Render login page */
		res.render("login", {
			client: client,
			title: "Login",
			module: "login",
			guild: null,
			guildData: null,
			user: null,
			avatarUrl: null,
		});
	},

	async isAuthorizedInGuild(guild: any): Promise<boolean> {
		/* Check if user is authorized to view specific guild */
		if (!guild) return false;

		/* Check for guild ownership, Administrator or ManageGuild permission */
		const Administrator: 8 = 0x08;
		const ManageGuild: 32 = 0x20;

		return guild.owner || guild.permissions & Administrator || guild.permissions & ManageGuild;
	},

	async callback(req: Request, res: Response): Promise<void> {
		/* Handle Discord OAuth2 callback */
		const { code } = req.query;
		const { CLIENT_SECRET, CALLBACK_URI } = client.config.dashboard;


		/* Get account access token */
		const discordAuthResponse: AxiosResponse = await axios.post(BASE_API_URL + "/oauth2/token",
			new URLSearchParams({
				client_id: client.user.id,
				client_secret: CLIENT_SECRET,
				grant_type: "authorization_code",
				redirect_uri: CALLBACK_URI,
				code
			}), {
				headers: { ["Content-Type"]: "application/x-www-form-urlencoded" },
				validateStatus: (status: number): boolean => true
			}
		);

		const { access_token } = discordAuthResponse.data;

		/* Get user data */
		const user: any = await UserController.getUser(access_token);

		/* Let user join support server */
		await axios.put(BASE_API_URL + "/guilds/" + client.config.support["ID"] + "/members/" + user.id,
			{ access_token },
			{
				headers: {
					authorization: `Bot ${client.token}`,
					["Content-Type"]: "application/json",
				},
				validateStatus: (status: number): boolean => true,
			},
		);

		/* Encrypt access token */
		const encrypted_access_token: string = encryptString(access_token);

		/* Send log to support guild */
		const supportGuild: any = client.guilds.cache.get(client.config.support["ID"]);
		if (supportGuild) {
			const logChannel: any = supportGuild.channels.cache.get(client.config.support["BOT_LOG"]);
			if (logChannel) {
				const embed: EmbedBuilder = client.createEmbed(user.global_name + "(@" + user.username + ") hat sich im Dashboard angemeldet", "arrow", "normal",);
				embed.setThumbnail(UserController.getAvatarURL(user));
				logChannel.send({ embeds: [embed] });
			}
		}

		/* Check if user accepted cookies */
		if (req.cookies?.["cookieConsent"] === "true") {
			/* Set access token cookie */
			const access_token_cookie: string = JSON.stringify({
				value: encrypted_access_token,
				expiry: Date.now() + 604800000,
			});

			res.cookie("access_token", access_token_cookie, {
				secure: false,
				httpOnly: true,
				expires: new Date(Date.now() + 604800000),
			});
		} else {
			/* Save access token in session */
			const session: any = req.session;
			const sessionObject: string = JSON.stringify({
				value: encrypted_access_token,
				expiry: Date.now() + 604800000,
			});
			session.access_token = sessionObject;
		}
		res.status(301).redirect("/dashboard");
	},

	async logout(req: Request, res: Response): Promise<boolean | void> {
		/* Get encrypted access token */
		const cookiesAccessToken = req.cookies?.["access_token"];
		const sessionAccessToken = (req.session as any)?.access_token;
		const encryptedAccessToken: string | null = cookiesAccessToken || sessionAccessToken;

		if(!encryptedAccessToken || !client.utils.stringIsValidJson(encryptedAccessToken)) return false;

		/* Decrypt access token */
		const access_token: string | null = decryptString(JSON.parse(encryptedAccessToken).value);
		if (!access_token) return false;

		/* Request Discord API to revoke access token */
		const { CLIENT_SECRET } = client.config.dashboard;

		await axios.post(BASE_API_URL + "/oauth2/token/revoke",
			new URLSearchParams({
				client_id: client.user!.id,
				client_secret: CLIENT_SECRET,
				token: access_token,
				token_type_hint: "access_token",
			}),
			{
				headers: { ["Content-Type"]: "application/x-www-form-urlencoded" },
				validateStatus: (status: number): boolean => true,
			},
		);

		/* Delete access token from cookies or session */
		if (req.cookies?.cookieConsent === 'true') {
			res.clearCookie('access_token');
		} else {
			delete req.session.access_token;
		}

		/* Redirect to home page */
		return res.status(301).redirect("/");
	},
};
