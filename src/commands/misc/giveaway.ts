import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";
import { ChannelType, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import ems from "enhanced-ms";
import path from "path";
const ms: any = ems("de");

export default class GiveawayCommand extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "giveaway",
			description: "Manage giveaways on your server",
			localizedDescriptions: {
				de: "Verwalte Gewinnspiele deines Servers"
			},
			memberPermissions: ["ManageGuild"],
			cooldown: 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("start")
							.setNameLocalization("de", "starten")
							.setDescription("Start a new competition")
							.setDescriptionLocalization("de", "Starte ein neues Gewinnspiel")
							.addChannelOption((option: any) =>
								option
									.setName("channel")
									.setNameLocalization("de", "kanal")
									.setDescription("Select one of the following channels")
									.setDescriptionLocalization("de", "Wähle einen der folgenden Kanäle")
									.setRequired(true)
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
							)
							.addStringOption((option: any) =>
								option
									.setName("price")
									.setNameLocalization("de", "gewinn")
									.setDescription("Choose the prize of the competition")
									.setDescriptionLocalization("de", "Wähle den Gewinn des Gewinnspiels")
									.setMaxLength(256)
									.setRequired(true),
							)
							.addStringOption((option: any) =>
								option
									.setName("duration")
									.setNameLocalization("de", "dauer")
									.setDescription("Choose the duration of the competition (e.g. 1h, 1d, 1w, 1h 30m)")
									.setDescriptionLocalization("de", "Wähle die Dauer des Gewinnspiels (bspw. 1h, 1d, 1w, 1h 30m)")
									.setRequired(true),
							)
							.addIntegerOption((option: any) =>
								option
									.setName("winners")
									.setNameLocalization("de", "gewinner")
									.setDescription("Choose how many winners there should be")
									.setDescriptionLocalization("de", "Wähle wieviele Gewinner es geben soll")
									.setMinValue(1)
									.setMaxValue(10)
									.setRequired(true),
							),
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("end")
							.setNameLocalization("de", "beenden")
							.setDescription("End an ongoing competition")
							.setDescriptionLocalization("de", "Beende ein laufendes Gewinnspiel")
							.addStringOption((option: any) =>
								option
									.setName("id")
									.setDescription("Enter the message ID of the competition")
									.setDescriptionLocalization("de", "Gib die Nachrichten-ID des Gewinnspiels an")
									.setRequired(true),
							),
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("reroll")
							.setNameLocalization("de", "neustarten")
							.setDescription("Draw new winners for a giveaway")
							.setDescriptionLocalization("de", "Lose neue Gewinner für ein Gewinnspiel aus")
							.addStringOption((option: any) =>
								option
									.setName("id")
									.setDescription("Enter the message ID of the giveaway")
									.setDescriptionLocalization("de", "Gib die Nachrichten-ID des Gewinnspiels an")
									.setRequired(true),
							),
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("delete")
							.setNameLocalization("de", "löschen")
							.setDescription("Delete a giveaway")
							.setDescriptionLocalization("de", "Lösche ein Gewinnspiel")
							.addStringOption((option: any) =>
								option
									.setName("id")
									.setDescription("Enter the message ID of the giveaway")
									.setDescriptionLocalization("de", "Gib die Nachrichten-ID des Gewinnspiels an")
									.setRequired(true),
							),
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("list")
							.setNameLocalization("de", "liste")
							.setDescription("View all current giveaways")
							.setDescriptionLocalization("de", "Sieh dir alle laufenden Gewinnspiele an")

					),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;

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
				this.getBasicTranslation("errors:durationIsInvalid"),
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
			this.translate("giveawayStarted"),
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
				this.translate("giveawayStopped"),
				"success",
				"success",
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:giveawayWasNotFound"),
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
				this.translate("giveawayRerolled"),
				"success",
				"success",
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:giveawayWasNotFound"),
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
				this.translate("giveawayDeleted"),
				"success",
				"success",
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:giveawayWasNotFound"),
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
				" **" + this.getBasicTranslation("channel") + ":** " +
				channel.toString() +
				"\n" +
				this.client.emotes.tada +
				" **" + this.translate("list:giveawayWinnerCount") + ":** " +
				winnerCount +
				"\n" +
				this.client.emotes.user +
				" **" + this.translate("list:giveawayHostedBy") + ":** " +
				hostedBy.toString() +
				"\n" +
				this.client.emotes.calendar +
				" **" + this.translate("list:giveawayStartedAt") + ":** " +
				this.client.utils.getDiscordTimestamp(startedAt, "R") +
				"\n" +
				this.client.emotes.reminder +
				" **" + this.translate("list:giveawayEndsAt") + ":** " +
				this.client.utils.getDiscordTimestamp(endAt, "R") +
				"\n\n";
			giveaways.push(text);
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			3,
			giveaways,
			this.translate("list:title"),
			this.translate("list:noGiveawayCreated"),
		);
	}
}
