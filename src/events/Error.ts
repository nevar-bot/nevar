import { NevarClient } from "@core/NevarClient";

export default class {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async dispatch(e: any): Promise<void> {
		console.error(e);
		await this.client.alertException(e);
	}
}
