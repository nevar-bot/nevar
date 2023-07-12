import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder } from "discord.js";

export default class InviteCommand extends BaseCommand
{
	public constructor(client: BaseClient)
	{
		super(client, {
			name: "invite",
			description: "Gibt einen Überblick über wichtige Links",
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void>
	{
		this.interaction = interaction;
		await this.sendLinks();
	}

	private async sendLinks(): Promise<void>
	{

		// First row
		const inviteButton: ButtonBuilder = this.client.createButton(null, "Einladen", "Link", this.client.emotes.growth_up, false, this.client.createInvite());
		const supportButton: ButtonBuilder = this.client.createButton(null, "Support", "Link", this.client.emotes.discord, false, this.client.config.support["INVITE"]);
		const websiteButton: ButtonBuilder = this.client.createButton(null, "Website", "Link", this.client.emotes.text, false, this.client.config.general["WEBSITE"]);
		const voteButton: ButtonBuilder = this.client.createButton(null, "Voten", "Link", this.client.emotes.heart, false, "https://top.gg/" + this.client!.user!.id + "/vote");
		const buttonRow: any = this.client.createMessageComponentsRow(inviteButton, supportButton, websiteButton, voteButton);

		// Second row
		const twitterButton: ButtonBuilder = this.client.createButton(null, "Twitter", "Link", this.client.emotes.socials.twitter, false, "https://twitter.com/nevar_eu");
		const instagramButton: ButtonBuilder = this.client.createButton(null, "Instagram", "Link", this.client.emotes.socials.instagram, false, "https://www.instagram.com/nevar_eu/");
		const githubButton: ButtonBuilder = this.client.createButton(null, "GitHub", "Link", this.client.emotes.socials.github, false, "https://github.com/nevar-bot");
		const donateButton: ButtonBuilder = this.client.createButton(null, "Unterstützen", "Link", this.client.emotes.gift, false, "https://prohosting24.de/cp/donate/nevar");
		const buttonRow2: any = this.client.createMessageComponentsRow(twitterButton, instagramButton, githubButton, donateButton);

		const text: string = "### " + this.client.emotes.discover + " Folgende Links könnten dich interessieren:";
		const linksEmbed: EmbedBuilder = this.client.createEmbed(text, null, "normal");
		linksEmbed.setThumbnail(this.client.user!.displayAvatarURL());

		return this.interaction.followUp({ embeds: [linksEmbed], components: [buttonRow, buttonRow2] });
	}
}