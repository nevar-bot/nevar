import express, { Router } from "express";
const router: Router = express.Router();

import DashboardController from "@dashboard/controllers/DashboardController";

router.get("/", DashboardController.getIndex);
router.get("/:guildId", DashboardController.getGuild);

export default router;