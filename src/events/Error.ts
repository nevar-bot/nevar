import BaseClient from "@structures/BaseClient";

export default class {
    public client: BaseClient;

    constructor(client: BaseClient) {
        this.client = client;
    }

    public async dispatch(e: any): Promise<void> {
        console.error(e);
        await this.client.alertException(e);
    }
}