import "module-alias/register";
import "@helpers/extenders/Guild";

import BaseClient from "@structures/BaseClient";
import { initializeMongoose } from "@database/mongoose";
import Validator from "@helpers/Validator";
import Loader from "@helpers/Loader";

Validator.configValidator();

// Initialize client
const client: BaseClient = new BaseClient();

process.on("unhandledRejection", (e: any) => {
    console.error(e);
    return client.alertException(e);
});

(async () => {
    await initializeMongoose(client);
    await Loader.loadCommands(client);
    await Loader.loadContexts(client);
    await Loader.loadEvents(client);
    await client.login(client.config.general["BOT_TOKEN"]);
})();

export { client };