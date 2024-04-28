import { NevarCommand } from "@core/NevarCommand.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { NevarClient } from "@core/NevarClient";
import path from "path";

export default class LetmegooglethatCommand extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "letmegooglethat",
			description: "Play Google Assistant for other users",
			localizedDescriptions: {
				de: "Spiele Google-Assistant für andere Nutzer"
			},
			cooldown: 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName("text")
							.setDescription("Enter the search query")
							.setDescriptionLocalization("de", "Gib die Suchanfrage an")
							.setRequired(true),
					)
					.addUserOption((option: any) =>
						option
							.setName("user")
							.setNameLocalization("de", "nutzer")
							.setDescription("Select the user you want to help")
							.setDescriptionLocalization("de", "Wähle den Nutzer dem du helfen möchtest")
							.setRequired(false),
					),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
		return this.googleThat(interaction.options.getString("text"), interaction.options.getUser("user"));
	}

	private async googleThat(text: string, user: any = null): Promise<any> {
		const searchUrl: string = "https://letmegooglethat.com/?q=" + encodeURIComponent(text);
		const googleText: string = user
			? this.translate("searchWithUser", { user: user.displayName, text, searchUrl })
			: this.translate("searchWithoutUser", { text, searchUrl });
		const letMeGoogleThatEmbed: EmbedBuilder = this.client.createEmbed(
			googleText,
			"search",
			"normal"
		);
		return this.interaction.followUp({ embeds: [letMeGoogleThatEmbed] });
	}
}
