/* @ts-ignore */
import { Router } from "express";
import GuildsController from "@api/controllers/GuildsController.js";

const router: Router = Router();

router.get("/list", GuildsController.list);
router.delete("/leave", GuildsController.leave);

export default router;