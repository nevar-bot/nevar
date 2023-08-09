import BaseClient from "@structures/BaseClient";

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(e: any): Promise<void> {
		console.error(e);
		await this.client.alertException(e);
	}
}
