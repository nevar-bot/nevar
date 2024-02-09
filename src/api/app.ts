import express, {Express, NextFunction, Request, Response} from "express";
import cors from "cors";
import helmet from "helmet";
import GuildsRouter from "@api/routes/GuildsRouter.js";
import GeneralRouter from "@api/routes/GeneralRouter.js";
import InteractionsRouter from "@api/routes/InteractionsRouter.js";
import MessagesRouter from "@api/routes/MessagesRouter.js";
import LevelsRouter from "@api/routes/LevelsRouter.js";
import VotesRouter from "@api/routes/VotesRouter.js";

export default {
	async init(client: any): Promise<void> {
		const app: Express = express();

		app.use(helmet());
		app.use(express.json());
		app.use(cors());

		app.use((error: SyntaxError, req: Request, res: Response, next: NextFunction): void => {
			if(error instanceof SyntaxError && error.status === 400 && "body" in error) {
				return res.status(400).send({ status: 400, status_message: error.message })
			}
			next();
		})

		app.use("/guilds", GuildsRouter);
		app.use("/general", GeneralRouter);
		app.use("/interactions", InteractionsRouter);
		app.use("/messages", MessagesRouter);
		app.use("/levels", LevelsRouter);
		app.use("/votes", VotesRouter);

		app.listen(client.config.api["PORT"], (): void => {
			client.logger.log("API is running on port " + client.config.api["PORT"]);
		});
	},
};
