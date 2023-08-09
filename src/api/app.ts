import express, { Express } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import fs from "fs";

export default {
	async init(client: any): Promise<void> {
		const app: Express = express();

		app.use(helmet());
		app.use(bodyParser.json());
		app.use(cors());

		const files: string[] = fs.readdirSync("./build/api/routes");

		for (const file of files) {
			if (!file.endsWith(".js")) {
				if (file.endsWith(".map")) continue;
				const nestedFiles: string[] = fs.readdirSync(
					"./build/api/routes/" + file
				);
				for (const nestedFile of nestedFiles) {
					if (nestedFile.endsWith(".js")) {
						new (
							await import(
								"@api/routes/" + file + "/" + nestedFile
							)
						).default(app);
					}
				}
			} else {
				new (await import("@api/routes/" + file)).default(app);
			}
		}

		app.listen(client.config.api["PORT"], (): void => {
			client.logger.log(
				"API is running on port " + client.config.api["PORT"]
			);
		});
	}
};
