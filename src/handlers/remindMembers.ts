import moment from "moment";
import { Guild, GuildMember } from "discord.js";

export default {
	init(client: any): void {
		client.membersData.find({ "reminders.0": { $exists: true } }).then((members: any): void => {
			members.forEach((member: any): void => {
				client.databaseCache.reminders.set(member.id + member.guildID, member);
			});
		});

		setInterval((): void => {
			for (const memberData of [...client.databaseCache.reminders.values()]) {
				for (const reminder of memberData.reminders) {
					if (reminder.endDate <= Date.now()) {
						const guild: Guild | undefined = client.guilds.cache.get(memberData.guildID);
						if (!guild) continue;

						const channel: any = guild.channels.cache.get(reminder.channel);
						if (!channel) continue;

						guild.members
							.fetch(memberData.id)
							.then((member: GuildMember): void => {
								const reminderAgo = client.utils.getRelativeTime(reminder.startDate);
								const reminderStarted = moment(reminder.startDate).format("DD.MM.YYYY HH:mm");

								const text: string =
									"### " +
									client.emotes.reminder +
									" Hier ist deine Erinnerung, die du vor " +
									reminderAgo +
									" erstellt hast!\n" +
									client.emotes.arrow +
									" Erstellt am: " +
									reminderStarted +
									"\n" +
									client.emotes.arrow +
									" Erinnerung: " +
									reminder.reason;

								const remindEmbed = client.createEmbed(text, null, "normal");

								channel.send({
									content: member.toString(),
									embeds: [remindEmbed]
								});

								memberData.reminders = memberData.reminders.filter((r: any) => r.startDate !== reminder.startDate);
								memberData.markModified("reminders");
								memberData.save();
							})
							.catch((): void => {});
					}
				}
			}
		}, 1000);
	}
};
