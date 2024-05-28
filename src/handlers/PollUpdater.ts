import { EmbedBuilder, Guild } from "discord.js";
import { NevarClient } from "@core/NevarClient";

export class PollUpdater {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
		setInterval((): void => {
			this.updatePolls();
		}, 10 * 1000);
	}

	private updatePolls(): void {
		this.client.guilds.cache.forEach(async (guild: Guild): Promise<void> => {
			const guildData = await this.client.findOrCreateGuild(guild.id);
			if (!guildData.settings?.polls) return;

			for (const poll of guildData.settings.polls) {
				const { title, channelId, messageId, options, circles } = poll;

				const channel: any = guild.channels.cache.get(channelId);
				if (!channel) continue;

				const pollMessage = await channel.messages.fetch(messageId).catch((): void => {});
				if(!pollMessage) continue;
				const pollVotes = pollMessage.reactions.cache.map((reaction: any): any => ({
					emoji: reaction._emoji.name,
					count: reaction.count,
				}));

				const totalVoteCount: number = pollVotes.reduce((total: number, emoji: any): void => total + emoji.count, 0) - pollVotes.length;

				const votePercentages: any = pollVotes.map((vote: any): any => ({
					emoji: vote.emoji,
					percentage: ((vote.count - 1) / totalVoteCount) * 100 || 0,
					votes: vote.count - 1,
				}));

				let pollDescription: string = "## " + title + "\n\n";

				options.forEach((option: any, index: any): void => {
					const vote = votePercentages.find((v: any): boolean => v.emoji === circles[index]) || { percentage: 0, votes: 0 };

					const hasToBeBright: number = Math.round(vote.percentage / 10);
					pollDescription += circles[index] + " - " + option + "\n";
					pollDescription +=
						hasToBeBright > 0
							? this.client.emotes.poll.bright.start
							: this.client.emotes.poll.dark.start;

					for (let j = 0; j < 8; j++) {
						pollDescription += j < hasToBeBright - 1 ? this.client.emotes.poll.bright.middle : this.client.emotes.poll.dark.middle;
					}

					pollDescription +=
						hasToBeBright === 10
							? this.client.emotes.poll.bright.end
							: this.client.emotes.poll.dark.end;

					pollDescription += " " + vote.votes + " - " + vote.percentage.toFixed(0) + "%\n\n";
				});

				const pollEmbed: EmbedBuilder = this.client.createEmbed(pollDescription, null, "normal");

				if (pollMessage.embeds[0].description.trim() !== pollEmbed.data.description!.trim()) {
					await pollMessage.edit({ embeds: [pollEmbed] });
				}
			}
		});
	}
}