/* @ts-ignore */
import { Router } from "express";
import VotesController from "@api/controllers/VotesController";

const router: Router = Router();

router.post("/stats", VotesController.stats);
router.post("/new", VotesController.new);

export default router;