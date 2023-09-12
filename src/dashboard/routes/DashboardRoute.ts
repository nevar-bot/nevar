import express, { Router } from "express";
const router: Router = express.Router();

import DashboardController from "@dashboard/controllers/DashboardController";
import OverviewController from "@dashboard/controllers/guild/OverviewController";
import AichatController from "@dashboard/controllers/guild/AichatController";
import AimodController from "@dashboard/controllers/guild/AimodController";

router.get("/", DashboardController.get);

router.get("/:guildId", OverviewController.get);

router.get("/:guildId/aichat", AichatController.get);
router.post("/:guildId/aichat/save", AichatController.post);

router.get("/:guildId/aimod", AimodController.get);



export default router;
