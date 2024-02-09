import "module-alias/register.js";
import "source-map-support/register.js";
import "@helpers/extenders/Guild.js";


import BaseClient from "@structures/BaseClient.js";
import mongoose from "@database/mongoose.js";
import Validator from "@helpers/Validator.js";
import Loader from "@helpers/Loader.js";

Validator.configValidator();

const client: BaseClient = new BaseClient();

process.on("unhandledRejection", (e: Error): void => {
	console.error(e);
	return client.alertException(e);
});

(async (): Promise<void> => {
	await mongoose.init(client);
	await Loader.loadCommands(client);
	await Loader.loadContexts(client);
	await Loader.loadEvents(client);
	await Loader.loadLanguages(client);
	await client.login(client.config.general["BOT_TOKEN"]);
})();

export { client };
