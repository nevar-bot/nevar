import BaseCommand from "@structures/BaseCommand";
import { ButtonBuilder, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import BaseClient from "@structures/BaseClient";
import * as math from "mathjs";

export default class CalculatorCommand extends BaseCommand
{
	public constructor(client: BaseClient)
	{
		super(client, {
			name: "calculator",
			description: "Ein Taschenrechner auf Discord",
			cooldown: 2 * 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void>
	{
		this.interaction = interaction;
		await this.buildCalculator(interaction.user);
	}

	private async buildCalculator(user: any): Promise<void>
	{
		const id: string = user.id;

		const embed: EmbedBuilder = this.client.createEmbed("```\u200b```", null, "normal");

		// First button row
		const acButton: ButtonBuilder = this.client.createButton(id + "-ac", "AC", "Danger");
		const openBracketButton: ButtonBuilder = this.client.createButton(id + "-openbracket", "(", "Primary");
		const closeBracketButton: ButtonBuilder = this.client.createButton(id + "-closebracket", ")", "Primary");
		const divideButton: ButtonBuilder = this.client.createButton(id + "-divide", "÷", "Primary");
		const firstRow: any = this.client.createMessageComponentsRow(acButton, openBracketButton, closeBracketButton, divideButton);

		// Second button row
		const Button1: ButtonBuilder = this.client.createButton(id + "-1", "1", "Secondary");
		const Button2: ButtonBuilder = this.client.createButton(id + "-2", "2", "Secondary");
		const Button3: ButtonBuilder = this.client.createButton(id + "-3", "3", "Secondary");
		const multiplyButton: ButtonBuilder = this.client.createButton(id + "-multiply", "x", "Primary");
		const secondRow: any = this.client.createMessageComponentsRow(Button1, Button2, Button3, multiplyButton);

		// Third button row
		const Button4: ButtonBuilder = this.client.createButton(id + "-4", "4", "Secondary");
		const Button5: ButtonBuilder = this.client.createButton(id + "-5", "5", "Secondary");
		const Button6: ButtonBuilder = this.client.createButton(id + "-6", "6", "Secondary");
		const minusButton: ButtonBuilder = this.client.createButton(id + "-minus", "-", "Primary");
		const thirdRow: any = this.client.createMessageComponentsRow(Button4, Button5, Button6, minusButton);

		// Fourth button row
		const Button7: ButtonBuilder = this.client.createButton(id + "-7", "7", "Secondary");
		const Button8: ButtonBuilder = this.client.createButton(id + "-8", "8", "Secondary");
		const Button9: ButtonBuilder = this.client.createButton(id + "-9", "9", "Secondary");
		const plusButton: ButtonBuilder = this.client.createButton(id + "-plus", "+", "Primary");
		const fourthRow: any = this.client.createMessageComponentsRow(Button7, Button8, Button9, plusButton);

		// Fifth button row
		const removeButton: ButtonBuilder = this.client.createButton(id + "-remove", "⌫", "Primary");
		const Button0: ButtonBuilder = this.client.createButton(id + "-0", "0", "Secondary");
		const commaButton: ButtonBuilder = this.client.createButton(id + "-comma", ",", "Primary");
		const equalButton: ButtonBuilder = this.client.createButton(id + "-equal", "=", "Success");
		const fifthRow: any = this.client.createMessageComponentsRow(removeButton, Button0, commaButton, equalButton);

		const calculatorMessage: any = await this.interaction.followUp({ embeds: [embed], components: [firstRow, secondRow, thirdRow, fourthRow, fifthRow] });

		const buttonCollector: any = calculatorMessage.createMessageComponentCollector({ filter: (button: any): boolean => button.user.id === id });

		let formula: string = "";
		buttonCollector.on("collect", async (buttonI: any): Promise<void> =>
		{
			const id: string = buttonI.customId;
			const action: string = id.split("-")[1];

			switch (action) {
				case "ac":
					formula = "\u200b";
					break;
				case "openbracket":
					formula += "(";
					break;
				case "closebracket":
					formula += ")";
					break;
				case "divide":
					formula += "÷";
					break;
				case "1":
					formula += "1";
					break;
				case "2":
					formula += "2";
					break;
				case "3":
					formula += "3";
					break;
				case "multiply":
					formula += "x";
					break;
				case "4":
					formula += "4";
					break;
				case "5":
					formula += "5";
					break;
				case "6":
					formula += "6";
					break;
				case "minus":
					formula += "-";
					break;
				case "7":
					formula += "7";
					break;
				case "8":
					formula += "8";
					break;
				case "9":
					formula += "9";
					break;
				case "plus":
					formula += "+";
					break;
				case "remove":
					formula = formula.slice(0, -1);
					break;
				case "0":
					formula += "0";
					break;
				case "comma":
					formula += ",";
					break;
				case "equal":
					try {
						formula = (math.evaluate(formula.replace(/[x]/gi, "*").replace(/[÷]/gi, "/").replace(/[,]/gi, ".").replace("\u200b", "")))?.toString();
					} catch (exc) {
						formula = "\u200b";
					}
			}
			if (!formula || formula === "") formula = "\u200b";
			embed.setDescription("```\n" + formula?.replace(/[.]/gi, ",") + "\n```");
			await buttonI.update({ embeds: [embed] });
		});
	}
}
