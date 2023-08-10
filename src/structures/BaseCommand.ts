import * as path from "path";
import BaseClient from "@structures/BaseClient";

export default class BaseCommand {
	public client: BaseClient;
	public conf: object;
	public help: object;
	public slashCommand: object;
	public guild: any;
	public interaction: any;

	constructor(
		client: BaseClient,
		{
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
				data: []
			}
		}: {
			name?: string | null;
			description?: string | null;
			localizedDescriptions?: any | null;
			dirname?: string | null;
			botPermissions?: string[];
			memberPermissions?: string[];
			nsfw?: boolean;
			ownerOnly?: boolean;
			staffOnly?: boolean;
			cooldown?: number;
			slashCommand?: {
				addCommand: boolean;
				data: any;
			};
		}
	) {
		const category: string = dirname
			? (dirname as string).split(path.sep)[parseInt(String((dirname as string).split(path.sep).length - 1), 10)]
			: "Misc";
		this.client = client;
		this.conf = {
			memberPermissions,
			botPermissions,
			nsfw,
			ownerOnly,
			staffOnly,
			cooldown
		};
		this.help = { name, category, description, localizedDescriptions };
		this.slashCommand = slashCommand;
	}

	protected translate(key: string, args?: any): any {
		if (!this.guild) return null;
		return this.guild.translate(key, args);
	}
}
