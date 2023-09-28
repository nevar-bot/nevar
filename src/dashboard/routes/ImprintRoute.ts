import express, { Router } from "express";
const router: Router = express.Router();

import ImprintController from "@dashboard/controllers/imprint.controller";

router.get("/", ImprintController.get);

export default router;
