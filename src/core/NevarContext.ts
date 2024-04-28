import { NevarClient } from "@core/NevarClient";
import { CommandInteraction, Guild } from "discord.js";

export class NevarContext {
	protected client: NevarClient;
	public conf: any;
	public help: any;
	protected interaction!: CommandInteraction;
	protected guild!: Guild;

	public constructor(client: NevarClient, options: any) {
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
