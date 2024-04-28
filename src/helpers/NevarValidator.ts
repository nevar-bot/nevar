import fs from "fs";
import * as toml from "toml";
import { Logger } from "@helpers/Logger.js";

export class NevarValidator {
	private config: any;
	private logger: Logger;
	public constructor() {
		this.logger = new Logger();
	}

	public async validateConfigFile(): Promise<void> {
		this.logger.log("TOML: Validating config file...");

		/* Check if config file exists */
		if (!fs.existsSync("./config.toml")) {
			if (fs.existsSync("./config-sample.toml")) {
				this.logger.error("TOML: config.toml does not exist. Make sure to rename config-sample.toml to config.toml");
			} else {
				this.logger.error("TOML: config.toml does not exist. Make sure to run 'npm run config'");
			}
			return process.exit();
		}

		this.config = toml.parse(fs.readFileSync("./config.toml", "utf8"));

		/* Check mandatory fields */
		this.checkMandatoryFields(this.config, [
			["general", "BOT_TOKEN"],
			["general", "MONGO_CONNECTION"],
			["general", "WEBSITE"],
			["support", "ID"],
			["support", "INVITE"],
			["support", "BOT_LOG"],
			["support", "ERROR_LOG"],
			["embeds", "FOOTER_TEXT"],
			["embeds", "DEFAULT_COLOR"],
			["embeds", "SUCCESS_COLOR"],
			["embeds", "WARNING_COLOR"],
			["embeds", "ERROR_COLOR"],
			["embeds", "TRANSPARENT_COLOR"],
			["api", "ENABLED"],
			["dashboard", "ENABLED"]
		]);


		/* Check mandatory fields for correct type */
		this.checkFieldsType(this.config, [
			["general", "BOT_TOKEN", "string"],
			["general", "MONGO_CONNECTION", "string"],
			["general", "WEBSITE", "string"],
			["support", "ID", "string"],
			["support", "INVITE", "string"],
			["support", "BOT_LOG", "string"],
			["support", "ERROR_LOG", "string"],
			["embeds", "FOOTER_TEXT", "string"],
			["embeds", "DEFAULT_COLOR", "string"],
			["embeds", "SUCCESS_COLOR", "string"],
			["embeds", "WARNING_COLOR", "string"],
			["embeds", "ERROR_COLOR", "string"],
			["embeds", "TRANSPARENT_COLOR", "string"],
			["api", "ENABLED", "boolean"],
			["dashboard", "ENABLED", "boolean"]
		]);

		/* Check if api is enabled */
		if(this.config.api["ENABLED"]){
			/* If api is enabled, check for mandatory api fields */
			this.checkMandatoryFields(this.config, [
				["api", "PORT"],
				["api", "AUTHORIZATION"]
			]);

			/* Check mandatory api fields for correct type */
			this.checkFieldsType(this.config, [
				["api", "PORT", "number"],
				["api", "AUTHORIZATION", "string"]
			]);
		}

		/* Check if dashboard is enabled */
		if(this.config.dashboard["ENABLED"]){
			/* If dashboard is enabled, check for mandatory dashboard fields */
			this.checkMandatoryFields(this.config, [
				["dashboard", "PORT"],
				["dashboard", "CALLBACK_URI"],
				["dashboard", "CLIENT_SECRET"],
				["dashboard", "SESSION_SECRET"],
				["dashboard", "ENCRYPTION_KEY"],
			]);

			/* Check mandatory dashboard fields for correct type */
			this.checkFieldsType(this.config, [
				["dashboard", "PORT", "number"],
				["dashboard", "CALLBACK_URI", "string"],
				["dashboard", "CLIENT_SECRET", "string"],
				["dashboard", "SESSION_SECRET", "string"],
				["dashboard", "ENCRYPTION_KEY", "string"]
			]);
		}

		/* Check if api and dashboard ports are the same */
		if(this.config.api["ENABLED"] && this.config.dashboard["ENABLED"]){
			if(this.config.api["PORT"] === this.config.dashboard["PORT"]){
				this.logger.error("TOML: API and Dashboard ports cannot be the same");
				process.exit();
			}
		}

		/* Check optional fields */
		this.checkOptionalFields(this.config, [
			["general", "OWNER_IDS"],
			["channels", "VOTE_ANNOUNCEMENT_ID"],
			["apikeys", "TOP_GG"],
			["apikeys", "TOP_GG_AUTH"],
			["apikeys", "WEATHER"],
			["apikeys", "GOOGLE"],
			["apikeys", "TWITCH_CLIENT_ID"],
			["apikeys", "TWITCH_CLIENT_SECRET"]
		])

		this.logger.success("TOML: Validated config file");
	}

	private checkMandatoryFields(config: any, sections: string[][]): void {
		for (const [section, field] of sections) {
			if (!config[section]?.[field]) {
				this.logger.error("TOML: " + section + "." + field + " cannot be empty");
				process.exit();
			}
		}
	}

	private checkOptionalFields(config: any, sections: string[][]): void {
		for (const [section, field] of sections) {
			if (!config[section]?.[field]) {
				this.logger.warn("TOML: " + section + "." + field + " is empty");
			}
		}
	}

	private checkFieldsType(config: any, sections: string[][]): void {
		for (const [section, field, type] of sections) {
			if (typeof config[section]?.[field] !== type) {
				this.logger.error("TOML: " + section + "." + field + " must be " + type);
				process.exit();
			}
		}
	}
}
