import BaseCommand from "@structures/BaseCommand.js";
import BaseClient from "@structures/BaseClient.js";
import { EmbedBuilder } from "discord.js";
import registerInteractions from "@handlers/registerInteractions.js";
import path from "path";

export default class UpdateinteractionsCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "updateinteractions",
			description: "Update slash commands and context menus",
			localizedDescriptions: {
				de: "Update Slash-Commands und Kontext-Menüs"
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
		await this.updateInteractions();
	}

	private async updateInteractions(): Promise<any> {
		const res: any = await registerInteractions(this.client);
		if (res.success) {
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("updatedInteractions", { count: res.interactionsRegistered }),
				"slashcommand",
				"success",
			);
			return this.message.reply({ embeds: [successEmbed] });
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:errorWhileRegisteringInteractions"),
				"error",
				"error",
			);
			return this.message.reply({ embeds: [errorEmbed] });
		}
	}
}
