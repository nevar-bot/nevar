import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import BaseGame from "@structures/BaseGame";
import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder } from "discord.js";

export default class FloodCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "flood",
			description: "You have to fill the whole playing field with one color",
			localizedDescriptions: {
				de: "Du musst das gesamte Spielfeld mit einer Farbe füllen"
			},
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
			}
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.startGame();
	}

	private async startGame(): Promise<void> {
		const game: FloodGame = new FloodGame({
			interaction: this.interaction,
			client: this.client
		});

		await game.startGame();
	}
}

class FloodGame extends BaseGame {
	public length: number;
	public gameBoard: any[];
	public maxTurns: number;
	public turns: number;
	public squares: string[] = ["🟥", "🟦", "🟧", "🟪", "🟩"];

	public constructor(options: any = {}) {
		super(options);

		this.length = 13;
		this.gameBoard = [];
		this.maxTurns = 0;
		this.turns = 0;

		for (let y: number = 0; y < this.length; y++) {
			for (let x: number = 0; x < this.length; x++) {
				this.gameBoard[y * this.length + x] = this.squares[Math.floor(Math.random() * this.squares.length)];
			}
		}
	}

	public async startGame(): Promise<void> {
		if (!this.interaction.deferred) await this.interaction.deferReply().catch((e: any): void => {});
		this.interaction.author = this.interaction.user;
		this.maxTurns = Math.floor((25 * (this.length * 2)) / 26);

		const embed: EmbedBuilder = this.options.client.createEmbed(
			this.interaction.guild.translate("minigames/flood:embedDescription", {
				turns: this.turns,
				maxTurns: this.maxTurns,
				board: this.getBoardContent()
			}),
			"arrow",
			"normal"
		);

		const btn1: ButtonBuilder = this.options.client.createButton("flood_0", null, "Primary", this.squares[0]);
		const btn2: ButtonBuilder = this.options.client.createButton("flood_1", null, "Primary", this.squares[1]);
		const btn3: ButtonBuilder = this.options.client.createButton("flood_2", null, "Primary", this.squares[2]);
		const btn4: ButtonBuilder = this.options.client.createButton("flood_3", null, "Primary", this.squares[3]);
		const btn5: ButtonBuilder = this.options.client.createButton("flood_4", null, "Primary", this.squares[4]);
		const row: any = this.options.client.createMessageComponentsRow(btn1, btn2, btn3, btn4, btn5);

		const msg: any = await this.sendMessage({
			embeds: [embed],
			components: [row]
		});
		const collector = msg.createMessageComponentCollector({
			filter: (btn: any): boolean => btn.user.id === this.interaction.user.id
		});

		collector.on("collect", async (btn: any): Promise<any> => {
			await btn.deferUpdate().catch((e: any): void => {});

			const update: boolean | undefined = await this.updateGame(this.squares[btn.customId.split("_")[1]], msg);
			if (!update && update !== false) return collector.stop();
			if (!update) return;

			const embed: EmbedBuilder = this.options.client.createEmbed(
				this.interaction.guild.translate("minigames/flood:embedDescription", {
					turns: this.turns,
					maxTurns: this.maxTurns,
					board: this.getBoardContent()
				}),
				"arrow",
				"normal"
			);
			return await msg.edit({ embeds: [embed], components: [row] });
		});

		collector.on("end", (_: any, reason: any) => {
			if (reason === "idle") return this.endGame(msg, false);
		});
	}

	private getBoardContent(): string {
		let board: string = "";
		for (let y: number = 0; y < this.length; y++) {
			for (let x: number = 0; x < this.length; x++) {
				board += this.gameBoard[y * this.length + x];
			}
			board += "\n";
		}
		return board;
	}

	private endGame(msg: any, result: any): any {
		const GameOverMessage: string = result
			? this.interaction.guild.translate("minigames/flood:win", { turns: String(this.turns) })
			: this.interaction.guild.translate("minigames/flood:lose", { turns: String(this.turns) });

		const embed: EmbedBuilder = this.options.client.createEmbed(
			this.interaction.guild.translate("minigames/flood:end") +
				this.options.client.emotes.arrow +
				" " +
				GameOverMessage +
				"\n\n" +
				this.getBoardContent(),
			"rocket",
			"normal"
		);
		return msg.edit({
			embeds: [embed],
			components: this.disableButtons(msg.components)
		});
	}

	private async updateGame(selected: any, msg: any): Promise<any> {
		if (selected === this.gameBoard[0]) return false;
		const firstBlock = this.gameBoard[0];
		const queue: any = [{ x: 0, y: 0 }];
		const visited: any[] = [];
		this.turns += 1;

		while (queue.length > 0) {
			const block = queue.shift();
			if (!block || visited.some((v) => v.x === block.x && v.y === block.y)) continue;
			const index = block.y * this.length + block.x;

			visited.push(block);
			if (this.gameBoard[index] === firstBlock) {
				this.gameBoard[index] = selected;

				const up: any = { x: block.x, y: block.y - 1 };
				if (!visited.some((v) => v.x === up.x && v.y === up.y) && up.y >= 0) queue.push(up);

				const down: any = { x: block.x, y: block.y + 1 };
				if (!visited.some((v) => v.x === down.x && v.y === down.y) && down.y < this.length) queue.push(down);

				const left: any = { x: block.x - 1, y: block.y };
				if (!visited.some((v) => v.x === left.x && v.y === left.y) && left.x >= 0) queue.push(left);

				const right: any = { x: block.x + 1, y: block.y };
				if (!visited.some((v) => v.x === right.x && v.y === right.y) && right.x < this.length) queue.push(right);
			}
		}

		let gameOver: boolean = true;
		for (let y: number = 0; y < this.length; y++) {
			for (let x: number = 0; x < this.length; x++) {
				if (this.gameBoard[y * this.length + x] !== selected) gameOver = false;
			}
		}

		if (this.turns >= this.maxTurns && !gameOver) return void this.endGame(msg, false);
		if (gameOver) return void this.endGame(msg, true);
		return true;
	}
}
