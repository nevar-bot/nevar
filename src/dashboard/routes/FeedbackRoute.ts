import express, { Router } from "express";
const router: Router = express.Router();

import FeedbackController from "@dashboard/controllers/feedback.controller.js";

router.get("/", FeedbackController.get);
router.post("/save", FeedbackController.post);

export default router;
