/* Import required modules */
import "module-alias/register.js";
import "source-map-support/register.js";
import "@helpers/DiscordGuildExtender.js";

/* Import classes */
import { NevarClient } from "@core/NevarClient.js";
import { NevarLoader } from "@helpers/NevarLoader.js";
import { NevarValidator } from "@helpers/NevarValidator.js";

const nevar: NevarClient = new NevarClient();

/* Initiate Nevar */
async function initiate(): Promise<NevarClient> {
	try {
		const validator: NevarValidator = new NevarValidator();
		await validator.validateConfigFile();

		const loader: NevarLoader = new NevarLoader(nevar);
		await loader.loadDatabase();
		await loader.loadCommands();
		await loader.loadContextMenus();
		await loader.loadEvents();
		await loader.loadLanguages();
		await loader.login();
	}catch(error: any){
		console.error("Error while initializing the bot: ", error);
	}

	return nevar;
}

(async (): Promise<NevarClient> => await initiate())();
export { nevar as client };