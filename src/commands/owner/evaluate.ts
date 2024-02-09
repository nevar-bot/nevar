import BaseCommand from "@structures/BaseCommand.js";
import BaseClient from "@structures/BaseClient.js";
import { ButtonBuilder, EmbedBuilder } from "discord.js";
import path from "path";

export default class EvaluateCommand extends BaseCommand {
	constructor(client: BaseClient) {
		super(client, {
			name: "evaluate",
			description: "Execute JavaScript code",
			localizedDescriptions: {
				de: "Führe JavaScript Code aus",
			},
			ownerOnly: true,
			dirname: import.meta.url,
			slashCommand: { addCommand: false, data: null },
		});
	}

	async dispatch(message: any, args: any[], data: any): Promise<void> {
		this.message = message;
		this.guild = message.guild;
		this.data = data;
		await this.evaluate(args.join(" "));
	}

	private async evaluate(code: string): Promise<any> {
		if(this.guild.id !== this.client.config.support["ID"]){
			const errorEmbed: EmbedBuilder = this.client.createEmbed(this.translate("errors:guildHasToBeSupportGuild"), "error", "error");
			return this.message.reply({ embeds: [errorEmbed] });
		}
		try {
			const safeCode: string = code.replaceAll("```", "");
			const response: any = await eval(safeCode);

			const deleteButton: ButtonBuilder = this.client.createButton(
				"delete",
				this.translate("deleteResponse"),
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
