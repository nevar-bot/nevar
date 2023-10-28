import * as fs from "fs";
import * as toml from "toml";
import Logger from "@helpers/Logger";

export default class Validator {
	static checkMandatoryFields(config: any, sections: string[][]): void {
		for (const [section, field] of sections) {
			if (!config[section]?.[field]) {
				Logger.error(`TOML: ${section}.${field} cannot be empty`);
				process.exit();
			}
		}
	}

	static checkOptionalFields(config: any, sections: string[][]): void {
		for (const [section, field] of sections) {
			if (!config[section]?.[field]) {
				Logger.warn(`TOML: ${section}.${field} is empty`);
			}
		}
	}

	static validateType(config: any, sections: string[][], type: string): void {
		for (const [section, field] of sections) {
			if (typeof config[section]?.[field] !== type) {
				Logger.error(`TOML: ${section}.${field} must be ${type}`);
				process.exit();
			}
		}
	}

	static configValidator(): void {
		Logger.log("TOML: Validating config file...");
		if (!fs.existsSync("./config.toml")) {
			if (fs.existsSync("./config-sample.toml")) {
				Logger.error("TOML: config.toml does not exist. Make sure to rename config-sample.toml to config.toml");
			} else {
				Logger.error("TOML: config.toml does not exist. Make sure to run 'npm run config'");
			}
			return process.exit();
		}

		const config = toml.parse(fs.readFileSync("./config.toml", "utf-8"));

		// Validate Mandatory Fields
		this.checkMandatoryFields(config, [
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
			["embeds", "TRANSPARENT_COLOR"]
		]);

		// Validate Type
		this.validateType(
			config,
			[
				["api", "ENABLED"],
				["dashboard", "ENABLED"]
			],
			"boolean"
		);

		// Additional validation for API and Dashboard ports
		if (config.api["ENABLED"] && isNaN(config.api["PORT"])) {
			Logger.error("TOML: api.PORT has to be a valid port when api.ENABLED is true");
			return process.exit();
		}

		if (config.dashboard["ENABLED"]) {
			this.checkMandatoryFields(config, [
				["dashboard", "PORT"],
				["dashboard", "CALLBACK_URI"],
				["dashboard", "CLIENT_SECRET"],
				["dashboard", "SESSION_SECRET"],
				["dashboard", "ENCRYPTION_KEY"]
			]);
		}

		// Validate Optional Fields
		this.checkOptionalFields(config, [
			["channels", "SERVER_COUNT_ID"],
			["channels", "USER_COUNT_ID"],
			["channels", "VOTE_COUNT_ID"],
			["channels", "VOTE_ANNOUNCEMENT_ID"],
			["apikeys", "TOP_GG"],
			["apikeys", "TOP_GG_AUTH"],
			["apikeys", "WEATHER"],
			["apikeys", "OPENAI"],
			["apikeys", "GOOGLE"],
			["apikeys", "TWITCH_CLIENT_ID"],
			["apikeys", "TWITCH_CLIENT_SECRET"]
		]);

		Logger.success("TOML: Validated config file");
	}
}
