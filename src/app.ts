/* Import required modules */
import "module-alias/register.js";
import "source-map-support/register.js";
import "@helpers/extenders/Guild.js";

/* Import classes */
import BaseClient from "@structures/BaseClient.js";
import mongoose from "@database/mongoose.js";
import Validator from "@helpers/Validator.js";
import Loader from "@helpers/Loader.js";

const client: BaseClient = new BaseClient();
async function main(): Promise<void> {
	try {
		Validator.configValidator();

		process.on("unhandledRejection", (e: Error): void => {
			console.error(e);
			return client.alertException(e);
		});

		await mongoose.init(client);
		
		const loader: Loader = new Loader(client);
		await loader.loadCommands();
		await loader.loadContexts();
		await loader.loadEvents();
		await loader.loadLanguages();
		await client.login(client.config.general["BOT_TOKEN"]);
	}catch(error: any){
		console.error("Error while initializing the bot: ", error);
	}
}

main();

export { client };



