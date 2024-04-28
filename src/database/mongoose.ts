import * as mongoose from "mongoose";
import { Logger } from "@helpers/Logger.js";

export default {
	async init(client: any): Promise<void> {
		const logger: Logger = new Logger();
		logger.log("Establishing MongoDB connection...");

		try {
			mongoose.set("strictQuery", false);
			await mongoose.connect(client.config.general["MONGO_CONNECTION"]);
			logger.success("MongoDB connection established");
		} catch (e: any) {
			logger.error("Failed establishing MongoDB connection", e);
			process.exit(1);
		}
	},
};
