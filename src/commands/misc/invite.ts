import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";
import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder } from "discord.js";
import path from "path";

export default class InviteCommand extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "invite",
			description: "See a list of links that might interest you",
			localizedDescriptions: {
				de: "Sieh eine Liste an Links, die dich interessieren könnten",
			},
			cooldown: 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder(),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
		await this.sendLinks();
	}

	private async sendLinks(): Promise<any> {
		// First row
		const inviteButton: ButtonBuilder = this.client.createButton(
			null,
			this.translate("invite"),
			"Link",
			this.client.emotes.logo.icon,
			false,
			this.client.createInvite(),
		);
		const supportButton: ButtonBuilder = this.client.createButton(
			null,
			this.translate("support"),
			"Link",
			this.client.emotes.discord,
			false,
			this.client.config.support["INVITE"],
		);
		const websiteButton: ButtonBuilder = this.client.createButton(
			null,
			this.translate("web"),
			"Link",
			this.client.emotes.globe,
			false,
			this.client.config.general["WEBSITE"],
		);
		const dashboardButton: ButtonBuilder = this.client.createButton(
			null,
			this.translate("dashboard"),
			"Link",
			this.client.emotes.settings,
			false,
			"https://cp.nevar.eu",
		);
		const buttonRow: any = this.client.createMessageComponentsRow(
			inviteButton,
			supportButton,
			websiteButton,
			dashboardButton,
		); // test

		// Second row
		const xButton: ButtonBuilder = this.client.createButton(
			null,
			this.translate("x"),
			"Link",
			this.client.emotes.socials.x,
			false,
			"https://nevar.eu/redirect/x",
		);
		const instagramButton: ButtonBuilder = this.client.createButton(
			null,
			this.translate("instagram"),
			"Link",
			this.client.emotes.socials.instagram,
			false,
			"https://nevar.eu/redirect/instagram",
		);
		const githubButton: ButtonBuilder = this.client.createButton(
			null,
			this.translate("github"),
			"Link",
			this.client.emotes.socials.github,
			false,
			"https://nevar.eu/redirect/github",
		);
		const voteButton: ButtonBuilder = this.client.createButton(
			null,
			this.translate("vote"),
			"Link",
			this.client.emotes.topgg,
			false,
			"https://nevar.eu/redirect/vote"
		);

		const buttonRow2: any = this.client.createMessageComponentsRow(
			voteButton,
			xButton,
			instagramButton,
			githubButton,
		);

		const text: string = "### " + this.client.emotes.discover + " " + this.translate("text");
		const linksEmbed: EmbedBuilder = this.client.createEmbed(text, null, "normal");

		return this.interaction.followUp({
			embeds: [linksEmbed],
			components: [buttonRow, buttonRow2],
		});
	}
}
