import { Request, Response } from "express";
import { client } from "@src/app";
import fs from "fs";
import moment from "moment";
import { ButtonBuilder, EmbedBuilder } from "discord.js";

export async function post(req: Request, res: Response) {
	const { app } = req;

	const authorizationHeader: any = req.headers?.authorization;
	if (!authorizationHeader) {
		return res.sendStatus(401);
	}

	if (authorizationHeader === client.config.apikeys["TOP_GG_AUTH"]) {
		const userId = req.body.user;
		if (!userId) {
			return res.sendStatus(400);
		}

		const user: any = await client.users.fetch(userId).catch((): void => {});
		if (!user) {
			return res.sendStatus(400);
		}

		const supportGuild: any = client.guilds.cache.get(client.config.support["ID"]);
		if (!supportGuild) {
			return res.sendStatus(500);
		}

		const supportGuildData: any = await client.findOrCreateGuild(supportGuild.id);
		if (!supportGuildData) {
			return res.sendStatus(500);
		}

		const userData: any = await client.findOrCreateUser(userId);
		if (!userData.voteCount) userData.voteCount = 0;
		userData.voteCount = userData.voteCount + 1;
		userData.markModified("voteCount");
		await userData.save();
		const voteCount = userData ? userData.voteCount : null;
		const text: string =
			"**" +
			user.displayName +
			"** (@" +
			user.username +
			") hat gerade " +
			(voteCount ? "zum **" + voteCount + ". Mal** " : "") +
			"für uns gevotet!\n" +
			client.emotes.arrow +
			" Auf **[Top.gg](https://top.gg/bot/" +
			client.user!.id +
			"/vote)** könnt ihr alle 12 Stunden für " +
			client.user!.username +
			" voten.";
		const voteEmbed: EmbedBuilder = client.createEmbed(text, "shine", "normal");
		voteEmbed.setThumbnail(user.displayAvatarURL());

		const voteNowButton: ButtonBuilder = client.createButton(
			null,
			"Jetzt voten",
			"Link",
			"rocket",
			false,
			"https://top.gg/bot/" + client.user!.id + "/vote"
		);
		const buttonRow: any = client.createMessageComponentsRow(voteNowButton);

		const channel: any = client.channels.cache.get(
			client.config.channels["VOTE_ANNOUNCEMENT_ID"]
		);
		await channel
			.send({ embeds: [voteEmbed], components: [buttonRow] })
			.catch((e: any): void => {
				client.alertException(e, null, user.id, "Vote Announcement senden");
			});

		const voteObj: any = JSON.parse(fs.readFileSync("./assets/votes.json").toString());

		const months: string[] = moment.months();
		const month: string = months[new Date(Date.now()).getMonth()];

		voteObj[month.toLowerCase()] = voteObj[month.toLowerCase()] + 1;
		fs.writeFileSync("./assets/votes.json", JSON.stringify(voteObj, null, 4));
		return res.sendStatus(200);
	}
	return res.sendStatus(401);
}
