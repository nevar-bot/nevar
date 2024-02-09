import BaseCommand from "@structures/BaseCommand.js";
import BaseClient from "@structures/BaseClient.js";
import {EmbedBuilder, SlashCommandBuilder} from "discord.js";
import { createClient } from "hafas-client";
import { profile as dbProfile } from "hafas-client/p/db/index.js";

export default class AfkCommand extends BaseCommand {
    public constructor(client: BaseClient) {
        super(client, {
            name: "transport",
            description: "Search for local and long-distance connections.",
            localizedDescriptions: {
                de: "Suche nach Verbindungen im Nah- und Fernverkehr."
            },
            cooldown: 1000,
            dirname: import.meta.url,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addStringOption((option: any) =>
                        option
                            .setName("start")
                            .setNameLocalization("de", "start")
                            .setDescription("Where would you like to depart from?")
                            .setDescriptionLocalization("de", "Von wo möchtest du abfahren?")
                            .setAutocomplete(true)
                            .setRequired(true),

                    )
                    .addStringOption((option: any) =>
                        option
                            .setName("destination")
                            .setNameLocalization("de", "ziel")
                            .setDescription("Where would you like to go?")
                            .setDescriptionLocalization("de", "Wohin möchtest du?")
                            .setRequired(true)
                            .setAutocomplete(true),
                    ),
            },
        });
    }

    public async dispatch(interaction: any, data: any): Promise<void> {
        this.interaction = interaction;
        this.guild = interaction.guild;
        this.data = data;
        await this.getConnection(interaction.options.getString("start"), interaction.options.getString("destination"));
    }

    private async getConnection(start: string, dest: string): Promise<any> {
        const userAgent: string = "hello@nevar.eu";
        const dbClient: any = createClient(dbProfile, userAgent);

        const regex: RegExp = /^\d{6,}$/;

        if(!regex.test(start) || !regex.test(dest)){
            const embed: EmbedBuilder = this.client.createEmbed(this.translate("errors:startOrDestinationIsMissing"), "error", "error");
            return this.interaction.followUp({ embeds: [embed] });
        }

        const res = await dbClient.journeys(start, dest, { results: 3 });

        const journeys: any[] = [];

        for(const journey of res.journeys){
            const legs: any[] = [];
            const arrivalAtString: string = this.client.emotes.shine + " " + this.translate("youArriveAt", { arrival: this.client.utils.getDiscordTimestamp(journey.legs[journey.legs.length - 1].plannedArrival, "t"), dest: journey.legs[journey.legs.length - 1].destination.name });
            legs.push(arrivalAtString);
            for(const leg of journey.legs){
                if(!leg.walking){
                    const string: string =
                        "### " + leg.origin.name + "\n" +
                        this.client.emotes.information + " " + this.translate("driveTo", { line: leg.line.name, dest: leg.destination.name }) + "\n" +
                        this.client.emotes.hoursglass + " " + this.translate("departureAt", { departure: this.client.utils.getDiscordTimestamp(leg.plannedDeparture, "t"), delay: (leg.departureDelay / 60), platform: (leg.departurePlatform || "/") }) + "\n" +
                        this.client.emotes.hoursglass + " " + this.translate("arrivalAt", { arrival: this.client.utils.getDiscordTimestamp(leg.plannedArrival, "t"), delay: (leg.arrivalDelay / 60), platform: (leg.arrivalPlatform || "/") }) + "\n";
                    legs.push(string);
                }else{
                    const string: string =
                        "### " + leg.origin.name + "\n" +
                        this.client.emotes.information + " " + this.translate("walkTo", { distance: leg.distance, dest: leg.destination.name }) + "\n";
                    legs.push(string);
                }
            }

            journeys.push(legs.join("\n"));
        }
        const title: string = this.translate("list:title");

        return this.client.utils.sendPaginatedEmbed(this.interaction, 1, journeys, title, this.translate("list:noConnectionsFound"));
    }
}
