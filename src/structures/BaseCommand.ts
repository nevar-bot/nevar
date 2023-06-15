import * as path from "path";
import BaseClient from "@structures/BaseClient";

export default class BaseCommand
{
    public client: BaseClient;
    public conf: object;
    public help: object;
    public slashCommand: object;

    constructor(client: BaseClient, {
            name = null,
            description = null,
            dirname = null,
            botPermissions = [],
            memberPermissions = [],
            nsfw = false,
            ownerOnly = false,
            staffOnly = false,
            cooldown = 0,
            slashCommand = {
                addCommand: true,
                options: [],
            },
        }
    ) {
        const category = dirname
            ? (dirname as string).split(path.sep)[
                parseInt(String((dirname as string).split(path.sep).length - 1), 10)
                ]
            : "Misc";
        this.client = client;
        this.conf = {
            memberPermissions,
            botPermissions,
            nsfw,
            ownerOnly,
            staffOnly,
            cooldown,
        };
        this.help = { name, category, description };
        this.slashCommand = slashCommand;
    }
}
