import BaseClient from "@structures/BaseClient";

export default class
{
	private client: BaseClient;

	public constructor(client: BaseClient)
	{
		this.client = client;
	}

	public async dispatch(e: any): Promise<void>
	{
		console.warn(e);
		await this.client.alert(e, "warning");
	}
}