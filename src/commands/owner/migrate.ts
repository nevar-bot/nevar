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
				de: "Migriert Datensätze an das aktuelle Datenbankschema",
			},
			dirname: __dirname,
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
		const count: number = await DatabaseMigration.migrateUsers();
		const embed: EmbedBuilder = this.client.createEmbed(
			this.translate("migratedUsers", { count }),
			"success",
			"success",
		);
		return this.message.reply({ embeds: [embed] });
	}

	private async migrateGuilds(): Promise<any> {
		const count: number = await DatabaseMigration.migrateGuilds();
		const embed: EmbedBuilder = this.client.createEmbed(
			this.translate("migratedGuilds", { count }),
			"success",
			"success",
		);
		return this.message.reply({ embeds: [embed] });
	}

	private async migrateMembers(): Promise<any> {
		const count: number = await DatabaseMigration.migrateMembers();
		const embed: EmbedBuilder = this.client.createEmbed(
			this.translate("migratedMembers", { count }),
			"success",
			"success",
		);
		return this.message.reply({ embeds: [embed] });
	}
}
