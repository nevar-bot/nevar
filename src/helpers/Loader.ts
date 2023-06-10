import * as fs from "fs";
import * as util from "util";
import * as path from "path";
import {
    ApplicationCommandType,
    Events
} from "discord.js";
const readdir = util.promisify(fs.readdir);
import Utils from "@helpers/Utils";
import BaseClient from "@structures/BaseClient";

export default class Loader {
    static async loadCommands(client: BaseClient): Promise<void> {
        let success: number = 0;
        let failed: number = 0;
        client.logger.log("Loading commands...");

        const directories: string[] = await readdir("./src/commands/");
        for(const directory of directories){
            const commands = await readdir("./src/commands/" + directory + "/");
            commands.forEach((command) => {
                if(command.split(".")[1] === "js"){
                    const response = client.loadCommand("../commands/" + directory, command);
                    if(response){
                        failed++;
                        client.logger.error("Couldn't load command " + command + ": " + response);
                    }else success++;
                }
            })
        }
        client.logger.log("Loaded " + (success + failed) + " commands. Success (" + success + ") Failed (" + failed + ")");
    }

    static async loadEvents(client: BaseClient): Promise<void> {
        client.logger.log("Loading events...");
        const directory = "build/events";
        let success: number = 0;
        let failed: number = 0;

        for (const filePath of Utils.recursiveReadDirSync(directory)) {
            const file = path.basename(filePath);
            try {
                const eventName: string = path.basename(file, ".js");
                const event = new (await import(filePath)).default(client);
                // @ts-ignore - Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'typeof Events'
                if(!Events[eventName]) Events[eventName] = eventName;
                // @ts-ignore - Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'typeof Events'
                client.on(Events[eventName], (...args) => event.dispatch(...args));
                success++;
                delete require.cache[require.resolve(filePath)];
            }catch(e: any){
                failed++;
                client.logger.error("Couldn't load event " + file + ": " + e);
            }
        }
        client.logger.log("Loaded " + (success + failed) + " events. Success (" + success + ") Failed (" + failed + ")");
    }

    static async loadContexts(client: BaseClient): Promise<void> {
        let success: number = 0;
        let failed: number = 0;
        let userContexts: number = 0;
        let messageContexts: number = 0;
        client.logger.log("Loading context menus...");

        const directory = await readdir("./src/contexts");
        for(const context of directory){
            if(context.split(".")[1] === "js"){
                try {
                    const props = new (await import("@contexts/" + context)).default(client)
                    if(props.init){
                        props.init(client);
                    }
                    client.contextMenus.set(props.help.name, props);
                    if(props.help.type === ApplicationCommandType.User) userContexts++;
                    else if(props.help.type === ApplicationCommandType.Message) messageContexts++;
                    success++;
                }catch(e: any){
                    failed++;
                    client.logger.error("Couldn't load context menu " + context + ": " + e);
                }
            }
        }
        client.logger.log("Loaded " + (success + failed) + " context menus (" + userContexts + " user, " + messageContexts + " message). Success (" + success + ") Failed (" + failed + ")");
    }
}

