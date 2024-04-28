import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";
import { EmbedBuilder } from "discord.js";
import { DatabaseMigration } from "@helpers/DatabaseMigration.js";
import path from "path";

export default class MigrateCommand extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "migrate",
			description: "Migrates datasets to the current database schema",
			localizedDescriptions: {
				de: "Migriert Datensätze an das aktuelle Datenbankschema",
			},
			dirname: import.meta.url,
			ownerOnly: true,
			slashCommand: {
				addCommand: false,
				data: null,
			},
		});
	}

	public async dispatch(message: any, args: string[], data: any) {
		this.message = message;
		this.guild = message.guild;
		this.data = data;
		switch (args[0]) {
			case "users":
				await this.migrateUsers();
				break;
			case "guilds":
				await this.migrateGuilds();
				break;
			case "members":
				await this.migrateMembers();
				break;
			default:
				const embed: EmbedBuilder = this.client.createEmbed(
					this.translate("errors:optionIsMissing"),
					"error",
					"error",
				);
				return this.message.reply({ embeds: [embed] });
		}
	}

	private async migrateUsers(): Promise<any> {
		const migration: DatabaseMigration = new DatabaseMigration();
		const count: number = await migration.migrateUsers();
		const embed: EmbedBuilder = this.client.createEmbed(
			this.translate("migratedUsers", { count }),
			"success",
			"success",
		);
		return this.message.reply({ embeds: [embed] });
	}

	private async migrateGuilds(): Promise<any> {
		const migration: DatabaseMigration = new DatabaseMigration();
		const count: number = await migration.migrateGuilds();
		const embed: EmbedBuilder = this.client.createEmbed(
			this.translate("migratedGuilds", { count }),
			"success",
			"success",
		);
		return this.message.reply({ embeds: [embed] });
	}

	private async migrateMembers(): Promise<any> {
		const migration: DatabaseMigration = new DatabaseMigration();
		const count: number = await migration.migrateMembers();
		const embed: EmbedBuilder = this.client.createEmbed(
			this.translate("migratedMembers", { count }),
			"success",
			"success",
		);
		return this.message.reply({ embeds: [embed] });
	}
}
