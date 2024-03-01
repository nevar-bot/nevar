import { Request, Response } from "express";

export default {
	get(req: Request, res: Response): void {
		/* Redirect to dashboard */
		res.status(301).redirect("/dashboard");
	},
};
