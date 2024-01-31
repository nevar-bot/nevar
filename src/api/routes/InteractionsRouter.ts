/* @ts-ignore */
import { Router } from "express";
import InteractionsController from "@api/controllers/InteractionsController";

const router: Router = Router();

router.get("/commands", InteractionsController.commands);
router.post("/commands/stats", InteractionsController.commandsStats);
router.get("/contexts", InteractionsController.contexts);
router.post("/contexts/stats", InteractionsController.contextsStats);

export default router;