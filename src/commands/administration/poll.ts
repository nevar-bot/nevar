import BaseCommand from "@structures/BaseCommand.js";
import BaseClient from "@structures/BaseClient.js";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";
import path from "path";

export default class PollCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "poll",
			description: "Get the opinion of the users",
			localizedDescriptions: {
				de: "Hole dir die Meinung der Nutzer ein",
			},
			memberPermissions: ["ManageGuild"],
			cooldown: 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName("title")
							.setNameLocalization("de", "titel")
							.setDescription("Enter the title of your survey")
							.setDescriptionLocalization("de", "Gib den Titel deiner Umfrage an")
							.setRequired(true),
					)
					.addStringOption((option: any) =>
						option
							.setName("options")
							.setNameLocalization("de", "optionen")
							.setDescription("Choose your answer options, separated by a comma")
							.setDescriptionLocalization("de", "Wähle deine Antwortmöglichkeiten, getrennt durch ein Komma")
							.setRequired(true),
					),
			},
		});
	}
	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;

		await this.startPoll(interaction.options.getString("title"), interaction.options.getString("options"));
	}

	private async startPoll(title: string, options: string): Promise<void> {
		let circles: string[] = ["🔵", "🟢", "🔴", "🟡", "🟤", "🟣", "🟠"];
		circles = this.client.utils.shuffleArray(circles);

		const optionsArray: string[] = options.split(",").map((option: string) => option.trim());

		if (optionsArray.length > circles.length) {
			optionsArray.splice(circles.length);
		}

		let pollDescription: string = "## " + title + "\n\n";

		let i: number = 0;
		for (const option of optionsArray) {
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
			circles: circles,
		};

		if (!this.data.guild.settings.polls) this.data.guild.settings.polls = [];
		this.data.guild.settings.polls.push(poll);
		this.data.guild.markModified("settings.polls");
		await this.data.guild.save();
	}
}
