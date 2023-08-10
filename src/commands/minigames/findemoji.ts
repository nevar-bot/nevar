import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import BaseGame from "@structures/BaseGame";
import { SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder } from "discord.js";

export default class FindemojiCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "findemoji",
			description: "Du musst dir die Reihenfolge acht verschiedener Emojis merken, und den Richtigen wählen",
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		await this.startGame();
	}

	private async startGame(): Promise<void> {
		const game: FindemojiGame = new FindemojiGame({
			interaction: this.interaction,
			client: this.client
		});
		await game.startGame();
	}
}

class FindemojiGame extends BaseGame {
	public emojis: string[];
	public selected: any;
	public emoji: any;

	public constructor(options: any = {}) {
		super(options);
		this.emojis = ["🍉", "🍇", "🍊", "🍋", "🥭", "🍎", "🍏", "🥝", "🥥", "🍓", "🍒"];
		this.selected = null;
		this.emoji = null;
	}

	public async startGame(): Promise<void> {
		await this.interaction.deferReply().catch((e: any): void => {});

		this.emojis = this.shuffleArray(this.emojis).slice(0, 8);
		this.emoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];

		const findEmojiEmbed: EmbedBuilder = this.client.createEmbed(
			"Du hast 5 Sekunden, um dir die Emojis in richtiger Reihenfolge zu merken!",
			"arrow",
			"normal"
		);
		findEmojiEmbed.setThumbnail(this.client.user!.displayAvatarURL());

		const msg: any = await this.sendMessage({
			embeds: [findEmojiEmbed],
			components: this.getComponents(true)
		});

		const timeoutCallback: any = async (): Promise<void> => {
			findEmojiEmbed.setDescription("Finde den " + this.emoji + " Emoji, bevor die Zeit abläuft");
			await msg.edit({
				embeds: [findEmojiEmbed],
				components: this.getComponents(false)
			});
			const emojiCollector = msg.createMessageComponentCollector({
				filter: (btn: any): boolean => btn.user.id === this.interaction.user.id,
				idle: 30000
			});

			emojiCollector.on("collect", async (btn: any): Promise<any> => {
				await btn.deferUpdate().catch((e: any): void => {});
				this.selected = this.emojis[parseInt(btn.customId.split("_")[1])];
				return emojiCollector.stop();
			});

			emojiCollector.on("end", async (_: any, reason: any): Promise<any> => {
				if (reason === "idle" || reason === "user") return this.endGame(msg, reason === "user");
			});
		};
		setTimeout(timeoutCallback, 5000);
	}

	private endGame(msg: any, result: any) {
		const resultMessage: "win" | "lose" = this.selected === this.emoji ? "win" : "lose";
		if (!result) this.selected = this.emoji;

		let finalMessage: string;
		if (resultMessage === "win") {
			finalMessage = "Du hast den richtigen Emoji ausgewählt. {0}";
		} else {
			finalMessage = "Du hast den falschen Emoji ausgewählt. {0}";
		}

		const gameOverEmbed: EmbedBuilder = this.client.createEmbed(finalMessage, "arrow", "normal", this.emoji);
		gameOverEmbed.setThumbnail(this.client.user!.displayAvatarURL());

		return msg.edit({
			embeds: [gameOverEmbed],
			components: this.disableButtons(this.getComponents(true))
		});
	}

	private getComponents(showEmoji: any): any {
		const components: any[] = [];
		for (let x: number = 0; x < 2; x++) {
			const row: any = new ActionRowBuilder();
			for (let y: number = 0; y < 4; y++) {
				const buttonEmoji: string = this.emojis[x * 4 + y];

				const btn: ButtonBuilder = this.client.createButton(
					"findEmoji_" + (x * 4 + y),
					"\u200b",
					buttonEmoji === this.selected ? (this.selected === this.emoji ? "Success" : "Danger") : "Primary",
					showEmoji ? buttonEmoji : null
				);
				row.addComponents(btn);
			}
			components.push(row);
		}
		return components;
	}
}
