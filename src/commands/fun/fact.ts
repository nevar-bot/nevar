import { NevarCommand } from "@core/NevarCommand.js";
import { SlashCommandBuilder } from "discord.js";
import { NevarClient } from "@core/NevarClient";
import axios from "axios";

export default class FactCommand extends NevarCommand {
    public constructor(client: NevarClient) {
        super(client, {
            name: "fact",
            description: "Sends a random fact",
            localizedDescriptions: {
                de: "Sendet einen zufälligen Fakt",
            },
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
        return await this.sendFact();
    }

    private async sendFact(): Promise<void> {
        let guildLocale: string = this.data.guild.locale;
        if(guildLocale !== "de" && guildLocale !== "en") guildLocale = "de";
        const factObject: any = (await axios.get("https://uselessfacts.jsph.pl/api/v2/facts/random?language=" + guildLocale)).data;
        const fact: string = factObject.text;

        await this.interaction.followUp({content: fact});

    }
}