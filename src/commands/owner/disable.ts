import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";
import fs from "fs";
import { EmbedBuilder } from "discord.js";

export default class DisableCommand extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "disable",
			description: "Deactivate a command",
			localizedDescriptions: {
				de: "Deaktiviere einen Befehl"
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
		await this.disableCommand(args[0]);
	}

	private async disableCommand(cmd: string): Promise<any> {
		if (!cmd) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:commandIsMissing"),
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
					this.translate("errors:commandIsAlreadyDisabled"),
					"error",
					"error",
				);
				return this.message.reply({ embeds: [alreadyDisabledEmbed] });
			}

			disabledCommands.push(command.help.name);
			fs.writeFileSync("./assets/disabled.json", JSON.stringify(disabledCommands, null, 4));
			const disabledEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("disabledCommand"),
				"success",
				"success",
			);
			return this.message.reply({ embeds: [disabledEmbed] });
		} else if (cmd.toLowerCase() === "list") {
			let disabledCommands = JSON.parse(fs.readFileSync("./assets/disabled.json").toString());
			const disabledArray: any[] = [];
			for(let command of disabledCommands){
				disabledArray.push(this.client.emotes.arrow + " " + command);
			}

			await this.client.utils.sendPaginatedEmbedMessage(this.message, 10, disabledArray, this.translate("list:title"), this.translate("list:noDisabledCommand"))
		} else {
			const invalidCommandEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:commandNotFound"),
				"error",
				"error",
			);
			return this.message.reply({ embeds: [invalidCommandEmbed] });
		}
	}
}
