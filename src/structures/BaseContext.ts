import BaseClient from "@structures/BaseClient";
import { ApplicationCommandType } from "discord.js";

export default class BaseContext {
	public client: BaseClient;
	public conf: object;
	public help: object;
	public interaction: any;
	public guild: any;

	constructor(
		client: BaseClient,
		{
			name = null,
			type = null,
			memberPermissions = [],
			botPermissions = [],
			cooldown = 0
		}: {
			name?: string | null;
			type?: ApplicationCommandType | null;
			memberPermissions?: string[];
			botPermissions?: string[];
			cooldown?: number;
		}
	) {
		this.client = client;
		this.conf = { memberPermissions, botPermissions, cooldown, type };
		this.help = { name };
	}

	protected translate(key: string, args?: any): string {
		return this.interaction.guild.translate(key, args);
	}
}
