import BaseClient from "@structures/BaseClient";

export default class BaseContext {
	public client: BaseClient;
	public conf: object;
	public help: object;
	public interaction: any;
	public guild: any;

	constructor(client: BaseClient, options: any) {
		const {
			name = null,
			type = null,
			memberPermissions = [],
			botPermissions = [],
			cooldown = 0
		} = options;

		this.client = client;
		this.conf = { memberPermissions, botPermissions, cooldown, type };
		this.help = { name };
	}

	protected translate(key: string, args?: any): string {
		return this.interaction.guild.translate(key, args);
	}
}