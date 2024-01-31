/* @ts-ignore */
import { Router } from "express";
import GeneralController from "@api/controllers/GeneralController";

const router: Router = Router();

router.get("/stats", GeneralController.stats);
router.get("/staffs", GeneralController.staffs);
router.get("/reboot", GeneralController.reboot);

export default router;