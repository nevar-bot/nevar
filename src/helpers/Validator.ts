import * as fs from "fs";
import * as toml from "toml";
import Logger from "@helpers/Logger";

export default class Validator
{
	static configValidator(): void
	{
		Logger.log("TOML: Validating config file...");
		if (!fs.existsSync("./config.toml")) {
			if (fs.existsSync("./config-sample.toml")) {
				Logger.error("TOML: config.toml does not exist. Make sure to rename config-sample.toml to config.toml");
			} else {
				Logger.error("TOML: config.toml does not exist. Make sure to run 'npm run build'");
			}
			return process.exit();
		}
		const config: any = toml.parse(fs.readFileSync("./config.toml", "utf-8"));

		/* Check token */
		if (!config.general["BOT_TOKEN"]) {
			Logger.error("TOML: general.BOT_TOKEN cannot be empty");
			return process.exit();
		}

		/* Mongo connection url */
		if (!config.general["MONGO_CONNECTION"]) {
			Logger.error("TOML: general.MONGO_CONNECTION cannot be empty");
			return process.exit();
		}

		/* Website */
		if (!config.general["WEBSITE"]) {
			Logger.error("TOML: general.WEBSITE cannot be empty");
			return process.exit();
		}

		/* Bot log channel id */
		if (!config.support["BOT_LOG"]) {
			Logger.error("TOML: support.BOT_LOG cannot be empty");
			return process.exit();
		}

		/* Error log channel id */
		if (!config.support["ERROR_LOG"]) {
			Logger.error("TOML: support.ERROR_LOG cannot be empty");
			return process.exit();
		}

		/* Api */
		if (typeof config.api["ENABLED"] !== "boolean") {
			Logger.error("TOML: api.ENABLED must be either true or false");
			return process.exit();
		}

		/* Api port, if api is enabled */
		if (config.api["ENABLED"] && isNaN(config.api["PORT"])) {
			Logger.error(
				"TOML: api.PORT has to be an integer when api.ENABLED is true"
			);
			return process.exit();
		}

		/* Warn if any of the following are empty */
		if (config.general["OWNER_IDS"].length === 0)
			Logger.warn("TOML: general.OWNER_IDS is empty");
		if (!config.support["ID"])
			Logger.warn("TOML: support.ID is empty");
		if (!config.support["INVITE"])
			Logger.warn("TOML: support.INVITE is empty");
		if (!config.embeds["DEFAULT_COLOR"])
			Logger.warn("TOML: embeds.DEFAULT_COLOR is empty");
		if (!config.embeds["SUCCESS_COLOR"])
			Logger.warn("TOML: embeds.SUCCESS_COLOR is empty");
		if (!config.embeds["WARNING_COLOR"])
			Logger.warn("TOML: embeds.WARNING_COLOR is empty");
		if (!config.embeds["WARNING_COLOR"])
			Logger.warn("TOML: embeds.WARNING_COLOR is empty");
		if (!config.embeds["ERROR_COLOR"])
			Logger.warn("TOML: embeds.ERROR_COLOR is empty");
		if (!config.channels["SERVER_COUNT_ID"])
			Logger.warn("TOML: channels.SERVER_COUNT_ID is empty");
		if (!config.channels["USER_COUNT_ID"])
			Logger.warn("TOML: channels.USER_COUNT_ID is empty");
		if (!config.channels["VOTE_COUNT_ID"])
			Logger.warn("TOML: channels.VOTE_COUNT_ID is empty");
		if (!config.channels["VOTE_ANNOUNCEMENT_ID"])
			Logger.warn("TOML: channels.VOTE_ANNOUNCEMENT_ID is empty");
		if (!config.apikeys["AMARI_BOT"])
			Logger.warn("TOML: apikeys.AMARI_BOT is empty. Amari level as a giveaway requirement won't work");
		if (!config.apikeys["TOP_GG"])
			Logger.warn("TOML: apikeys.TOP_GG is empty. Posting stats to discordbotlist.com and receiving votes won't work");
		if (!config.apikeys["TOP_GG_AUTH"])
			Logger.warn("TOML: apikeys.TOP_GG_AUTH is empty. Receiving votes from discordbotlist.com won't work");
		if (!config.apikeys["WEATHER"])
			Logger.warn("TOML: apikeys.WEATHER is empty. Weather command won't work");
		if (!config.apikeys["OPENAI"])
			Logger.warn("TOML: apikeys.OPENAI is empty. Weather command won't work");
		if (!config.apikeys["GOOGLE"])
			Logger.warn("TOML: apikeys.GOOGLE is empty. Weather command won't work");

		Logger.success("TOML: Validated config file");
	}
}
