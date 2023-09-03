import express, { Express } from "express";
import session from "express-session";
import path from "path";
import cookieParser from "cookie-parser";
import BaseClient from "@structures/BaseClient";
import compression from "compression";

import IndexRoute from "@dashboard/routes/IndexRoute";
import DashboardRoute from "@dashboard/routes/DashboardRoute";
import AuthRoute from "@dashboard/routes/AuthRoute";

export default {
	init(client: BaseClient): void {
		const { SESSION_SECRET, PORT } = client.config.dashboard;
		const app: Express = express();

		// Middleware
		app.use(compression(), express.json(), express.urlencoded({ extended: true }), cookieParser());

		// Session
		app.use(
			session({
				secret: SESSION_SECRET,
				resave: false,
				saveUninitialized: true,
			})
		);

		// Set view engine and static files
		app.set("view engine", "pug");
		app.set("views", path.join(__dirname, "views"));
		app.use(express.static(path.join(__dirname, "public")));

		// Routes
		app.use("/", IndexRoute);
		app.use("/dashboard", DashboardRoute);
		app.use("/auth", AuthRoute);

		// Start server
		app.listen(PORT, (): void => {
			client.logger.success(`Dashboard is running on port ${PORT}`);
		});
	},
};
