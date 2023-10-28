import BaseCommand from "@structures/BaseCommand";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import BaseClient from "@structures/BaseClient";

export default class LetmegooglethatCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "letmegooglethat",
			description: "Performs a Google search for users who are not able to do so.",
			localizedDescriptions: {
				de: "Führt eine Google-Suche durch für Nutzer/-innen welche dazu nicht in der Lage sind"
			},
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName("text")
							.setDescription("Enter your search query")
							.setDescriptionLocalizations({
								de: "Gib deine Suchanfrage ein"
							})
							.setRequired(true)
					)
					.addUserOption((option: any) =>
						option
							.setName("user")
							.setDescription("Choose for whom you want to perform the search query")
							.setDescriptionLocalizations({
								de: "Wähle für wen du die Suchanfrage durchführen möchtest"
							})
							.setRequired(false)
					)
			}
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		return this.googleThat(interaction.options.getString("text"), interaction.options.getUser("user"));
	}

	private async googleThat(text: string, user: any = null): Promise<void> {
		const searchUrl: string = "https://google.com/search?q=" + encodeURIComponent(text);
		const googleText: string = user
			? this.translate("fun/letmegooglethat:searchFor", { user: user.displayName, text, searchUrl })
			: this.translate("fun/letmegooglethat:search", { text, searchUrl });
		const letMeGoogleThatEmbed: EmbedBuilder = this.client.createEmbed(googleText, "search", "normal", text, searchUrl);
		return this.interaction.followUp({ embeds: [letMeGoogleThatEmbed] });
	}
}
