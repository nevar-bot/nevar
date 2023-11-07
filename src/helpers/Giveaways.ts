import BaseClient from "@structures/BaseClient";
import Giveaway from "@schemas/Giveaway";
import { ButtonBuilder, EmbedBuilder, Guild } from "discord.js";

export default class GiveawaysManager {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	/* Return giveaway by messageId */
	public async getGiveaway(giveawayId: string): Promise<typeof Giveaway | null> {
		const giveaway: any = await Giveaway.findOne({ messageId: giveawayId });
		return giveaway ?? null;
	}

	/* Return all giveaways */
	public async getGiveaways(): Promise<(typeof Giveaway)[]> {
		return Giveaway.find();
	}

	/* Creates a new giveaway */
	public async createGiveaway(giveawayData: any): Promise<typeof Giveaway | Error> {
		/* Send main embed */
		const message: any = await this.sendMainEmbed(giveawayData);

		/* Save giveaway */
		giveawayData.messageId = message.messageId;
		const giveaway: any = new Giveaway(giveawayData);
		await giveaway.save().catch((err: Error): Error => {
			return err;
		});
		return giveaway;
	}

	/* Deletes a giveaway by messageId */
	public async deleteGiveaway(giveawayId: string): Promise<boolean> {
		/* Get giveaway */
		const giveaway: any = await this.getGiveaway(giveawayId);
		if (!giveaway) return false;

		/* Delete giveaway */
		await Giveaway.findOneAndDelete({ messageId: giveawayId }).catch((err: Error): boolean => {
			return false;
		});

		/* Send deleted embed */
		const guild: Guild | null = this.client.guilds.cache.get(giveaway.guildId) ?? null;
		const channel: any = guild?.channels.cache.get(giveaway.channelId) ?? null;
		const message: any =
			(await channel?.messages.fetch(giveaway.messageId).catch((): void => {})) ?? null;

		if (guild && channel && message) {
			const endEmbed: EmbedBuilder = new EmbedBuilder()
				.setDescription(
					"## " +
						this.client.emotes.gift +
						" " +
						giveaway.prize +
						"\n\n" +
						"### " +
						this.client.emotes.arrow +
						" Es sind keine weiteren Teilnahmen möglich!\n\n" +
						"### " +
						this.client.emotes.information +
						" Informationen\n" +
						this.client.emotes.error +
						" Das Gewinnspiel wurde vorzeitig vom Ersteller beendet, ohne einen Gewinner zu ziehen."
				)
				.setThumbnail(this.client.user!.displayAvatarURL())
				.setColor(this.client.config.embeds["ERROR_COLOR"]);

			const participateButton: ButtonBuilder = this.client.createButton(
				"giveaway_participate",
				"\u200b",
				"Primary",
				this.client.emotes.tada,
				true
			);
			const buttonRow: any = this.client.createMessageComponentsRow(participateButton);

			await message
				.edit({ embeds: [endEmbed], components: [buttonRow] })
				.catch((): null => null);
		}
		return true;
	}

	/* End a giveaway by messageId */
	public async endGiveaway(giveawayId: string): Promise<boolean | Object> {
		/* Get giveaway */
		const giveaway: any = await this.getGiveaway(giveawayId);
		if (!giveaway) return false;

		/* Giveaway already ended */
		if (giveaway.ended) return false;

		/* Get winners */
		const entrantIds: string[] = giveaway.entrantIds.filter(
			(entrantId: string): boolean => !giveaway.exemptMembers.includes(entrantId)
		);
		const winners: string[] = [];

		for (let i = 0; i < giveaway.winnerCount; i++) {
			const winner: string = entrantIds[Math.floor(Math.random() * entrantIds.length)];
			if (!winner) continue;
			winners.push(winner);
			entrantIds.splice(entrantIds.indexOf(winner), 1);
		}

		/* Update giveaway */
		giveaway.ended = true;
		giveaway.winnerIds = winners;
		await giveaway.save().catch((err: Error): boolean => {
			return false;
		});

		await this.sendEndEmbed(giveaway);

		return {
			winnerCount: giveaway.winnerCount,
			actualWinnerCount: winners.length,
			winners: winners,
			prize: giveaway.prize,
			message: giveaway.messageId,
			channel: giveaway.channelId,
			guild: giveaway.guildId
		};
	}

	/* Reroll a giveaway by messageId */
	public async rerollGiveaway(giveawayId: string): Promise<boolean | Object> {
		/* Get giveaway */
		const giveaway: any = await this.getGiveaway(giveawayId);
		if (!giveaway) return false;

		/* Giveaway is not ended */
		if (!giveaway.ended) return false;

		/* Get new winners */
		const entrantIds: string[] = giveaway.entrantIds.filter(
			(entrantId: string): boolean =>
				!giveaway.exemptMembers.includes(entrantId) &&
				!giveaway.winnerIds.includes(entrantId)
		);
		const newWinners: string[] = [];

		for (let i = 0; i < giveaway.winnerCount; i++) {
			const newWinner: string = entrantIds[Math.floor(Math.random() * entrantIds.length)];
			if (!newWinner) continue;

			newWinners.push(newWinner);
			entrantIds.splice(entrantIds.indexOf(newWinner), 1);
		}

		/* Update giveaway */
		giveaway.ended = true;
		giveaway.winnerIds = newWinners;
		await giveaway.save().catch((err: Error): boolean => {
			return false;
		});

		await this.sendEndEmbed(giveaway);
		return {
			winnerCount: newWinners.length,
			winners: newWinners,
			prize: giveaway.prize,
			message: giveaway.messageId,
			channel: giveaway.channelId,
			guild: giveaway.guildId
		};
	}

	/* Send main embed */
	private async sendMainEmbed(giveaway: any): Promise<any> {
		/* Get guild */
		const guild: Guild | null = this.client.guilds.cache.get(giveaway.guildId) ?? null;
		if (!guild) return false;

		/* Get channel */
		const channel: any = guild.channels.cache.get(giveaway.channelId);
		if (!channel) return false;

		/* Get hoster */
		const hoster: any = await this.client.users
			.fetch(giveaway.hostedBy)
			.catch((): null => null);

		/* Create embed */
		const messageText: string =
			"## " + this.client.emotes.tada + "GEWINNSPIEL " + this.client.emotes.tada;
		const embed: EmbedBuilder = new EmbedBuilder()
			.setDescription(
				"## " +
					this.client.emotes.gift +
					" " +
					giveaway.prize +
					"\n\n" +
					"### " +
					this.client.emotes.arrow +
					" Um teilzunehmen, drücke den " +
					this.client.emotes.tada +
					" Button!\n\n" +
					this.client.emotes.calendar +
					" Endet am " +
					this.client.utils.getDiscordTimestamp(giveaway.endAt, "f") +
					"\n" +
					this.client.emotes.reminder +
					" Endet " +
					this.client.utils.getDiscordTimestamp(giveaway.endAt, "R") +
					"\n\n" +
					"### " +
					this.client.emotes.information +
					" Informationen\n" +
					this.client.emotes.heart +
					" Veranstaltet von " +
					hoster.toString() +
					"\n" +
					this.client.emotes.tada +
					" **" +
					giveaway.winnerCount +
					"** Gewinner/-innen\n" +
					this.client.emotes.users +
					" **" +
					giveaway.entrantIds.length +
					"** Teilnehmer/-innen\n\n" +
					"### " +
					this.client.emotes.rocket +
					" Teilnahmebedingungen\n" +
					this.client.emotes.arrow +
					" /"
			)
			.setThumbnail(this.client.user!.displayAvatarURL())
			.setColor(this.client.config.embeds["DEFAULT_COLOR"]);

		/* Create button */
		const participateButton: ButtonBuilder = this.client.createButton(
			"giveaway_participate",
			"\u200b",
			"Primary",
			this.client.emotes.tada
		);
		const buttonRow: any = this.client.createMessageComponentsRow(participateButton);

		if (giveaway.messageId) {
			/* Update existing message */
			const message: any = await channel.messages
				.fetch(giveaway.messageId)
				.catch((): null => null);
			if (message) {
				await message
					.edit({ content: messageText, embeds: [embed], components: [buttonRow] })
					.catch((): null => null);
				return {
					messageId: giveaway.messageId
				};
			}
		} else {
			/* Send new message */
			const giveawayMessage: any = await channel
				.send({ content: messageText, embeds: [embed], components: [buttonRow] })
				.catch((): null => null);
			if (!giveawayMessage) return false;
			return {
				messageId: giveawayMessage.id
			};
		}
	}

	/* Send end embed */
	public async sendEndEmbed(giveaway: any): Promise<boolean> {
		/* Get guild */
		const guild: Guild | null = this.client.guilds.cache.get(giveaway.guildId) ?? null;
		if (!guild) return false;

		/* Get channel */
		const channel: any = guild.channels.cache.get(giveaway.channelId);
		if (!channel) return false;

		/* Get message */
		const message: any = await channel.messages
			.fetch(giveaway.messageId)
			.catch((): null => null);
		if (!message) return false;

		/* Get hoster */
		const hoster: any = await this.client.users
			.fetch(giveaway.hostedBy)
			.catch((): null => null);

		/* Get winners discord users */
		const winners: string[] = [];
		for (const winnerId of giveaway.winnerIds) {
			const winner: any = await this.client.users.fetch(winnerId).catch((): null => null);
			if (!winner) continue;
			winners.push(winner.toString());
		}

		/* Send end embed */
		if (winners.length >= 1) {
			/* Winners */
			/* Create winners embed */
			const giveawayEndEmbed: EmbedBuilder = new EmbedBuilder()
				.setDescription(
					"## " +
						this.client.emotes.gift +
						" " +
						giveaway.prize +
						"\n\n" +
						"### " +
						this.client.emotes.arrow +
						" Es sind keine weiteren Teilnahmen möglich!\n\n" +
						this.client.emotes.calendar +
						" Endete am " +
						this.client.utils.getDiscordTimestamp(giveaway.endAt, "f") +
						"\n" +
						this.client.emotes.reminder +
						" Endete " +
						this.client.utils.getDiscordTimestamp(giveaway.endAt, "R") +
						"\n\n" +
						"### " +
						this.client.emotes.information +
						" Informationen\n" +
						this.client.emotes.heart +
						" Veranstaltet von " +
						hoster.toString() +
						"\n" +
						this.client.emotes.tada +
						" **" +
						giveaway.winnerCount +
						"** Gewinner/-innen\n" +
						this.client.emotes.users +
						" **" +
						giveaway.entrantIds.length +
						"** Teilnehmer/-innen\n\n" +
						"### " +
						this.client.emotes.tada +
						" Gewinner/-innen\n" +
						this.client.emotes.arrow +
						" " +
						winners.join(", ")
				)
				.setThumbnail(this.client.user!.displayAvatarURL())
				.setColor(this.client.config.embeds["ERROR_COLOR"]);

			/* Create disabled button */
			const participateButton: ButtonBuilder = this.client.createButton(
				"giveaway_participate",
				"\u200b",
				"Primary",
				this.client.emotes.tada,
				true
			);
			const buttonRow: any = this.client.createMessageComponentsRow(participateButton);

			/* Update message */
			await message
				.edit({ embeds: [giveawayEndEmbed], components: [buttonRow] })
				.catch((): null => null);

			/* Send congratulations message */
			const congratulationsMessage: string =
				"### " +
				this.client.emotes.tada +
				" Herzlichen Glückwunsch, " +
				winners.join(", ") +
				"!";
			await message.reply({ content: congratulationsMessage }).catch((): void => {});
			return true;
		} else {
			/* No winners */
			/* Create no winners embed */
			const giveawayEndEmbed: EmbedBuilder = new EmbedBuilder()
				.setDescription(
					"## " +
						this.client.emotes.gift +
						" " +
						giveaway.prize +
						"\n\n" +
						"### " +
						this.client.emotes.arrow +
						" Es sind keine weiteren Teilnahmen möglich!\n\n" +
						this.client.emotes.calendar +
						" Endete am " +
						this.client.utils.getDiscordTimestamp(giveaway.endAt, "f") +
						"\n" +
						this.client.emotes.reminder +
						" Endete " +
						this.client.utils.getDiscordTimestamp(giveaway.endAt, "R") +
						"\n\n" +
						"### " +
						this.client.emotes.information +
						" Informationen\n" +
						this.client.emotes.heart +
						" Veranstaltet von " +
						hoster.toString() +
						"\n" +
						this.client.emotes.tada +
						" **" +
						giveaway.winnerCount +
						"** Gewinner/-innen\n" +
						this.client.emotes.users +
						" **" +
						giveaway.entrantIds.length +
						"** Teilnehmer/-innen\n\n" +
						"### " +
						this.client.emotes.tada +
						" Gewinner/-innen\n" +
						this.client.emotes.arrow +
						" Es gibt keine Gewinner/-innen, da es keine Teilnahmen gab."
				)
				.setThumbnail(this.client.user!.displayAvatarURL())
				.setColor(this.client.config.embeds["ERROR_COLOR"]);

			/* Create disabled button */
			const participateButton: ButtonBuilder = this.client.createButton(
				"giveaway_participate",
				"\u200b",
				"Primary",
				this.client.emotes.tada,
				true
			);
			const buttonRow: any = this.client.createMessageComponentsRow(participateButton);

			/* Update message */
			await message
				.edit({ embeds: [giveawayEndEmbed], components: [buttonRow] })
				.catch((): null => null);

			/* Send congratulations message */
			const congratulationsMessage: string =
				"### " + this.client.emotes.tada + " Es gibt keine Gewinner/-innen!";
			await message.reply({ content: congratulationsMessage }).catch((): void => {});
			return true;
		}
	}

	/* Add entrant to giveaway */
	public async addEntrant(giveawayId: string, entrantId: string): Promise<boolean> {
		/* Get giveaway */
		const giveaway: any = await this.getGiveaway(giveawayId);
		if (!giveaway) return false;

		/* User already entered */
		if (giveaway.entrantIds.includes(entrantId)) return false;

		/* Add entrant */
		giveaway.entrantIds.push(entrantId);
		await giveaway.save().catch((err: Error): boolean => {
			return false;
		});

		/* Update message */
		await this.sendMainEmbed(giveaway);
		return true;
	}

	/* Remove entrant from giveaway */
	public async removeEntrant(giveawayId: string, entrantId: string): Promise<boolean> {
		/* Get giveaway */
		const giveaway: any = await this.getGiveaway(giveawayId);
		if (!giveaway) return false;

		/* User not entered */
		if (!giveaway.entrantIds.includes(entrantId)) return false;

		/* Remove entrant */
		giveaway.entrantIds.splice(giveaway.entrantIds.indexOf(entrantId), 1);
		await giveaway.save().catch((err: Error): boolean => {
			return false;
		});

		/* Update message */
		await this.sendMainEmbed(giveaway);
		return true;
	}
}
