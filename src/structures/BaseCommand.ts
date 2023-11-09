import * as path from "path";
import BaseClient from "@structures/BaseClient";

export default class BaseCommand {
	public client: BaseClient;
	public conf: object;
	public help: any;
	public slashCommand: object;
	public guild: any;
	public interaction: any;
	public message: any;

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
			slashCommand = {
				addCommand: true,
				data: [],
			},
		} = options;

		const category: string = (dirname as string).split(path.sep)[parseInt(String((dirname as string).split(path.sep).length - 1), 10)]

		this.client = client;
		this.conf = { memberPermissions, botPermissions, nsfw, ownerOnly, staffOnly, cooldown };
		this.help = { name, category, description, localizedDescriptions };
		this.slashCommand = slashCommand;
	}

	protected translate(key: string, args?: any, isFullPath?: boolean): any {
		let languageKey: string = key;
		if (!isFullPath) languageKey = `${this.help.category.toLowerCase()}/${this.help.name}:${key}`;
		if (!this.guild) return "Please provide a guild!";
		return this.guild.translate(languageKey, args);
	}
}
