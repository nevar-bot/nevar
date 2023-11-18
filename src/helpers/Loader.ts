import * as fs from "fs";
import * as util from "util";
import * as path from "path";
import { ApplicationCommandType, Events } from "discord.js";
const readdir = util.promisify(fs.readdir);
import Utils from "@helpers/Utils";
import BaseClient from "@structures/BaseClient";
import { languages } from "@helpers/Language";

export default class Loader {
	static async loadCommands(client: BaseClient): Promise<void> {
		let success: number = 0;
		let failed: number = 0;
		client.logger.log("Loading commands...");

		const directories: string[] = await readdir("./build/commands/");
		for (const directory of directories) {
			const commands: string[] = await readdir("./build/commands/" + directory + "/");
			for (const command of commands) {
				if (path.extname(command) !== ".js") continue;
				const response = await client.loadCommand("../commands/" + directory, command);
				if (response) {
					failed++;
					client.logger.error("Couldn't load command " + command + ": " + response.stack);
				} else success++;
			}
		}
		client.logger.log(
			"Loaded " +
				(success + failed) +
				" commands. Success (" +
				success +
				") Failed (" +
				failed +
				")"
		);
	}

	static async loadEvents(client: BaseClient): Promise<void> {
		client.logger.log("Loading events...");
		const directory = "build/events";
		let success: number = 0;
		let failed: number = 0;

		for (const filePath of Utils.recursiveReadDirSync(directory)) {
			const file: string = path.basename(filePath);
			try {
				const eventName: string = path.basename(file, ".js");
				const event = new (await import(filePath)).default(client);
				// @ts-ignore - Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'typeof Events'
				if (!Events[eventName]) Events[eventName] = eventName;
				// @ts-ignore - Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'typeof Events'
				client.on(Events[eventName], (...args) => event.dispatch(...args));
				success++;
				delete require.cache[require.resolve(filePath)];
			} catch (e: any) {
				failed++;
				client.logger.error("Couldn't load event " + file + ": " + e);
			}
		}
		client.logger.log(
			"Loaded " +
				(success + failed) +
				" events. Success (" +
				success +
				") Failed (" +
				failed +
				")"
		);
	}

	static async loadContexts(client: BaseClient): Promise<void> {
		let success: number = 0;
		let failed: number = 0;
		let userContexts: number = 0;
		let messageContexts: number = 0;
		client.logger.log("Loading context menus...");

		const directory: any = await readdir("./build/contexts");
		for (const context of directory) {
			if (path.extname(context) !== ".js") continue;
			try {
				const props = new (await import("../contexts/" + context)).default(client);
				if (props.init) {
					props.init(client);
				}
				client.contextMenus.set(props.help.name, props);
				if (props.help.type === ApplicationCommandType.User) userContexts++;
				else if (props.help.type === ApplicationCommandType.Message) messageContexts++;
				success++;
			} catch (e: any) {
				failed++;
				client.logger.error("Couldn't load context menu " + context + ": " + e);
			}
		}
		client.logger.log(
			"Loaded " +
				(success + failed) +
				" context menus (" +
				userContexts +
				" user, " +
				messageContexts +
				" message). Success (" +
				success +
				") Failed (" +
				failed +
				")"
		);
	}

	static async loadLanguages(client: BaseClient): Promise<void> {
		client.locales = await languages();
		const locales: string = Array.from(client.locales.keys()).join(", ");
		client.logger.log("Loaded " + client.locales.size + " languages (" + locales + ")");
	}
}
