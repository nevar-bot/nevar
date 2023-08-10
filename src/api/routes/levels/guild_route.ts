import { Express, Request, Response } from "express";
import { get as getGuildLevels } from "@api/controllers/levels/guild_controller";

export default function configureGuildLevelsRoutes(app: Express): void {
	app.route("/levels/leaderboard/:guildID/:amount?").get((req: Request, res: Response): void => {
		getGuildLevels(req, res);
	});
}
