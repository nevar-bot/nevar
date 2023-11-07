import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, Guild } from "discord.js";

export default {
	init(client: BaseClient): void {
		setInterval((): void => {
			client.guilds.cache.forEach((guild: Guild): void => {
				client.findOrCreateGuild(guild.id).then((guildData: any): void => {
					if (!guildData.settings?.polls) return;

					for (const poll of guildData.settings?.polls) {
						const { title, channelId, messageId, options, circles } = poll;

						const channel: any = guild.channels.cache.get(channelId);
						if (!channel) continue;

						channel.messages
							.fetch(messageId)
							.then(async (pollMessage: any): Promise<void> => {
								const pollVotes: Object[] = [];

								pollMessage.reactions.cache.forEach((reaction: any): void => {
									pollVotes.push({
										emoji: reaction._emoji.name,
										count: reaction.count
									});
								});

								const totalVoteCount: number =
									pollVotes.reduce(
										(total: number, emoji: any) => total + emoji.count,
										0
									) - pollVotes.length;
								const votePercentages: any[] = pollVotes.map((vote: any) => ({
									emoji: vote.emoji,
									percentage: ((vote.count - 1) / totalVoteCount) * 100,
									votes: vote.count - 1
								}));

								votePercentages.forEach((item) => {
									if (isNaN(item.percentage)) item.percentage = 0;
								});

								let pollDescription: string = "## " + title + "\n\n";

								let i: number = 0;

								for (const option of options) {
									const vote: any = votePercentages.find(
										(vote: any): boolean => vote.emoji === circles[i]
									);

									const hasToBeBright: number = Math.round(vote.percentage / 10);
									pollDescription += circles[i] + " - " + option + "\n";
									pollDescription +=
										hasToBeBright > 0
											? client.emotes.poll.bright.start
											: client.emotes.poll.dark.start;
									for (let j = 0; j < 8; j++) {
										if (j < hasToBeBright - 1)
											pollDescription += client.emotes.poll.bright.middle;
										else pollDescription += client.emotes.poll.dark.middle;
									}
									pollDescription +=
										hasToBeBright === 10
											? client.emotes.poll.bright.end
											: client.emotes.poll.dark.end;
									pollDescription +=
										" " +
										vote.votes +
										" - " +
										vote.percentage.toFixed(0) +
										"%\n\n";

									i++;
								}

								const pollEmbed: EmbedBuilder = client.createEmbed(
									pollDescription,
									null,
									"normal"
								);

								if (
									pollMessage.embeds[0].description.trim() !==
									pollEmbed.data.description!.trim()
								) {
									await pollMessage.edit({ embeds: [pollEmbed] });
								}
							})
							.catch((): void => {});
					}
				});
			});
		}, 4 * 1000);
	}
};
