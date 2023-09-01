import express, { Router } from "express";
const router: Router = express.Router();

import IndexController from "@dashboard/controllers/IndexController";

router.get("/", IndexController.getIndex);

export default router;