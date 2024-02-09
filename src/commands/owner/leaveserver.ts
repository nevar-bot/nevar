import BaseCommand from "@structures/BaseCommand.js";
import BaseClient from "@structures/BaseClient.js";
import { EmbedBuilder } from "discord.js";
import path from "path";

export default class LeaveserverCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "leaveserver",
			description: "Let the bot leave a server",
			localizedDescriptions: {
				de: "Lasse den Bot einen Server verlassen"
			},
			ownerOnly: true,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: false,
				data: null,
			},
		});
	}

	public async dispatch(message: any, args: any[], data: any): Promise<void> {
		this.message = message;
		this.guild = message.guild;
		this.data = data;
		await this.leaveServer(args[0]);
	}

	private async leaveServer(guildID: string): Promise<any> {
		if (!guildID) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:guildIdIsMissing"),
				"error",
				"error",
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		const guild: any = this.client.guilds.cache.get(guildID);

		if (!guild) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:guildNotFound"),
				"error",
				"error",
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		if (guild.id === this.client.config.support["ID"]) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:cantLeaveSupportGuild"),
				"error",
				"error",
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		await guild.leave();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("leftGuild", { guild: guild.name }),
			"success",
			"success"
		);
		return this.message.reply({ embeds: [successEmbed] });
	}
}
