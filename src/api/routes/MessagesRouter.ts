/* @ts-ignore */
import { Router } from "express";
import MessagesController from "@api/controllers/MessagesController.js";

const router: Router = Router();

router.post("/send", MessagesController.send);

export default router;