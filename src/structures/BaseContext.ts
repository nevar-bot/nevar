import BaseClient from "@structures/BaseClient";
import { CommandInteraction, Guild } from "discord.js";

export default class BaseContext {
	protected client: BaseClient;
	public conf: any;
	public help: any;
	protected interaction!: CommandInteraction;
	protected guild!: Guild;

	public constructor(client: BaseClient, options: any) {
		const { name = null, type = null, memberPermissions = [], botPermissions = [], cooldown = 0 } = options;

		this.client = client;
		this.conf = { memberPermissions, botPermissions, cooldown, type };
		this.help = { name };
	}

	protected translate(key: string, args?: object): string {
		const requestedKey: string = "contexts/" + this.help.name + ":" + key;
		return this.guild ? this.guild.translate(requestedKey, args) : "Guild is missing in context structure";
	}
}
