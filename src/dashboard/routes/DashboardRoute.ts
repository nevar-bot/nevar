import express, { Router } from "express";
import fs from "fs";
import path from "path";

const router: Router = express.Router();

import DashboardController from "@dashboard/controllers/dashboard.controller";
import OverviewController from "@dashboard/controllers/guild/overview.controller";

router.get("/", DashboardController.get);
router.get("/:guildId", OverviewController.get);

const controllerDirs: string[] = ["../controllers/guild/", "../controllers/guild/levelsystem/"];

const importController = async (dir: string, file: string): Promise<void> => {
	const controller = await import(path.join(dir, file));
	const trimmedDir: string = dir.replace("../controllers/guild/", "");
	const routeBase: string = file.replace(".controller.js", "");

	const basePath: string = `/:guildId/${trimmedDir}${routeBase}`;
	if (controller.default.get) router.get(basePath, controller.default.get);
	if (controller.default.post) router.post(`${basePath}/save`, controller.default.post);
};

controllerDirs.forEach((dir: string): void => {
	const totalPath: string = path.resolve(__dirname, dir);
	const files: string[] = fs.readdirSync(totalPath);

	for (const file of files) {
		if (file.endsWith(".controller.js")) {
			importController(dir, file);
		}
	}
});

export default router;
