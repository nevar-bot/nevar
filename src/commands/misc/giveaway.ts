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
									.setDescription("Wähle, in welchem Channel das Gewinnspiel gestartet werden soll")
									.setRequired(true)
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
							)
							.addStringOption((option: any) =>
								option.setName("gewinn").setDescription("Gib den Gewinn an").setMaxLength(256).setRequired(true)
							)
							.addStringOption((option: any) =>
								option.setName("dauer").setDescription("Gib die Dauer an (z.B. 1h, 1d, 1w, 1h 30m)").setRequired(true)
							)
							.addIntegerOption((option: any) =>
								option
									.setName("gewinner")
									.setDescription("Gib an wieviele Gewinner es geben soll")
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
								option.setName("id").setDescription("Gib die ID der Nachricht des Gewinnspiels an").setRequired(true)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("reroll")
							.setDescription("Lost neue Gewinner für ein beendetes Gewinnspiel aus")
							.addStringOption((option: any) =>
								option.setName("id").setDescription("Gib die ID der Nachricht des beendeten Gewinnspiels an").setRequired(true)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("delete")
							.setDescription("Löscht ein Gewinnspiel")
							.addStringOption((option: any) =>
								option.setName("id").setDescription("Gib die ID der Nachricht des Gewinnspiels an").setRequired(true)
							)
					)
					.addSubcommand((subcommand: any) => subcommand.setName("list").setDescription("Zeigt alle laufenden Gewinnspiele an"))
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
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Du musst eine gültige Dauer angeben.", "error", "error");
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		await this.client.giveawayManager.createGiveaway({
			messageId: null,
			channelId: channel.id,
			guildId: this.interaction.guild.id,
			startAt: Date.now(),
			endAt: Date.now() + ms(duration),
			ended: false,
			winnerCount: winner,
			prize: win,
			entrantIds: [],
			hostedBy: this.interaction.user.id,
			winnerIds: [],
			exemptMembers: [],
		});
		const successEmbed: EmbedBuilder = this.client.createEmbed("Das Gewinnspiel wurde gestartet.", "success", "success");
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async end(): Promise<void> {
		const id: string = this.interaction.options.getString("id");
		const endGiveaway: boolean = await this.client.giveawayManager.endGiveaway(id);
		if(endGiveaway){
			const successEmbed: EmbedBuilder = this.client.createEmbed("Das Gewinnspiel wurde beendet.", "success", "success");
			return this.interaction.followUp({ embeds: [successEmbed] });
		}else{
			const errorEmbed: EmbedBuilder = this.client.createEmbed("Mit der ID habe ich kein Gewinnspiel gefunden.", "error", "error");
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}

	private async reroll(): Promise<void> {
		const id: string = this.interaction.options.getString("id");
		const rerollGiveaway: boolean|Object = await this.client.giveawayManager.rerollGiveaway(id);
		if(rerollGiveaway){
			const successEmbed: EmbedBuilder = this.client.createEmbed("Das Gewinnspiel wurde neu ausgelost.", "success", "success");
			return this.interaction.followUp({ embeds: [successEmbed] });
		}else{
			const errorEmbed: EmbedBuilder = this.client.createEmbed("Mit der ID habe ich kein Gewinnspiel gefunden.", "error", "error");
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}

	private async delete(): Promise<void> {
		const id: string = this.interaction.options.getString("id");
		const deleteGiveaway: boolean = await this.client.giveawayManager.deleteGiveaway(id);
		if(deleteGiveaway){
			const successEmbed: EmbedBuilder = this.client.createEmbed("Das Gewinnspiel wurde gelöscht.", "success", "success");
			return this.interaction.followUp({ embeds: [successEmbed] });
		}else{
			const errorEmbed: EmbedBuilder = this.client.createEmbed("Mit der ID habe ich kein Gewinnspiel gefunden.", "error", "error");
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}

	private async list(): Promise<void> {
		const guildGiveaways: any = (await this.client.giveawayManager.getGiveaways()).filter((g: any): boolean => g.guildId === this.interaction.guild.id && !g.ended);

		const giveaways: any[] = [];

		for (let giveaway of guildGiveaways) {
			const prize = giveaway.prize;
			const channel = await this.interaction.guild.channels.fetch(giveaway.channelId).catch((): void => {});
			if (!channel) continue;
			const winnerCount = giveaway.winnerCount;
			const hostedBy: any = await this.client.users.fetch(giveaway.hostedBy).catch((): void => {});
			const startedAt = giveaway.startAt;
			const endAt = giveaway.endAt;

			const text: string =
				" **" +
				prize +
				"**\n" +
				this.client.emotes.channel +
				"Channel: " +
				channel.toString() +
				"\n" +
				this.client.emotes.tada +
				"Gewinner: " +
				winnerCount +
				"\n" +
				this.client.emotes.user +
				"Veranstaltet durch: " +
				hostedBy.toString() +
				"\n" +
				this.client.emotes.calendar +
				"Gestartet " + this.client.utils.getDiscordTimestamp(startedAt, "R") + "\n" +
				this.client.emotes.reminder +
				"Endet " + this.client.utils.getDiscordTimestamp(endAt, "R") + "\n\n";
			giveaways.push(text);
		}

		await this.client.utils.sendPaginatedEmbed(this.interaction, 3, giveaways, "Gewinnspiele", "Es sind keine Gewinnspiele vorhanden", "gift");
	}
}
