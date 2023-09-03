import express, { Router } from "express";
const router: Router = express.Router();

import IndexController from "@dashboard/controllers/IndexController";

router.get("/", IndexController.get);

export default router;
