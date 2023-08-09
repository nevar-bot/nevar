import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { ChannelType, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import ems from "enhanced-ms";
const ms: any = ems("de");

export default class GiveawayCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "giveaway",
			description: "Verwaltet die Giveaways auf dem Server",
			memberPermissions: ["ManageGuild"],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("start")
							.setDescription("Startet ein neue Gewinnspiel")
							.addChannelOption((option: any) =>
								option
									.setName("channel")
									.setDescription(
										"Wähle, in welchem Channel das Gewinnspiel gestartet werden soll"
									)
									.setRequired(true)
									.addChannelTypes(
										ChannelType.GuildText,
										ChannelType.GuildAnnouncement
									)
							)
							.addStringOption((option: any) =>
								option
									.setName("gewinn")
									.setDescription("Gib den Gewinn an")
									.setMaxLength(256)
									.setRequired(true)
							)
							.addStringOption((option: any) =>
								option
									.setName("dauer")
									.setDescription(
										"Gib die Dauer an (z.B. 1h, 1d, 1w, 1h 30m)"
									)
									.setRequired(true)
							)
							.addIntegerOption((option: any) =>
								option
									.setName("gewinner")
									.setDescription(
										"Gib an wieviele Gewinner es geben soll"
									)
									.setMinValue(1)
									.setMaxValue(10)
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("end")
							.setDescription("Beendet ein laufendes Gewinnspiel")
							.addStringOption((option: any) =>
								option
									.setName("id")
									.setDescription(
										"Gib die ID der Nachricht des Gewinnspiels an"
									)
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("reroll")
							.setDescription(
								"Lost neue Gewinner für ein beendetes Gewinnspiel aus"
							)
							.addStringOption((option: any) =>
								option
									.setName("id")
									.setDescription(
										"Gib die ID der Nachricht des beendeten Gewinnspiels an"
									)
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("delete")
							.setDescription("Löscht ein Gewinnspiel")
							.addStringOption((option: any) =>
								option
									.setName("id")
									.setDescription(
										"Gib die ID der Nachricht des Gewinnspiels an"
									)
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("list")
							.setDescription(
								"Zeigt alle laufenden Gewinnspiele an"
							)
					)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;

		const subcommand = interaction.options.getSubcommand();

		switch (subcommand) {
			case "start":
				await this.start();
				break;
			case "end":
				await this.end();
				break;
			case "reroll":
				await this.reroll();
				break;
			case "delete":
				await this.delete();
				break;
			case "list":
				await this.list();
				break;
		}
	}

	private async start(): Promise<void> {
		const channel: any = this.interaction.options.getChannel("channel");
		const win: any = this.interaction.options.getString("gewinn");
		const duration: any = this.interaction.options.getString("dauer");
		const winner: any = this.interaction.options.getInteger("gewinner");

		if (!ms(duration)) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				"Du musst eine gültige Dauer angeben.",
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		this.client.giveawayManager.start(channel, {
			duration: ms(duration),
			winnerCount: winner,
			prize: win,
			hostedBy: this.interaction.user,

			thumbnail: this.client.user!.displayAvatarURL(),
			messages: {
				giveaway: "🎉🎉 **GEWINNSPIEL** 🎉🎉",
				giveawayEnded: "🎉🎉 **GEWINNSPIEL BEENDET** 🎉🎉",
				title: "Neues Gewinnspiel!",
				inviteToParticipate:
					this.client.emotes.gift +
					"Verlost wird **{this.prize}!**\n\n" +
					this.client.emotes.arrow +
					"Um teilzunehmen, reagiere mit " +
					this.client.emotes.tada +
					"!",
				winMessage: {
					content:
						this.client.emotes.tada +
						" Herzlichen Glückwunsch, {winners}! {this.winnerCount > 1 ? 'Ihr habt' : 'Du hast'} **{this.prize}** gewonnen!",
					replyToGiveaway: true
				},
				drawing: this.client.emotes.reminder + " Endet {timestamp}",
				embedFooter: "{this.winnerCount} Gewinner",
				noWinner:
					this.client.emotes.gift +
					" Verlost wird **{this.prize}!**\n\n" +
					this.client.emotes.arrow +
					"Teilnahmen sind **nicht** mehr möglich!\n" +
					this.client.emotes.reminder +
					"Endet <t:{Math.round(this.endAt / 1000)}:R>\n\n" +
					this.client.emotes.users +
					" Da es keine Teilnehmer gab, gibt es keine Gewinner!",
				winners:
					this.client.emotes.gift +
					" Verlost wird **{this.prize}!**\n\n" +
					this.client.emotes.arrow +
					" Teilnahmen sind **nicht** mehr möglich!\n" +
					this.client.emotes.reminder +
					" Endet <t:{Math.round(this.endAt / 1000)}:R>\n\n" +
					this.client.emotes.users +
					" Gewinner:",
				endedAt: "Beendet",
				hostedBy:
					"\n" +
					this.client.emotes.user +
					" Veranstaltet durch: {this.hostedBy}\n" +
					this.client.emotes.users +
					" Teilnehmer: {this.entrantIds.length}"
			}
		});

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			"Das Gewinnspiel wurde gestartet.",
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async end(): Promise<void> {
		const id: string = this.interaction.options.getString("id");
		this.client.giveawayManager
			.end(id)
			.then(async (): Promise<any> => {
				const successEmbed: EmbedBuilder = this.client.createEmbed(
					"Das Gewinnspiel wurde beendet.",
					"success",
					"success"
				);
				return this.interaction.followUp({ embeds: [successEmbed] });
			})
			.catch(async (): Promise<any> => {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					"Mit der ID habe ich kein Gewinnspiel gefunden.",
					"error",
					"error"
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			});
	}

	private async reroll(): Promise<void> {
		const id: string = this.interaction.options.getString("id");
		this.client.giveawayManager
			.reroll(id, {
				messages: {
					congrat: {
						content:
							this.client.emotes.tada +
							" Herzlichen Glückwunsch, {winners}! {this.winnerCount > 1 ? 'Ihr habt' : 'Du hast'} **{this.prize}** gewonnen!",
						replyToGiveaway: true
					},
					error:
						this.client.emotes.error +
						" Da es keine weiteren gültigen Teilnehmer gab, gibt es keine Gewinner!"
				}
			})
			.then(async (): Promise<any> => {
				const successEmbed: EmbedBuilder = this.client.createEmbed(
					"Das Gewinnspiel wurde neu ausgelost.",
					"success",
					"success"
				);
				return this.interaction.followUp({ embeds: [successEmbed] });
			})
			.catch(async (): Promise<any> => {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					"Mit der ID habe ich kein Gewinnspiel gefunden.",
					"error",
					"error"
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			});
	}

	private async delete(): Promise<void> {
		const id: string = this.interaction.options.getString("id");
		this.client.giveawayManager
			.delete(id)
			.then(async (): Promise<any> => {
				const successEmbed: EmbedBuilder = this.client.createEmbed(
					"Das Gewinnspiel wurde gelöscht.",
					"success",
					"success"
				);
				return this.interaction.followUp({ embeds: [successEmbed] });
			})
			.catch(async (): Promise<any> => {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					"Mit der ID habe ich kein Gewinnspiel gefunden.",
					"error",
					"error"
				);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			});
	}

	private async list(): Promise<void> {
		const guildGiveaways = this.client.giveawayManager.giveaways.filter(
			(g: any): boolean =>
				g.guildId === this.interaction.guild.id && !g.ended
		);

		const giveaways: any[] = [];

		for (let giveaway of guildGiveaways) {
			const prize = giveaway.prize;
			const channel = await this.interaction.guild.channels
				.fetch(giveaway.channelId)
				.catch(() => {});
			if (!channel) continue;
			const winnerCount = giveaway.winnerCount;
			const hostedBy = giveaway.hostedBy;
			const startedAt = giveaway.startAt;
			const endAt = giveaway.endAt;

			const text: string =
				" **" +
				prize +
				"**\n" +
				this.client.emotes.arrow +
				"Channel: " +
				channel.toString() +
				"\n" +
				this.client.emotes.arrow +
				"Gewinner: " +
				winnerCount +
				"\n" +
				this.client.emotes.arrow +
				"Veranstaltet durch: " +
				hostedBy +
				"\n" +
				this.client.emotes.arrow +
				"Gestartet <t:" +
				Math.round(startedAt / 1000) +
				":R>\n" +
				this.client.emotes.arrow +
				"Endet <t:" +
				Math.round(endAt / 1000) +
				":R>\n\n";
			giveaways.push(text);
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			3,
			giveaways,
			"Gewinnspiele",
			"Es sind keine Gewinnspiele vorhanden",
			"gift"
		);
	}
}
