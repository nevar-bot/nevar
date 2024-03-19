import * as fs from "fs";
import * as util from "util";
import * as path from "path";
import { ApplicationCommandType, Events } from "discord.js";
const readdir = util.promisify(fs.readdir);
import Utils from "@helpers/Utils.js";
import BaseClient from "@structures/BaseClient.js";
import { languages } from "@helpers/Language.js";

export default class Loader {
	private client: BaseClient;
	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async loadCommands(): Promise<void> {
		/* Load commands */
		let success: number = 0;
		let failed: number = 0;
		this.client.logger.log("Trying to load commands...");

		/* Read all directories in commands folder */
		const directories: string[] = await readdir("./build/commands/");

		/* Loop through all directories */
		for (const directory of directories) {
			/* Read all files in the directory */
			const commands: string[] = await readdir("./build/commands/" + directory + "/");
			/* Loop through all files */
			for (const command of commands.filter((command: string): boolean => path.extname(command) === ".js")) {
				/* Try to load command */
				if(await this.client.loadCommand("../commands/" + directory, command)){
					/* Command failed to load */
					failed++;
					this.client.logger.error("Error while loading command " + command );
				} else {
					/* Command loaded successfully */
					success++;
				}
			}
		}

		if(failed > 0){
			this.client.logger.error("Attempted to load " + (success + failed) + " commands. Success (" + success + ") Failed (" + failed + ")");
		}else{
			this.client.logger.success("Attempted to load " + (success + failed) + " commands. Success (" + success + ") Failed (" + failed + ")");
		}
	}

	public async loadContexts(): Promise<void> {
		/* Load context menus */
		let success: number = 0;
		let failed: number = 0;
		let userContexts: number = 0;
		let messageContexts: number = 0;
		this.client.logger.log("Trying to load context menus...");

		/* Read all files in the contexts folder */
		const directory: string[] = await readdir("./build/contexts");
		/* Loop through all files */
		for (const context of directory.filter((context: string): boolean => path.extname(context) === ".js")) {
			/* Try to load context menu */
			try {
				/* Import the context menu */
				const importedContext: any = await import("../contexts/" + context);
				/* Create a new instance of the context menu */
				const contextProps: any = new importedContext.default(this.client);
				/* Run the init function if it exists */
				if(contextProps.init){
					contextProps.init(this.client);
				}
				/* Add the context menu to the client */
				this.client.contextMenus.set(contextProps.help.name, contextProps);

				/* Check the type of the context menu */
				if(contextProps.conf.type === ApplicationCommandType.User){
					userContexts++;
				}else if(contextProps.conf.type === ApplicationCommandType.Message){
					messageContexts++;
				}

				success++;
			} catch (e: any) {
				/* Context menu failed to load */
				failed++;
				this.client.logger.error("Error while loading context menu " + context + ": " + e.stack);
			}
		}

		if(failed > 0){
			this.client.logger.error("Attempted to load " + (success + failed) + " context menus (" + userContexts + " user, " + messageContexts + " message). Success (" + success + ") Failed (" + failed + ")");
		}else{
			this.client.logger.success("Attempted to load " + (success + failed) + " context menus (" + userContexts + " user, " + messageContexts + " message). Success (" + success + ") Failed (" + failed + ")");
		}
	}

	public async loadEvents(): Promise<void> {
		/* Load events */
		let success: number = 0;
		let failed: number = 0;
		this.client.logger.log("Trying to load events...");

		/* Loop through all files in the events folder */
		for (const filePath of Utils.recursiveReadDirSync("build/events")) {
			/* Get the file name */
			const file: string = path.basename(filePath);

			/* Try to load the event */
			try {
				/* Clean the path */
				const cleanPath = filePath.split(path.sep).join(path.posix.sep).replace("C:", "");
				/* Get the event name */
				const eventName: string = path.basename(file, ".js");
				/* Import the event */
				const importedEvent = await import(cleanPath);
				/* Create a new instance of the event */
				const EventClass = importedEvent.default;
				// @ts-ignore
				if (!Events[eventName]) Events[eventName] = eventName;

				/* Add event listener */
				// @ts-ignore
				this.client.on(Events[eventName], (...args): void => {
					const eventInstance = new EventClass(this.client);
					eventInstance.dispatch(...args);
				});

				success++;
			} catch (error) {
				/* Event failed to load */
				failed++;
				this.client.logger.error("Error while loading event " + file + ": " + error);
			}
		}

		if(failed > 0){
			this.client.logger.error("Attempted to load " + (success + failed) + " events. Success (" + success + ") Failed (" + failed + ")");
		}else{
			this.client.logger.success("Attempted to load " + (success + failed) + " events. Success (" + success + ") Failed (" + failed + ")");
		}
	}

	public async loadLanguages(): Promise<void> {
		this.client.logger.log("Trying to load languages...");
		this.client.locales = await languages();
		const locales: string = Array.from(this.client.locales.keys()).join(", ");
		this.client.logger.log("Attempted to load " + this.client.locales.size + " languages (" + locales + ")");
	}
}