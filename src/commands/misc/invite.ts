import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder } from "discord.js";

export default class InviteCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "invite",
			description: "Lists all links that might interest you",
			localizedDescriptions: {
				de: "Listet alle Links auf, die dich interessieren könnten"
			},
			cooldown: 1000,
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
		await this.sendLinks();
	}

	private async sendLinks(): Promise<void> {
		// First row
		const inviteButton: ButtonBuilder = this.client.createButton(
			null,
			this.translate("misc/invite:invite"),
			"Link",
			this.client.emotes.growth_up,
			false,
			this.client.createInvite()
		);
		const supportButton: ButtonBuilder = this.client.createButton(
			null,
			this.translate("misc/invite:support"),
			"Link",
			this.client.emotes.discord,
			false,
			this.client.config.support["INVITE"]
		);
		const websiteButton: ButtonBuilder = this.client.createButton(
			null,
			this.translate("misc/invite:web"),
			"Link",
			this.client.emotes.text,
			false,
			this.client.config.general["WEBSITE"]
		);
		const dashboardButton: ButtonBuilder = this.client.createButton(
			null,
			this.translate("misc/invite:dashboard"),
			"Link",
			this.client.emotes.settings,
			false,
			"https://cp.nevar.eu"
		);
		const buttonRow: any = this.client.createMessageComponentsRow(inviteButton, supportButton, websiteButton, dashboardButton); // test

		// Second row
		const xButton: ButtonBuilder = this.client.createButton(
			null,
			this.translate("misc/invite:x"),
			"Link",
			this.client.emotes.socials.x,
			false,
			"https://x.com/nevar_eu"
		);
		const instagramButton: ButtonBuilder = this.client.createButton(
			null,
			this.translate("misc/invite:instagram"),
			"Link",
			this.client.emotes.socials.instagram,
			false,
			"https://www.instagram.com/nevar_eu/"
		);
		const githubButton: ButtonBuilder = this.client.createButton(
			null,
			this.translate("misc/invite:github"),
			"Link",
			this.client.emotes.socials.github,
			false,
			"https://github.com/nevar-bot"
		);
		const voteButton: ButtonBuilder = this.client.createButton(
			null,
			this.translate("misc/invite:vote"),
			"Link",
			this.client.emotes.topgg,
			false,
			"https://top.gg/" + this.client.user!.id + "/vote"
		);

		const buttonRow2: any = this.client.createMessageComponentsRow(voteButton, xButton, instagramButton, githubButton);

		const text: string = "### " + this.client.emotes.discover + " " + this.translate("misc/invite:text");
		const linksEmbed: EmbedBuilder = this.client.createEmbed(text, null, "normal");
		linksEmbed.setThumbnail(this.client.user!.displayAvatarURL());

		return this.interaction.followUp({
			embeds: [linksEmbed],
			components: [buttonRow, buttonRow2]
		});
	}
}
