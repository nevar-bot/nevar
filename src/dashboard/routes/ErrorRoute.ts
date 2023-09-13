import express, { Router } from "express";
const router: Router = express.Router();

import NotfoundController from "@dashboard/controllers/notfound.controller";

router.get("/", NotfoundController.get);

export default router;
