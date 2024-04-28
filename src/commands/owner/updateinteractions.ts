import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";
import { EmbedBuilder } from "discord.js";
import { InteractionManager } from "@handlers/InteractionManager.js";

export default class UpdateinteractionsCommand extends NevarCommand {
	public constructor(client: NevarClient) {
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
		const iManager: InteractionManager = new InteractionManager(this.client);
		const res: any = await iManager.register();
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
