import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";
import DatabaseMigration from "@helpers/DatabaseMigration";

export default class MigrateCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "migrate",
			description: "Migrates datasets to the current database schema",
			localizedDescriptions: {
				de: "Migriert Datensätze angepasst an das aktuelle Datenbankschema",
			},
			dirname: __dirname,
			staffOnly: true,
			slashCommand: {
				addCommand: false,
				data: null,
			},
		});
	}

	public async dispatch(message: any, args: string[], data: any) {
		this.message = message;
		this.guild = message.guild;
		switch (args[0]) {
			case "users":
				this.migrateUsers();
				break;
			case "guilds":
				this.migrateGuilds();
				break;
			case "members":
				this.migrateMembers();
				break;
			default:
				const embed: EmbedBuilder = this.client.createEmbed(
					this.translate("staff/migrate:errors:wrongOption"),
					"error",
					"error",
				);
				return this.message.reply({ embeds: [embed] });
		}
	}

	private async migrateUsers(): Promise<void> {
		const count: number = await DatabaseMigration.migrateUsers();
		const embed: EmbedBuilder = this.client.createEmbed(
			this.translate("staff/migrate:success_users", { count }),
			"success",
			"success",
		);
		return this.message.reply({ embeds: [embed] });
	}

	private async migrateGuilds(): Promise<void> {
		const count: number = await DatabaseMigration.migrateGuilds();
		const embed: EmbedBuilder = this.client.createEmbed(
			this.translate("staff/migrate:success_guilds", { count }),
			"success",
			"success",
		);
		return this.message.reply({ embeds: [embed] });
	}

	private async migrateMembers(): Promise<void> {
		const count: number = await DatabaseMigration.migrateMembers();
		const embed: EmbedBuilder = this.client.createEmbed(
			this.translate("staff/migrate:success_members", { count }),
			"success",
			"success",
		);
		return this.message.reply({ embeds: [embed] });
	}
}
