import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder, ChannelType } from "discord.js";

export default class AimodCommand extends BaseCommand
{
    public constructor(client: BaseClient){
        super(client, {
            name: "aimod",
            description: "Verwaltet die AI-gestützte Chatmoderation des Servers",
            memberPermissions: ["ManageGuild"],
            cooldown: 2 * 1000,
            dirname: __dirname,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addStringOption((option: any) => option
                        .setName("aktion")
                        .setDescription("Wähle aus den folgenden Aktionen")
                        .setRequired(true)
                        .addChoices(
                            {
                                name: "erklärung",
                                value: "explain"
                            }
                        )
                    )
            }
        })
    }

    private interaction: any;

    public async dispatch(interaction: any, data: any): Promise<void>
    {
        this.interaction = interaction;
        const action: string = interaction.options.getString("aktion");
        switch (action) {
            case "explain":
                await this.explain();
        }
    }

    private async explain(): Promise<void>{
        const explainText: string =
            this.client.emotes.information + " Die **Chatmoderation** von " + this.client.user!.username + " ist eine Funktion, welche Nachrichten auf **potenziell unangemessene Inhalte** überprüft.\n" +
            this.client.emotes.search + " Dabei wird der Inhalt der gesendeten Nachrichten mit Hilfe einer **künstlichen Intelligenz** analysiert, und in verschiedenen Kategorien bewertet.\n\n" +
            this.client.emotes.arrow + " Folgende Kategorien werden währenddessen überprüft, und bewertet:\n" +
            this.client.emotes.folder + " **Unangemessenheit**\n" +
            this.client.emotes.folder + " **Schwere Unangemessenheit**\n" +
            this.client.emotes.folder + " **Beleidigung**\n" +
            this.client.emotes.folder + " **Vulgäre Inhalte**\n" +
            this.client.emotes.folder + " **Bedrohung**\n\n" +
            this.client.emotes.bot + " Jeder Kategorie wird hierbei ein Wert zwischen **0 und 1** zugewiesen.\n" +
            this.client.emotes.arrow + " Dabei steht 0 für **nicht unangemessen**, und 1 für **sehr unangemessen**.\n\n" +
            this.client.emotes.search + " Abschließend wird der errechnete **Durchschnittswert** mit dem individuell festgelegten **Schwellenwert verglichen**.\n" +
            this.client.emotes.arrows.up + " Ist der Durchschnittswert **höher** als der Schwellenwert, wird die Nachricht als **potenziell unangemessen** eingestuft und eine Warnung mit entsprechenden Handlungsmöglichkeiten wird an die Moderatoren gesendet.\n" +
            this.client.emotes.arrows.down + " Ist der Durchschnittswert **niedriger** als der Schwellenwert, wird die Nachricht als **nicht unangemessen** eingestuft und es ist kein Eingreifen erforderlich.\n\n" +
            this.client.emotes.beta + " **Hinweis:** Diese Funktion befindet sich derzeit noch in der **Beta-Phase** und kann daher Fehler enthalten. Die AI-gestützte Chatmoderation **handelt nicht selber**, sondern gibt lediglich Warnungen ab. Für jede Handlung ist **menschliches Eingreifen erforderlich**.";

        const embed: EmbedBuilder = this.client.createEmbed(explainText, null, "normal");
        embed.setTitle(this.client.emotes.flags.CertifiedModerator + " Erklärung der AI-gestützten Chatmoderation");
        return this.interaction.followUp({ embeds: [embed] });
    }
}