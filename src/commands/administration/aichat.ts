import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder, ChannelType } from "discord.js";

export default class AimodCommand extends BaseCommand {
    public constructor(client: BaseClient) {
        super(client, {
            name: "aichat",
            description: "Stellt den KI-Chat des Servers ein",
            memberPermissions: ["ManageGuild"],
            cooldown: 2 * 1000,
            dirname: __dirname,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addStringOption((option: any) => option
                        .setName("modus")
                        .setDescription("Wähle, welchen Modus der KI-Chat haben soll")
                        .setRequired(false)
                        .addChoices(
                            {
                                name: "normal",
                                value: "normal",
                            },
                            {
                                name: "frech",
                                value: "cheeky",
                            },
                            {
                                name: "aggressiv",
                                value: "angry",
                            },
                            {
                                name: "schüchtern",
                                value: "shy",
                            },
                            {
                                name: "tiefgründig",
                                value: "deep",
                            },
                            {
                                name: "invasion",
                                value: "invasion",
                            },
                            {
                                name: "anzüglich",
                                value: "spicy",
                            },
                            {
                                name: "nerdy",
                                value: "nerdy",
                            }
                        )
                    )
                    .addChannelOption((option: any) => option
                        .setName("channel")
                        .setDescription("Wähle den Kanal, in dem der KI-Chat aktiv sein soll")
                        .setRequired(false)
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                    )
                    .addStringOption((option: any) => option
                        .setName("status")
                        .setDescription("Wähle, ob der KI-Chat aktiviert oder deaktiviert sein soll")
                        .setRequired(false)
                        .addChoices(
                            {
                                name: "aktiviert",
                                value: "on",
                            },
                            {
                                name: "deaktiviert",
                                value: "off",
                            }
                        )
                    )
            }
        })
    }

    private interaction: any;

    public async dispatch(interaction: any, data: any): Promise<void> {
        this.interaction = interaction;

        if(!data.guild.settings.aiChat){
            data.guild.settings.aiChat = {
                enabled: false,
                channel: null,
                mode: "normal"
            }
            data.guild.markModified("settings.aiChat");
            await data.guild.save();
        }

        const mode: string = interaction.options.getString("modus");
        const channel: string = interaction.options.getChannel("channel");
        const status: string = interaction.options.getString("status");

        if(mode) await this.setMode(mode, data);
        if(channel) await this.setChannel(channel, data);
        if(status) await this.setStatus(status, data);

    }

    private async setMode(mode: string, data: any): Promise<void> {
        data.guild.settings.aiChat.mode = mode;
        data.guild.markModified("settings.aiChat");
        await data.guild.save();
        const modes: any = {
            normal: "normal",
            cheeky: "frech",
            angry: "aggressiv",
            shy: "schüchtern",
            deep: "tiefgründig",
            invasion: "invasiv",
            spicy: "anzüglich",
            nerdy: "nerdy"
        }

        const embed: EmbedBuilder = this.client.createEmbed("Die künstliche Intelligenz verhält sich ab jetzt " + modes[mode] + ".", "success", "normal");
        this.interaction.followUp({embeds: [embed]});

        this.client.aiChat.set(this.interaction.guild.id, []);
        let prompt: string = this.client.aiChatTypes["default"];
        prompt += this.client.aiChatTypes[mode];
        this.client.aiChat.get(this.interaction.guild.id)!.push({role: "system", content: prompt});
        console.log(prompt);
    }

    private async setChannel(channel: any, data: any): Promise<void> {
        data.guild.settings.aiChat.channel = channel.id;
        data.guild.markModified("settings.aiChat");
        await data.guild.save();

        const embed: EmbedBuilder = this.client.createEmbed("Der KI-Chat ist jetzt in " + channel.toString() + " aktiv.", "success", "normal");
        this.interaction.followUp({embeds: [embed]});
    }

    private async setStatus(status: string, data: any): Promise<void> {
        const statuses: any = {
            on: true,
            off: false
        }
        data.guild.settings.aiChat.enabled = statuses[status];
        data.guild.markModified("settings.aiChat");
        await data.guild.save();

        const statusString: string = statuses[status] ? "aktiviert" : "deaktiviert";
        const embed: EmbedBuilder = this.client.createEmbed("Der KI-Chat ist jetzt " + statusString + ".", "success", "normal");
        this.interaction.followUp({embeds: [embed]});
    }
}