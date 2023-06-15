import BaseClient from "@structures/BaseClient";

export default class BaseContext
{
    public client: BaseClient;
    public conf: object;
    public help: object;

    constructor(client: BaseClient, {
            name = null,
            type = null,
            memberPermissions = [],
            botPermissions = [],
            cooldown = 0,
        }
    ) {
        this.client = client;
        this.conf = { memberPermissions, botPermissions, cooldown, type };
        this.help = { name };
    }
}
