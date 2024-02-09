/* @ts-ignore */
import { Router } from "express";
import LevelsController from "@api/controllers/LevelsController.js";

const router: Router = Router();

router.post("/leaderboard", LevelsController.leaderboard);
router.post("/user", LevelsController.user);
router.post("/user/xp", LevelsController.manipulateUserXp);
router.post("/user/level", LevelsController.manipulateUserLevel);

export default router;