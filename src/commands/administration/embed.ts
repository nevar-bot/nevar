import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";


export default class EmbedCommand extends BaseCommand {
    public constructor(client: BaseClient) {
        super(client, {
            name: "embed",
            description: "Ermöglicht das Senden eines angepassten Embeds",
            memberPermissions: ["ManageGuild"],
            botPermissions: ["ManageWebhooks"],
            cooldown: 5 * 1000,
            dirname: __dirname,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addStringOption((option: any) => option
                        .setName("autor")
                        .setDescription("Gib den Namen des Autors ein")
                        .setRequired(true)
                    )
                    .addAttachmentOption((option: any) => option
                        .setName("icon")
                        .setDescription("Wähle den Avatar des Autors")
                        .setRequired(false)
                    )
                    .addStringOption((option: any) => option
                        .setName("titel")
                        .setDescription("Gib den Titel des Embeds ein")
                        .setRequired(false)
                    )
                    .addStringOption((option: any) => option
                        .setName("beschreibung")
                        .setDescription("Gib die Beschreibung des Embeds ein")
                        .setRequired(false)
                    )
                    .addAttachmentOption((option: any) => option
                        .setName("thumbnail")
                        .setDescription("Wähle das Thumbnail des Embeds")
                        .setRequired(false)
                    )
                    .addAttachmentOption((option: any) => option
                        .setName("bild")
                        .setDescription("Wähle das Bild des Embeds")
                        .setRequired(false)
                    )
                    .addStringOption((option: any) => option
                        .setName("footertext")
                        .setDescription("Gib den Text des Footers ein")
                        .setRequired(false)
                    )
                    .addAttachmentOption((option: any) => option
                        .setName("footericon")
                        .setDescription("Wähle das Icon des Footers")
                        .setRequired(false)
                    )
                    .addStringOption((option: any) => option
                        .setName("farbe")
                        .setDescription("Gib die Farbe des Embeds im HEX-Format ein")
                        .setRequired(false)
                    )
            }
        });
    }

    private interaction: any;

    public async dispatch(interaction: any, data: any): Promise<void> {
        this.interaction = interaction;
        await this.createEmbed();
    }

    private async createEmbed(){
        const author: string = this.interaction.options.getString("autor");
        const authorIcon: any = this.interaction.options.getAttachment("icon");
        const title: string = this.interaction.options.getString("titel");
        const description: string = this.interaction.options.getString("beschreibung");
        const thumbnail: any = this.interaction.options.getAttachment("thumbnail");
        const image: any = this.interaction.options.getAttachment("bild");
        const footerText: string = this.interaction.options.getString("footertext");
        const footerIcon: any = this.interaction.options.getAttachment("footericon");
        const color: any = this.interaction.options.getString("farbe") || this.client.config.embeds["DEFAULT_COLOR"];

        if(color && !this.client.utils.stringIsHexColor(color)){
            const errorEmbed: EmbedBuilder = this.client.createEmbed("Du musst eine Farbe im HEX-Format eingeben.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        if(authorIcon && !authorIcon.contentType.startsWith("image/")){
            const errorEmbed: EmbedBuilder = this.client.createEmbed("Das Autor-Icon muss ein Bild sein.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        if(thumbnail && !thumbnail.contentType.startsWith("image/")){
            const errorEmbed: EmbedBuilder = this.client.createEmbed("Das Thumbnail muss ein Bild sein.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        if(image && !image.contentType.startsWith("image/")){
            const errorEmbed: EmbedBuilder = this.client.createEmbed("Das Embed-Bild muss ein Bild sein.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        if(footerIcon && !footerIcon.contentType.startsWith("image/")){
            const errorEmbed: EmbedBuilder = this.client.createEmbed("Das Footer-Icon muss ein Bild sein.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        // Generate embed
        const embed: EmbedBuilder = new EmbedBuilder()
            .setAuthor({ name: author, iconURL: (authorIcon ? authorIcon.proxyURL : null), url: this.client.config.general["WEBSITE"] })
            .setTitle(title)
            .setDescription(description)
            .setThumbnail(thumbnail ? thumbnail.proxyURL : null)
            .setImage(image ? image.proxyURL : null)
            .setFooter({ text: footerText, iconURL: (footerIcon ? footerIcon.proxyURL : null) })
            .setColor(color);

        const webhook = await this.interaction.channel.createWebhook({
            name: author,
            avatar: authorIcon ? authorIcon.proxyURL : null
        }).catch((e: any): void => {});

        if(webhook){
            webhook.send({ embeds: [embed] }).catch(() => {
                const errorEmbed: EmbedBuilder = this.client.createEmbed("Beim Senden des Embeds ist ein unerwarteter Fehler aufgetreten.", "error", "error");
                return this.interaction.followUp({ embeds: [errorEmbed] });
            });
            webhook.delete().catch((e: any): void => {});
            const successEmbed: EmbedBuilder = this.client.createEmbed("Das Embed wurde erstellt und gesendet.", "success", "success");
            return this.interaction.followUp({ embeds: [successEmbed] });
        }else{
            const errorEmbed: EmbedBuilder = this.client.createEmbed("Beim Erstellen des Webhooks ist ein Fehler aufgetreten.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }
    }
}