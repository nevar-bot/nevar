import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { ButtonBuilder, EmbedBuilder } from "discord.js";

export default class EvaluateCommand extends BaseCommand {
	constructor(client: BaseClient) {
		super(client, {
			name: "evaluate",
			description: "Führt gegebenen Code aus",
			ownerOnly: true,
			dirname: __dirname,
			slashCommand: { addCommand: false, data: null },
		});
	}

	async dispatch(message: any, args: any[]): Promise<void> {
		this.message = message;
		await this.evaluate(args.join(" "));
	}

	private async evaluate(code: string): Promise<any> {
		const blacklist: string[] = ["require", "process", "child_process", "fs", "os", "path", "config", "token"];

		if (blacklist.some((term: string) => code.includes(term))) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				"Der Code enthält nicht erlaubte Begriffe.",
				"error",
				"error",
			);
			return this.message.reply({ embeds: [errorEmbed] });
		} else {
			try {
				const safeCode: string = code.replaceAll("```", "");
				const response: any = await eval(safeCode);

				const deleteButton: ButtonBuilder = this.client.createButton(
					"delete",
					"Response löschen",
					"Secondary",
					this.client.emotes.delete,
					false,
				);
				const buttonRow: any = this.client.createMessageComponentsRow(deleteButton);
				const responseMessage: any = await this.message.channel.send({
					content: `\`\`\`js\n${JSON.stringify(response, null, 2)}\`\`\``,
					components: [buttonRow],
				});

				const buttonCollector = responseMessage.createMessageComponentCollector({
					filter: (i: any): boolean => i.user.id === this.message.author.id,
					time: 60000,
				});
				buttonCollector.on("collect", async (i: any): Promise<void> => i.message.delete());
			} catch (e) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(`${e}`, "error", "error");
				return this.message.reply({ embeds: [errorEmbed] });
			}
		}
	}
}
