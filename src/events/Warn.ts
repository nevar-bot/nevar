import { NevarClient } from "@core/NevarClient";

export default class {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async dispatch(e: any): Promise<void> {
		console.warn(e);
		await this.client.alert(e, "warning");
	}
}
