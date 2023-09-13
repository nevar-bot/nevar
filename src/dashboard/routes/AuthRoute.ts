import express, { Router } from "express";
const router: Router = express.Router();

import AuthController from "@dashboard/controllers/auth.controller";

router.get("/login", AuthController.login);
router.get("/callback", AuthController.callback);
router.get("/logout", AuthController.logout);

export default router;
