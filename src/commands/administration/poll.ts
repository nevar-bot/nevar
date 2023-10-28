import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";

export default class PollCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "poll",
			description: "Starts a new poll",
			localizedDescriptions: {
				de: "Startet eine neue Umfrage"
			},
			memberPermissions: ["ManageGuild"],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName("title")
							.setDescription("Give the poll a meaningful title")
							.setDescriptionLocalizations({
								de: "Gib der Umfrage einen aussagekräftigen Titel"
							})
							.setRequired(true)
					)
					.addStringOption((option: any) =>
						option
							.setName("options")
							.setDescription("Enter the answer choices, separated by a comma")
							.setDescriptionLocalizations({
								de: "Gib die Antwortmöglichkeiten ein, getrennt durch ein Komma"
							})
							.setRequired(true)
					)
			}
		});
	}
	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;

		await this.startPoll(interaction.options.getString("title"), interaction.options.getString("options"), data);
	}

	private async startPoll(title: string, options: string, data: any): Promise<void> {
		let circles: string[] = ["🔵", "🟢", "🔴", "🟡", "🟤", "🟣", "🟠"];
		circles = this.client.utils.shuffleArray(circles);

		const optionsArray: string[] = options.split(",").map((option: string) => option.trim());

		if (optionsArray.length > circles.length) {
			optionsArray.splice(circles.length);
		}

		let pollDescription: string = "## " + title + "\n\n";

		let i: number = 0;
		for (let option of optionsArray) {
			if (option === "") {
				optionsArray.splice(i, 1);
				continue;
			}
			pollDescription += circles[i] + " - " + option + "\n";
			pollDescription += this.client.emotes.poll.dark.start;
			for (let j = 0; j < 8; j++) {
				pollDescription += this.client.emotes.poll.dark.middle;
			}
			pollDescription += this.client.emotes.poll.dark.end + " 0 - 0%\n\n";

			i++;
		}

		const pollEmbed: EmbedBuilder = this.client.createEmbed(pollDescription, null, "normal");
		const pollMessage: any = await this.interaction.followUp({ embeds: [pollEmbed] });

		for (let i = 0; i < optionsArray.length; i++) {
			await pollMessage.react(circles[i]);
		}

		const poll: Object = {
			title: title,
			channelId: pollMessage.channelId,
			messageId: pollMessage.id,
			options: optionsArray,
			circles: circles
		};

		if (!data.guild.settings.polls) data.guild.settings.polls = [];
		data.guild.settings.polls.push(poll);
		data.guild.markModified("settings.polls");
		await data.guild.save();
	}
}
