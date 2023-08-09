import { Express, Request, Response } from "express";
import { get as getStaffs } from "@api/controllers/client/staffs_controller";

export default function configureStaffsRoutes(app: Express): void {
	app.route("/client/staffs").get((req: Request, res: Response): void => {
		getStaffs(req, res);
	});
}
