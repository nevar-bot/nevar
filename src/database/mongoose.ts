import * as mongoose from "mongoose";
import Logger from "@helpers/Logger";

export default {
    async init(client: any): Promise<void> {
        Logger.log("Establishing MongoDB connection...");

        try {
            mongoose.set("strictQuery", false);
            await mongoose.connect(client.config.general["MONGO_CONNECTION"], {
                keepAlive: true
            });
            Logger.success("MongoDB connection established");
        }catch(e: any) {
            Logger.error("Failed establishing MongoDB connection", e);
            process.exit(1);
        }
    }
}