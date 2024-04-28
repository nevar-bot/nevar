import { Guild, GuildMember, EmbedBuilder } from "discord.js";
import { NevarClient } from "@core/NevarClient";

export class ReminderFinisher {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
		this.reminderMembers();
	}

	private reminderMembers(): void {
		this.client.membersData.find({ "reminders.0": { $exists: true } }).then((members: any[]): void => {
			members.forEach((member: any): void => {
				this.client.databaseCache.reminders.set(member.id + member.guildID, member);
			});
		});

		setInterval((): void => {
			for (const memberData of this.client.databaseCache.reminders.values()) {
				memberData.reminders.forEach((reminder: any): void => {
					if (reminder.endDate <= Date.now()) {
						const guild: Guild|undefined = this.client.guilds.cache.get(memberData.guildID);
						if (!guild) return;

						const channel: any = guild.channels.cache.get(reminder.channel);
						if (!channel) return;

						guild.members.fetch(memberData.id).then((member: GuildMember): void => {
							const reminderAgo = this.client.utils.getDiscordTimestamp(reminder.startDate, "R");
							const text: string = "### " + this.client.emotes.reminder + " " + guild.translate("handlers/remindMembers:hereIsYourReminder", { time: reminderAgo, reminder: reminder.reason });

							const remindEmbed: EmbedBuilder = this.client.createEmbed(text, null, "normal");
							channel.send({ content: member.toString(), embeds: [remindEmbed] });

							memberData.reminders = memberData.reminders.filter((r: any): boolean => r.startDate !== reminder.startDate);
							memberData.markModified("reminders");
							memberData.save();
						}).catch((): void => {});
					}
				});
			}
		}, 1000);
	}
}
