import * as path from "path";
import { CommandInteraction, Guild, Message } from "discord.js";
import BaseClient from "@structures/BaseClient";

export default class BaseCommand {
	protected guild!: Guild;
	protected data!: any;
	protected interaction!: CommandInteraction;
	protected message!: Message;
	public client: BaseClient;
	public conf: any;
	public help: any;
	public slashCommand: any;

	constructor(client: BaseClient, options: any) {
		const {
			name = null,
			description = null,
			localizedDescriptions = {},
			dirname = null,
			botPermissions = [],
			memberPermissions = [],
			nsfw = false,
			ownerOnly = false,
			staffOnly = false,
			cooldown = 0,
			slashCommand = { addCommand: true, data: [] },
		} = options;

		const category: string = path.basename(dirname as string).toLowerCase();

		this.client = client;
		this.conf = { memberPermissions, botPermissions, nsfw, ownerOnly, staffOnly, cooldown };
		this.help = { name, category, description, localizedDescriptions };
		this.slashCommand = slashCommand;
	}

	protected translate(key: string, args?: object): string {
		const requestedKey: string = "commands/" + this.help.category + "/" + this.help.name + ":" + key;
		return this.guild ? this.guild.translate(requestedKey, args) : "Guild is missing in command structure";
	}

	protected getBasicTranslation(key: string, args?: object): string {
		const requestedKey: string = "command/" + this.help.category + "/basics:" + key;
		return this.guild ? this.guild.translate(requestedKey, args) : "Guild is missing in command structure";
	}
}
