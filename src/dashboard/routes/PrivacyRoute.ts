import express, { Router } from "express";
const router: Router = express.Router();

import PrivacyController from "@dashboard/controllers/privacy.controller";

router.get("/", PrivacyController.get);

export default router;
