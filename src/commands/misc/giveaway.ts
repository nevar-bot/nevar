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
							.setNameLocalizations({
								de: "starten"
							})
							.setDescription("Starts a new giveaway")
							.setDescriptionLocalizations({
								de: "Startet ein neue Gewinnspiel"
							})
							.addChannelOption((option: any) =>
								option
									.setName("channel")
									.setNameLocalizations({
										de: "kanal"
									})
									.setDescription("Choose in which channel the giveaway should be started")
									.setDescriptionLocalizations({
										de: "Wähle, in welchem Channel das Gewinnspiel gestartet werden soll"
									})
									.setRequired(true)
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
							)
							.addStringOption((option: any) =>
								option
									.setName("price")
									.setNameLocalizations({
										de: "gewinn"
									})
									.setDescription("Choose the price of the giveaway")
									.setDescriptionLocalizations({
										de: "Gib den Gewinn an"
									})
									.setMaxLength(256)
									.setRequired(true),
							)
							.addStringOption((option: any) =>
								option
									.setName("duration")
									.setNameLocalizations({
										de: "dauer"
									})
									.setDescription("Choose the duration of the giveaway (e.g. 1h, 1d, 1w, 1h 30m)")
									.setDescriptionLocalizations({
										de: "Gib die Dauer an (z.B. 1h, 1d, 1w, 1h 30m)"
									})
									.setRequired(true),
							)
							.addIntegerOption((option: any) =>
								option
									.setName("winners")
									.setNameLocalizations({
										de: "gewinner"
									})
									.setDescription("Choose how many winners there should be")
									.setDescriptionLocalizations({
										de: "Gib an wieviele Gewinner es geben soll"
									})
									.setMinValue(1)
									.setMaxValue(10)
									.setRequired(true),
							),
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("end")
							.setNameLocalizations({
								de: "beenden"
							})
							.setDescription("Ends a running giveaway")
							.setDescriptionLocalizations({
								de: "Beendet ein laufendes Gewinnspiel"
							})
							.addStringOption((option: any) =>
								option
									.setName("id")
									.setNameLocalizations({
										de: "id"
									})
									.setDescription("Enter the message id of the giveaway message")
									.setDescriptionLocalizations({
										de: "Gib die ID der Nachricht des Gewinnspiels an"
									})
									.setRequired(true),
							),
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("reroll")
							.setNameLocalizations({
								de: "wiederholen"
							})
							.setDescription("Rerolls a ended giveaway")
							.setDescriptionLocalizations({
								de: "Lost neue Gewinner für ein beendetes Gewinnspiel aus"
							})
							.addStringOption((option: any) =>
								option
									.setName("id")
									.setNameLocalizations({
										de: "id"
									})
									.setDescription("Enter the message id of the giveaway message")
									.setDescriptionLocalizations({
										de: "Gib die ID der Nachricht des beendeten Gewinnspiels an"
									})
									.setRequired(true),
							),
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("delete")
							.setNameLocalizations({
								de: "löschen"
							})
							.setDescription("Deletes a giveaway")
							.setDescriptionLocalizations({
								de: "Löscht ein Gewinnspiel"
							})
							.addStringOption((option: any) =>
								option
									.setName("id")
									.setNameLocalizations({
										de: "id"
									})
									.setDescription("Enter the message id of the giveaway message")
									.setDescriptionLocalizations({
										de: "Gib die ID der Nachricht des Gewinnspiels an"
									})
									.setRequired(true),
							),
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("list")
							.setNameLocalizations({
								de: "liste"
							})
							.setDescription("Shows all running giveaways")
							.setDescriptionLocalizations({
								de: "Zeigt alle laufenden Gewinnspiele an"
							}),
					),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;

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

	private async start(): Promise<any> {
		const channel: any = this.interaction.options.getChannel("channel");
		const win: any = this.interaction.options.getString("price");
		const duration: any = this.interaction.options.getString("duration");
		const winner: any = this.interaction.options.getInteger("winners");

		if (!ms(duration)) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:invalidDuration"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		await this.client.giveawayManager.createGiveaway({
			messageId: null,
			channelId: channel.id,
			guildId: this.interaction.guild!.id,
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
		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("started"),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async end(): Promise<any> {
		const id: string = this.interaction.options.getString("id");
		const endGiveaway: boolean = await this.client.giveawayManager.endGiveaway(id);
		if (endGiveaway) {
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("stopped"),
				"success",
				"success",
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:noGiveawayFound"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}

	private async reroll(): Promise<any> {
		const id: string = this.interaction.options.getString("id");
		const rerollGiveaway: boolean | Object = await this.client.giveawayManager.rerollGiveaway(id);
		if (rerollGiveaway) {
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("rerolled"),
				"success",
				"success",
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:noGiveawayFound"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}

	private async delete(): Promise<any> {
		const id: string = this.interaction.options.getString("id");
		const deleteGiveaway: boolean = await this.client.giveawayManager.deleteGiveaway(id);
		if (deleteGiveaway) {
			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("deleted"),
				"success",
				"success",
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:noGiveawayFound"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}

	private async list(): Promise<any> {
		const guildGiveaways: any = (await this.client.giveawayManager.getGiveaways()).filter(
			(g: any): boolean => g.guildId === this.interaction.guild!.id && !g.ended,
		);

		const giveaways: any[] = [];

		for (const giveaway of guildGiveaways) {
			const prize: string = giveaway.prize;
			const channel: any = await this.interaction.guild!.channels.fetch(giveaway.channelId).catch((): void => {});
			if (!channel) continue;
			const winnerCount = giveaway.winnerCount;
			const hostedBy: any = await this.client.users.fetch(giveaway.hostedBy).catch((): void => {});
			const startedAt = giveaway.startAt;
			const endAt = giveaway.endAt;

			const text: string =
				"### " +
				prize +
				"\n" +
				this.client.emotes.channel +
				" **" + this.translate("list:channel") + ":** " +
				channel.toString() +
				"\n" +
				this.client.emotes.tada +
				" **" + this.translate("list:winnerCount") + ":** " +
				winnerCount +
				"\n" +
				this.client.emotes.user +
				" **" + this.translate("list:hostedBy") + ":** " +
				hostedBy.toString() +
				"\n" +
				this.client.emotes.calendar +
				" **" + this.translate("list:started") + ":** " +
				this.client.utils.getDiscordTimestamp(startedAt, "R") +
				"\n" +
				this.client.emotes.reminder +
				" **" + this.translate("list:endsAt") + ":** " +
				this.client.utils.getDiscordTimestamp(endAt, "R") +
				"\n\n";
			giveaways.push(text);
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			3,
			giveaways,
			this.translate("list:title"),
			this.translate("list:empty"),
		);
	}
}
