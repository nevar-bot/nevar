import express, { Express } from "express";
import session from "express-session";
import path from "path";
import cookieParser from "cookie-parser";
import { NevarClient } from "@core/NevarClient";
import compression from "compression";

import IndexRoute from "@dashboard/routes/IndexRoute.js";
import DashboardRoute from "@dashboard/routes/DashboardRoute.js";
import AuthRoute from "@dashboard/routes/AuthRoute.js";
import ErrorRoute from "@dashboard/routes/ErrorRoute.js";
import ImprintRoute from "@dashboard/routes/ImprintRoute.js";
import PrivacyRoute from "@dashboard/routes/PrivacyRoute.js";
import FeedbackRoute from "@dashboard/routes/FeedbackRoute.js";

export class Dashboard {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
	}

	public init(): void {
		const { SESSION_SECRET, PORT } = this.client.config.dashboard;
		const app: Express = express();

		// Middleware
		app.use(compression(), express.json(), express.urlencoded({ extended: true }), cookieParser());

		// Session
		app.use(
			session({
				secret: SESSION_SECRET,
				resave: false,
				saveUninitialized: true,
			}),
		);

		// Set view engine and static files
		app.set("view engine", "pug");
		app.set("views", process.cwd() + "/build/dashboard/views");
		app.use(express.static(process.cwd() + "/build/dashboard/public"));

		// Routes
		app.use("/", IndexRoute);
		app.use("/dashboard", DashboardRoute);
		app.use("/auth", AuthRoute);
		app.use("/imprint", ImprintRoute);
		app.use("/privacy", PrivacyRoute);
		app.use("/feedback", FeedbackRoute);
		app.use("*", ErrorRoute);

		// Start server
		app.listen(PORT, (): void => {
			this.client.logger.log(`Dashboard is running on port ${PORT}`);
		});
	}
}
