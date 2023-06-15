import {
    Giveaway,
    GiveawayData,
    GiveawaysManager
} from "discord-giveaways";
import Model from "@schemas/Giveaway";
import BaseClient from "@structures/BaseClient";

class MongooseGiveaways extends GiveawaysManager
{
    constructor(client: BaseClient)
    {
        super(client, {
            default: {
                botsCanWin: false,
                embedColor: client.config.embeds["DEFAULT_COLOR"],
                embedColorEnd: client.config.embeds["WARNING_COLOR"],
                buttons: {
                    join: client.createButton("join", null, "Primary", "tada"),
                    joinReply: client.emotes.join + " Du hast am Gewinnspiel teilgenommen",
                    leaveReply: client.emotes.leave + " Du nimmst nicht mehr am Gewinnspiel teil"
                }
            }
        }, false);
    }

    async getAllGiveaways(): Promise<any>
    {
        return await Model.find().lean().exec();
    }

    async saveGiveaway(messageId: string, giveawayData: GiveawayData): Promise<boolean>
    {
        await Model.create(giveawayData);
        return true;
    }

    async editGiveaway(messageId: string, giveawayData: GiveawayData): Promise<boolean>
    {
        await Model.updateOne({ messageId }, giveawayData, { omitUndefined: true }).exec();
        return true;
    }

    async deleteGiveaway(messageId: string): Promise<boolean>
    {
        await Model.deleteOne({ messageId }).exec();
        return true;
    }
}

export default function(client: any): MongooseGiveaways
{
    return new MongooseGiveaways(client);
}