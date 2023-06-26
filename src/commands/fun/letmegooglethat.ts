import BaseCommand from "@structures/BaseCommand";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import BaseClient from "@structures/BaseClient";

export default class LetmegooglethatCommand extends BaseCommand {
    public constructor(client: BaseClient) {
        super(client, {
            name: "letmegooglethat",
            description: "Führt eine Google-Suche durch für Nutzer welche dazu nicht in der Lage sind",
            cooldown: 1000,
            dirname: __dirname,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addStringOption((option: any) => option
                            .setName("text")
                            .setDescription("Gib deine Suchanfrage ein")
                            .setRequired(true)
                        )
                        .addUserOption((option: any) => option
                            .setName("nutzer")
                            .setDescription("Wähle für wen du die Suchanfrage durchführen möchtest")
                            .setRequired(false)
                        )
            }
        });
    }

    private interaction: any;

    public async dispatch(interaction: any, data: any): Promise<void> {
        this.interaction = interaction;
        return this.googleThat(interaction.options.getString("text"), interaction.options.getUser("nutzer"));
    }

    private async googleThat(text: string, user: any = null): Promise<void> {
        const searchUrl: string = "https://google.com/search?q=" + encodeURIComponent(text);
        const googleText: string = user ? "Lass mich das für dich googlen, " + user.username + ": [{0}]({1})" : "Lass mich das für dich googlen: [{0}]({1})";
        const letMeGoogleThatEmbed: EmbedBuilder = this.client.createEmbed(googleText, "search", "normal", text, searchUrl);
        return this.interaction.followUp({ embeds: [letMeGoogleThatEmbed] });
    }
}