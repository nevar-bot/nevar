import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import fs from "fs";
import { EmbedBuilder } from "discord.js";

export default class DisableCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "disable",
			description: "Deaktiviert einen Befehl",
			ownerOnly: true,
			dirname: __dirname,
			slashCommand: {
				addCommand: false,
				data: null,
			},
		});
	}

	private message: any;

	public async dispatch(message: any, args: any[], data: any): Promise<void> {
		this.message = message;
		await this.disableCommand(args[0]);
	}

	private async disableCommand(cmd: string): Promise<void> {
		if (!cmd) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				"Du musst einen Befehl angeben.",
				"error",
				"error",
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		const command: any = this.client.commands.get(cmd);
		if (command) {
			const disabledCommands = JSON.parse(fs.readFileSync("./assets/disabled.json").toString());

			if (disabledCommands.includes(command.help.name)) {
				const alreadyDisabledEmbed: EmbedBuilder = this.client.createEmbed(
					"Der Befehl ist bereits deaktiviert.",
					"error",
					"error",
				);
				return this.message.reply({ embeds: [alreadyDisabledEmbed] });
			}

			disabledCommands.push(command.help.name);
			fs.writeFileSync("./assets/disabled.json", JSON.stringify(disabledCommands, null, 4));
			const disabledEmbed: EmbedBuilder = this.client.createEmbed(
				"Der Befehl wurde deaktiviert.",
				"success",
				"success",
			);
			return this.message.reply({ embeds: [disabledEmbed] });
		} else if (cmd.toLowerCase() === "list") {
			let disabledCommands = JSON.parse(fs.readFileSync("./assets/disabled.json").toString());
			if (disabledCommands.length === 0) disabledCommands = ["Keine Befehle deaktiviert"];
			const disabledListEmbed: EmbedBuilder = this.client.createEmbed(
				"Folgende Befehle sind deaktiviert:\n\n{0} {1}",
				"success",
				"normal",
				this.client.emotes.arrow,
				disabledCommands.join("\n" + this.client.emotes.arrow + " "),
			);
			return this.message.reply({ embeds: [disabledListEmbed] });
		} else {
			const invalidCommandEmbed: EmbedBuilder = this.client.createEmbed(
				"Der Befehl existiert nicht.",
				"error",
				"error",
			);
			return this.message.reply({ embeds: [invalidCommandEmbed] });
		}
	}
}
