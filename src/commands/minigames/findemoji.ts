import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import BaseGame from "@structures/BaseGame";
import { SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder } from "discord.js";

export default class FindemojiCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "findemoji",
			description: "You have to remember the order of eight different emojis, and choose the right one",
			localizedDescriptions: {
				de: "Du musst dir die Reihenfolge acht verschiedener Emojis merken, und den Richtigen wählen"
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
			this.interaction.guild.translate("minigames/findemoji:text"),
			"arrow",
			"normal"
		);
		findEmojiEmbed.setThumbnail(this.client.user!.displayAvatarURL());

		const msg: any = await this.sendMessage({
			embeds: [findEmojiEmbed],
			components: this.getComponents(true)
		});

		const timeoutCallback: any = async (): Promise<void> => {
			findEmojiEmbed.setDescription(this.interaction.guild.translate("minigames/findemoji:find", { emoji: this.emoji }));
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
			finalMessage = this.interaction.guild.translate("minigames/findemoji:win", { emoji: this.emoji });
		} else {
			finalMessage = this.interaction.guild.translate("minigames/findemoji:lose", { emoji: this.emoji });
		}

		const gameOverEmbed: EmbedBuilder = this.client.createEmbed(finalMessage, "arrow", "normal");
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
