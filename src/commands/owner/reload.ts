import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";

export default class ReloadCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "reload",
			description: "Lädt einen Befehl neu",
			ownerOnly: true,
			dirname: __dirname,
			slashCommand: {
				addCommand: false,
				data: null
			}
		});
	}

	private message: any;

	public async dispatch(message: any, args: any[], data: any): Promise<void> {
		this.message = message;
		await this.reloadCommand(args[0]);
	}

	private async reloadCommand(cmd: string): Promise<void> {
		if (!cmd) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Du musst einen Befehl angeben.", "error", "error");
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		const command: any = this.client.commands.get(cmd);
		if (command) {
			await this.client.unloadCommand(command.conf.location, command.help.name);
			await this.client.loadCommand(command.conf.location, command.help.name);

			const reloadEmbed: EmbedBuilder = this.client.createEmbed("Der Befehl wurde neugeladen.", "success", "success");
			return this.message.reply({ embeds: [reloadEmbed] });
		} else {
			const invalidCommandEmbed: EmbedBuilder = this.client.createEmbed("Der Befehl existiert nicht.", "error", "error");
			return this.message.reply({ embeds: [invalidCommandEmbed] });
		}
	}
}
