import 'module-alias/register';
import 'source-map-support/register';
import '@helpers/extenders/Guild';

import BaseClient from '@structures/BaseClient';
import mongoose from '@database/mongoose';
import Validator from '@helpers/Validator';
import Loader from '@helpers/Loader';

Validator.configValidator();

/* Initialize client */
const client: BaseClient = new BaseClient();

process.on('unhandledRejection', (e: any): any => {
	console.error(e);
	return client.alertException(e);
});

(async (): Promise<void> => {
	await mongoose.init(client);
	await Loader.loadCommands(client);
	await Loader.loadContexts(client);
	await Loader.loadEvents(client);
	await Loader.loadLanguages(client);
	await client.login(client.config.general['BOT_TOKEN']);
})();

export { client };
