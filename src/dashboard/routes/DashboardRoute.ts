import express, { Router } from "express";
import fs from "fs";
import path from "path";

const router: Router = express.Router();

import DashboardController from "@dashboard/controllers/dashboard.controller.js";
import OverviewController from "@dashboard/controllers/guild/overview.controller.js";

router.get("/", DashboardController.get);
router.get("/:guildId", OverviewController.get);
router.post("/:guildId/save", OverviewController.post);

const controllerDirs: string[] = ["controllers/guild/", "controllers/guild/levelsystem/"];
const baseDir: string = path.resolve(process.cwd(), "build/dashboard");
const importController = async (dir: string, file: string): Promise<void> => {
	const controllerPath: string = path.join(baseDir, dir, file);
	const cleanPath: string = controllerPath.split(path.sep).join(path.posix.sep).replace("C:", "");
	const controller = await import(cleanPath);
	const trimmedDir: string = dir.replace("controllers/guild/", "");
	const routeBase: string = file.replace(".controller.js", "");

	const basePath: string = `/:guildId/${trimmedDir}${routeBase}`;
	if (controller.default.get) router.get(basePath, controller.default.get);
	if (controller.default.post) router.post(`${basePath}/save`, controller.default.post);
};

controllerDirs.forEach(async (dir) => {
	const totalPath: string = path.resolve(baseDir, dir);
	const files: string[] = await fs.promises.readdir(totalPath);

	for (const file of files) {
		if (file.endsWith(".controller.js")) {
			await importController(dir, file);
		}
	}
});

export default router;
