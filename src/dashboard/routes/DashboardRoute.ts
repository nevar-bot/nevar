import express, { Router } from "express";
const router: Router = express.Router();

import DashboardController from "@dashboard/controllers/DashboardController";
import OverviewController from "@dashboard/controllers/guild/OverviewController";
import AichatController from "@dashboard/controllers/guild/AichatController";

router.get("/", DashboardController.get);

router.get("/:guildId", OverviewController.get);

router.get("/:guildId/aichat", AichatController.get);
router.post("/:guildId/aichat/save", AichatController.post);

export default router;
