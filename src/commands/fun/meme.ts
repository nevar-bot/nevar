import BaseCommand from "@structures/BaseCommand";
import { ButtonBuilder, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import BaseClient from "@structures/BaseClient";
import axios from "axios";

export default class MemeCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "meme",
			description: "Sends randomly selected memes",
			localizedDescriptions: {
				de: "Sendet zufällig gewählte Memes"
			},
			cooldown: 3 * 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
			}
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		return await this.sendMeme(interaction.member);
	}

	private async sendMeme(member: any): Promise<void> {
		const self = this;

		let memes: any = (
			await axios.get("https://www.reddit.com/r/ich_iel/top.json?sort=top&t=day&limit=1000", {
				validateStatus: (status: number): boolean => true
			})
		).data.data.children;
		memes = [...this.client.utils.shuffleArray(memes)];

		const reloadId: string = member.user.id + "_reload";
		const reloadButton: ButtonBuilder = this.client.createButton(
			reloadId,
			this.translate("reload"),
			"Secondary",
			"loading"
		);

		function generateMemeEmbed(): EmbedBuilder {
			const meme = memes[Math.floor(Math.random() * memes.length)];
			const memeEmbed: EmbedBuilder = self.client.createEmbed(null, null, "normal");
			memeEmbed.setImage(meme.data.url);
			memeEmbed.setTitle(meme.data.title);
			memeEmbed.setFooter({
				text: "👍 " + meme.data.ups + " | 👎 " + meme.data.downs
			});
			return memeEmbed;
		}

		const memeMessage: any = await this.interaction.followUp({
			embeds: [generateMemeEmbed()],
			components: [this.client.createMessageComponentsRow(reloadButton)]
		});

		const collector: any = memeMessage.createMessageComponentCollector({
			filter: ({ user }: any): boolean => user.id === member.user.id
		});

		collector.on("collect", async (interaction: any): Promise<void> => {
			await interaction.update({
				embeds: [generateMemeEmbed()],
				components: [this.client.createMessageComponentsRow(reloadButton)]
			});
		});
	}
}
