import * as path from "path";
import { Guild, Message } from "discord.js";
import { NevarClient } from "@core/NevarClient";

export class NevarCommand {
	protected guild!: Guild;
	protected data!: any;
	protected interaction!: any;
	protected message!: Message;
	public client: NevarClient;
	public conf: any;
	public help: any;
	public slashCommand: any;

	constructor(client: NevarClient, options: any) {
		const {
			name = null,
			description = null,
			localizedDescriptions = {},
			dirname = null,
			botPermissions = [],
			memberPermissions = [],
			ownerOnly = false,
			staffOnly = false,
			slashCommand = { addCommand: true, data: [] },
		} = options;

		const category: string = path.basename(path.dirname(dirname as string)).toLowerCase();

		this.client = client;
		this.conf = { memberPermissions, botPermissions, ownerOnly, staffOnly };
		this.help = { name, category, description, localizedDescriptions };
		this.slashCommand = slashCommand;
	}

	protected translate(key: string, args?: object): string {
		const requestedKey: string = "commands/" + this.help.category + "/" + this.help.name + ":" + key;
		return this.guild ? this.guild.translate(requestedKey, args) : "Guild is missing in command structure";
	}

	protected getBasicTranslation(key: string, args?: object): string {
		const requestedKey: string = "basics:" + key;
		return this.guild ? this.guild.translate(requestedKey, args) : "Guild is missing in command structure";
	}

	protected getTimeUnitTranslation(key: string): string {
		const requestedKey: string = "timeunits:" + key;
		return this.guild ? this.guild.translate(requestedKey) : "Guild is missing in command structure";
	}

	protected getPermissionTranslation(key: string): string {
		const requestedKey: string = "permissions:" + key;
		return this.guild ? this.guild.translate(requestedKey) : "Guild is missing in command structure";
	}
}
