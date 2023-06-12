import BaseClient from "@structures/BaseClient";
import {
    ActionRowBuilder,
    AnyComponentBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";

export default class {
    public client: BaseClient;

    constructor(client: BaseClient) {
        this.client = client;
    }

    async dispatch(interaction: any, customId: any, data: any, guild: any): Promise<any> {

        /* Get message id, channel id and type */
        const messageId: string = customId[2];
        const channelId: string = customId[3];
        const type: string = customId[4];

        /* Get channel */
        const suggestionChannel: any = await guild.channels.fetch(channelId).catch((e:any): void => {});
        if(!suggestionChannel) return;

        const { user } = interaction;

        const reasonModal: ModalBuilder = new ModalBuilder()
            .setTitle("Idee " + (type === "accept" ? "annehmen" : "ablehnen"))
            .setCustomId(user.id + "_suggestion_" + this.client.utils.getRandomKey(10));

        const reasonInputField: TextInputBuilder = new TextInputBuilder()
            .setLabel("Gib ggf. einen Grund an")
            .setRequired(false)
            .setStyle(TextInputStyle.Short)
            .setCustomId("reason");

        const modalComponentsRow: ActionRowBuilder<AnyComponentBuilder> = this.client.createMessageComponentsRow(reasonInputField);
        // @ts-ignore - Argument of type '[ActionRowBuilder<AnyComponentBuilder>]' is not assignable to parameter of type 'RestOrArray<ActionRowBuilder<TextInputBuilder>>'
        reasonModal.addComponents(modalComponentsRow);

        /* Show modal */
        await interaction.showModal(reasonModal);

        const suggestionEmbed: any = await suggestionChannel.messages.fetch(messageId).catch((e: any): void => {});
        if(!suggestionEmbed) return interaction.deferUpdate();
        const suggestionEmbedDescription: string = suggestionEmbed.embeds[0].description;
        const suggestionEmbedTitle: string = suggestionEmbed.embeds[0].title;

        const modalSubmitCollector: any = await interaction.awaitModalSubmit({ filter: (i: any) => i.user.id === user.id, time: 3 * 60 * 1000 });
        if(modalSubmitCollector){
            const givenReason: string = modalSubmitCollector.fields.getTextInputValue("reason") || "Kein Grund angegeben";

            if(suggestionEmbed.author.id !== this.client.user!.id) return modalSubmitCollector.deferUpdate();

            const embedData: any = suggestionEmbed.embeds[0].data;

            if(type === "accept"){
                embedData.title = "Angenommene " + suggestionEmbedTitle;
                embedData.description = suggestionEmbedDescription + "\n\n" + this.client.emotes.user + " Moderator: " + user.username + "\n" + this.client.emotes.arrow + " Grund: " + givenReason;
                embedData.color = 5763719;
            }else if(type === "decline"){
                embedData.title = "Abgelehnte " + suggestionEmbedTitle;
                embedData.description = suggestionEmbedDescription + "\n\n" + this.client.emotes.arrow + " Moderator: " + user.username +"\n" + this.client.emotes.arrow + " Grund: " + givenReason;
                embedData.color = 15548997;
            }

            suggestionEmbed.edit({ embeds: [embedData], components: [] });
            await modalSubmitCollector.deferUpdate().catch((e: any): void => {});
            await interaction.message.delete().catch((e: any): void => {});
        }
    }
}