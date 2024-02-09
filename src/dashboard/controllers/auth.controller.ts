import { Request, Response } from "express";
import { client } from "@src/app.js";
import axios, { AxiosResponse } from "axios";
import * as crypto from "crypto";

import UserController from "@dashboard/controllers/user.controller.js";
import { EmbedBuilder } from "discord.js";

const BASE_API_URL: string = "https://discord.com/api";

function isJsonString(str: string): boolean {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}
function encryptString(access_token: string): string {
	/* generate iv */
	const iv: Buffer = crypto.randomBytes(16);

	/* get encryption key */
	const key: string = client.config.dashboard["ENCRYPTION_KEY"];

	/* encrypt access token */
	const cipher: crypto.CipherGCM = crypto.createCipheriv("aes-256-gcm", Buffer.from(key, "hex"), iv);

	let encrypted: string = cipher.update(access_token, "utf8", "hex");
	encrypted += cipher.final("hex");

	const authTag: Buffer = cipher.getAuthTag();

	/* return encrypted access token */
	return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

function decryptString(encrypted_access_token: string): string | null {
	/* split encrypted access token */
	const parts: string[] = encrypted_access_token.split(":");

	/* get encryption key and iv */
	const key: string = client.config.dashboard["ENCRYPTION_KEY"];
	const iv: Buffer = Buffer.from(parts.shift()!, "hex");

	/* get auth tag and encrypted text */
	const authTag: Buffer = Buffer.from(parts.shift()!, "hex");
	const encryptedText: Buffer = Buffer.from(parts.join(":"), "hex");

	/* decrypt access token */
	const decipher: any = crypto.createDecipheriv("aes-256-gcm", Buffer.from(key, "hex"), iv);
	decipher.setAuthTag(authTag);

	/* return decrypted access token */
	let decrypted: string;
	try {
		decrypted = decipher.update(encryptedText, "hex", "utf8");
		decrypted += decipher.final("utf8");
	} catch (err) {
		return null;
	}

	return decrypted;
}

export default {
	getAccessToken(req: Request): string | null {
		/* get encrypted access_token */
		if (req.cookies?.["cookieConsent"] === "true") {
			const encrypted_access_token = req.cookies?.["access_token"];
			if (!encrypted_access_token) return null;
			if (!isJsonString(encrypted_access_token)) return null;

			/* decrypt access token */
			const access_token: string | null = decryptString(JSON.parse(encrypted_access_token).value);

			return access_token;
		} else {
			// cookies not accepted, access token saved in session
			const session: any = req.session;
			const encrypted_access_token = session?.access_token;
			if (!encrypted_access_token) return null;
			if (!isJsonString(encrypted_access_token)) return null;

			const access_token: string | null = decryptString(JSON.parse(encrypted_access_token).value);

			return access_token;
		}
	},

	async login(req: Request, res: Response): Promise<void> {
		/* user is already logged in */
		if (
			(req.cookies?.["access_token"] && isJsonString(req.cookies?.["access_token"])) ||
			((req.session as any).access_token && isJsonString((req.session as any).access_token))
		)
			return res.status(301).redirect("/dashboard");

		/* prepare redirect url */
		const { CALLBACK_URI } = client.config.dashboard;
		const callback_url: string = encodeURI(CALLBACK_URI);
		const redirect_url: string =
			BASE_API_URL +
			`/oauth2/authorize?client_id=${
				client.user!.id
			}&redirect_uri=${callback_url}&response_type=code&scope=identify%20guilds%20guilds.join`;

		/* redirect to discord oauth2 */
		res.status(301).redirect(redirect_url);
	},

	async isLoggedIn(req: Request, res: Response): Promise<boolean | string> {
		let refreshed_token: boolean = false;
		let encrypted_access_token: string;
		// check if cookies are accepted
		if (req.cookies?.["cookieConsent"] === "true") {
			encrypted_access_token = req.cookies?.["access_token"];

			if (!encrypted_access_token) return false;
			if (!isJsonString(encrypted_access_token)) return false;

			// calculate expiry date
			const oneDayInMs: number = 24 * 60 * 60 * 1000;
			const { value, expiry } = JSON.parse(encrypted_access_token);

			if (expiry - Date.now() < oneDayInMs) {
				// access token expires in less than one day, refresh
				const access_token: string | null = decryptString(value);
				const encrypted_refresh_token: string | null = req.cookies?.["refresh_token"];
				if (!encrypted_refresh_token) return false;
				if (!isJsonString(encrypted_refresh_token)) return false;
				const refresh_token: string | null = decryptString(JSON.parse(req.cookies?.["refresh_token"]).value);

				if (access_token && refresh_token) {
					const { CLIENT_SECRET } = client.config.dashboard;

					const refreshResponse: AxiosResponse = await axios.post(
						BASE_API_URL + "/oauth2/token",
						new URLSearchParams({
							client_id: client.user!.id,
							client_secret: CLIENT_SECRET,
							grant_type: "refresh_token",
							refresh_token: refresh_token,
						}),
						{ headers: { "Content-Type": "application/x-www-form-urlencoded" } },
					);

					/* encrypt acccess and refresh token */
					const new_access_token: string = encryptString(refreshResponse.data.access_token);
					const new_refresh_token: string = encryptString(refreshResponse.data.refresh_token);

					/* set access and refresh cookie */
					const access_token_cookie: string = JSON.stringify({
						value: new_access_token,
						expiry: Date.now() + 604800000,
					});

					const refresh_token_cookie: string = JSON.stringify({
						value: new_refresh_token,
						expiry: null,
					});

					res.cookie("access_token", access_token_cookie, {
						secure: false,
						httpOnly: true,
						expires: new Date(Date.now() + 604800000),
					});
					res.cookie("refresh_token", refresh_token_cookie, {
						secure: false,
						httpOnly: true,
					});

					refreshed_token = true;
				}
			}
		} else {
			// cookies not accepted, access token saved in session
			const session: any = req.session;
			encrypted_access_token = session?.access_token;

			if (!encrypted_access_token) return false;
			if (!isJsonString(encrypted_access_token)) return false;
		}

		if (!refreshed_token) {
			/* Entschlüssele das Zugriffstoken */
			const { value } = JSON.parse(encrypted_access_token);
			const access_token: string | null = decryptString(value);

			if (!access_token) return false;

			// check if access token is valid
			const userData: AxiosResponse = await axios.get("https://discord.com/api/users/@me", {
				headers: { authorization: `Bearer ${access_token}` },
				validateStatus: (status: number): boolean => true,
			});

			return Boolean(userData.data?.id && access_token);
		} else {
			return "refreshed_token";
		}
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
			avatarUrl: null,
		});
	},

	async isAuthorizedInGuild(guild: any): Promise<boolean> {
		if (!guild) return false;

		/* check if user is owner or has admin or manage guild permissions */
		const ADMIN_PERMISSION: any = 0x08;
		const MANAGE_GUILD_PERMISSION: any = 0x20;
		return !(
			!guild ||
			!(guild.owner || guild.permissions & ADMIN_PERMISSION || guild.permissions & MANAGE_GUILD_PERMISSION)
		);
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
				code,
			}),
			{
				headers: { ["Content-Type"]: "application/x-www-form-urlencoded" },
				validateStatus: (status: number): boolean => true,
			},
		);

		const { access_token, refresh_token } = authResponse.data;

		/* get user info */
		const user: any = await UserController.getUser(access_token);
		/* join support server */
		await axios.put(
			BASE_API_URL + `/guilds/${client.config.support["ID"]}/members/${user.id}`,
			{ access_token },
			{
				headers: {
					authorization: `Bot ${client.token}`,
					["Content-Type"]: "application/json",
				},
				validateStatus: (status: number): boolean => true,
			},
		);

		/* encrypt access and refresh token */
		const encrypted_access_token: string = encryptString(access_token);
		const encrypted_refresh_token: string = encryptString(refresh_token);

		/* send log to support server */
		const supportGuild: any = client.guilds.cache.get(client.config.support["ID"]);
		if (supportGuild) {
			const logChannel: any = supportGuild.channels.cache.get(client.config.support["BOT_LOG"]);
			if (logChannel) {
				const embed: EmbedBuilder = client.createEmbed(
					user.global_name + "(@" + user.username + ") hat sich im Dashboard angemeldet",
					"arrow",
					"normal",
				);
				embed.setThumbnail(UserController.getAvatarURL(user));
				logChannel.send({ embeds: [embed] });
			}
		}
		/* check if cookie consent is given */
		if (req.cookies?.["cookieConsent"] === "true") {
			/* set access and refresh token cookie */
			const access_token_cookie: string = JSON.stringify({
				value: encrypted_access_token,
				expiry: Date.now() + 604800000,
			});
			const refresh_token_cookie: string = JSON.stringify({
				value: encrypted_refresh_token,
				expiry: null,
			});

			res.cookie("access_token", access_token_cookie, {
				secure: false,
				httpOnly: true,
				expires: new Date(Date.now() + 604800000),
			});
			res.cookie("refresh_token", refresh_token_cookie, { secure: false, httpOnly: true });
		} else {
			// cookies not accepted, save access token in session
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
		/* get encrypted access token */
		let encrypted_access_token: string;
		let encrypted_refresh_token: string | undefined;
		if (req.cookies?.["cookieConsent"] === "true") {
			encrypted_access_token = req.cookies?.["access_token"];
			encrypted_refresh_token = req.cookies?.["refresh_token"];
		} else {
			// cookies not accepted, access token saved in session
			const session: any = req.session;
			encrypted_access_token = session?.access_token;
		}
		if (!encrypted_access_token) return false;
		if (!isJsonString(encrypted_access_token)) return false;

		/* decrypt access token */
		const access_token: string | null = decryptString(JSON.parse(encrypted_access_token).value);
		if (!access_token) return false;

		const { CLIENT_SECRET } = client.config.dashboard;

		/* revoke access token */
		await axios.post(
			BASE_API_URL + "/oauth2/token/revoke",
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

		/* revoke refresh token */
		if (encrypted_refresh_token) {
			const refresh_token: string | null = decryptString(JSON.parse(encrypted_refresh_token).value);
			await axios.post(
				BASE_API_URL + "/oauth2/token/revoke",
				new URLSearchParams({
					client_id: client.user!.id,
					client_secret: CLIENT_SECRET,
					token: refresh_token as string,
					token_type_hint: "refresh_token",
				}),
				{
					headers: { ["Content-Type"]: "application/x-www-form-urlencoded" },
					validateStatus: (status: number): boolean => true,
				},
			);
		}

		/* clear cookie */
		if (req.cookies?.["cookieConsent"] === "true") {
			res.clearCookie("access_token");
			res.clearCookie("refresh_token");
		} else {
			const session: any = req.session;
			delete session.access_token;
		}
		return res.status(301).redirect("/");
	},
};
