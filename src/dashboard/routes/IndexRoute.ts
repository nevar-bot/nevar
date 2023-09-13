import express, { Router } from "express";
const router: Router = express.Router();

import IndexController from "@dashboard/controllers/index.controller";

router.get("/", IndexController.get);

export default router;
