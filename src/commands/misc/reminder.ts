import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import moment from "moment";
import ems from "enhanced-ms";
const ms: any = ems("de");

export default class ReminderCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "reminder",
			description: "Manages your reminders",
			localizedDescriptions: {
				de: "Verwaltet deine Reminder"
			},
			cooldown: 2 * 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName("action")
							.setNameLocalizations({
								de: "aktion"
							})
							.setDescription("Choose an action")
							.setDescriptionLocalizations({
								de: "Wähle eine Aktion"
							})
							.setRequired(true)
							.addChoices(
								{
									name: "add",
									name_localizations: {
										de: "erstellen"
									},
									value: "add"
								},
								{
									name: "delete",
									name_localizations: {
										de: "löschen"
									},
									value: "delete"
								},
								{
									name: "list",
									name_localizations: {
										de: "liste"
									},
									value: "list"
								}
							)
					)
					.addStringOption((option: any) =>
						option
							.setName("name")
							.setDescription(
								"What do you want me to remind you of? (when deleting: name of the memory)"
							)
							.setDescriptionLocalizations({
								de: "Woran soll ich dich erinnern? (beim löschen: Name der Erinnerung)"
							})
							.setRequired(false)
							.setMaxLength(500)
					)
					.addStringOption((option: any) =>
						option
							.setName("duration")
							.setNameLocalizations({
								de: "dauer"
							})
							.setDescription("When should I remind you? (e.g. 1h, 1w, 1w, 1h 30m)")
							.setDescriptionLocalizations({
								de: "Wann soll ich dich erinnern? (z.B. 1h, 1w, 1w, 1h 30m)"
							})
							.setRequired(false)
					)
			}
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;

		const action = interaction.options.getString("action");
		switch (action) {
			case "add":
				await this.addReminder(
					interaction.options.getString("name"),
					interaction.options.getString("duration"),
					data
				);
				break;
			case "delete":
				await this.deleteReminder(interaction.options.getString("name"), data);
				break;
			case "list":
				await this.listReminders(data);
				break;
		}
	}

	private async addReminder(name: string, dauer: string, data: any): Promise<void> {
		if (!name || !dauer || !ms(dauer)) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:missingNameOrDuration"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		const reminder: any = {
			startDate: Date.now(),
			endDate: Date.now() + ms(dauer),
			reason: name,
			channel: this.interaction.channel.id
		};

		data.member.reminders.push(reminder);
		data.member.markModified("reminders");
		await data.member.save();
		this.client.databaseCache.reminders.set(
			this.interaction.member.user.id + this.interaction.guild.id,
			data.member
		);

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("created", { duration: ms(ms(dauer)) }),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async deleteReminder(name: string, data: any): Promise<void> {
		if (!name) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:missingName"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}
		const reminder: any = data.member.reminders.find((r: any): boolean => r.reason === name);
		if (!reminder) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:noReminderWithThisName"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		data.member.reminders.splice(data.member.reminders.indexOf(reminder), 1);
		data.member.markModified("reminders");
		await data.member.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("deleted"),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async listReminders(data: any): Promise<void> {
		const reminders: any[] = [];
		for (let reminder of data.member.reminders) {
			const text: string =
				"### " +
				this.client.emotes.reminder +
				" " +
				reminder.reason +
				"\n" +
				this.client.emotes.arrow +
				" " +
				this.translate("createdAt") +
				" " +
				this.client.utils.getDiscordTimestamp(reminder.startDate, "f") +
				"\n" +
				this.client.emotes.arrow +
				" " +
				this.translate("endsAt") +
				" " +
				this.client.utils.getDiscordTimestamp(reminder.endDate, "f") +
				"\n" +
				this.client.emotes.arrow +
				" " +
				this.translate("endsIn") +
				" " +
				this.client.utils.getDiscordTimestamp(reminder.endDate, "R");
			reminders.push(text);
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			5,
			reminders,
			this.translate("reminders"),
			this.translate("errors:noReminders"),
			null
		);
	}
}
