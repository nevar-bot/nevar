/* @ts-ignore */
import { Request, Response } from "express";
import { client } from "@src/app.js";
import fs from "fs";
import {ButtonBuilder, EmbedBuilder} from "discord.js";

export default {
    /**
     * Returns bot votes
     * Route: POST /votes/stats
     * Request body: month: Number|null
     * Authorization required: no
     */
    async stats(req: Request, res: Response): Promise<void> {
        /* Prepare response */
        const response: any = {
            status: null,
            status_message: null,
        };

        /* No authorization required */
        /**
         if(!req.headers.authorization || req.headers.authorization !== client.config.api["AUTHORIZATION"]) {
            response.status = 401;
            response.status_message = "Unauthorized";
            return res.status(401).json(response);
        }
         **/

        /* Validate request body */
        if(req.body.month && (typeof req.body.month !== "number" || req.body.month < 1 || req.body.month > 12)){
            response.status = 400;
            response.status_message = "Bad Request";
            return res.status(400).json(response);
        }

        /* Try to get votes */
        try {
            const votes: any = JSON.parse(fs.readFileSync("./assets/votes.json").toString());
            if(!req.body.month){
                response.status = 200;
                response.status_message = "OK";
                response.votes = votes;
                return res.status(200).json(response);
            }else{
                response.status = 200;
                response.status_message = "OK";
                response.votes = votes[Number(req.body.month) - 1];
                return res.status(200).json(response);
            }
        }catch(error) {
            response.status = 500;
            response.status_message = "Internal Server Error";
            return res.status(500).json(response);
        }
    },

    /**
     * Inserts a new vote
     * Route: POST /votes/new
     * Request body: user: String
     * Authorization required: yes
     */
    async new(req: Request, res: Response): Promise<void> {
        /* Prepare response */
        const response: any = {
            status: null,
            status_message: null,
        };

        /* Authorization required */
        if(!req.headers.authorization || req.headers.authorization !== client.config.api["AUTHORIZATION"]) {
            response.status = 401;
            response.status_message = "Unauthorized";
            return res.status(401).json(response);
        }

        /* Validate request body */
        if(!req.body.user || typeof req.body.user !== "string"){
            response.status = 400;
            response.status_message = "Bad Request";
            return res.status(400).json(response);
        }

        /* Check if user exists */
        const user: any = await client.users.fetch(req.body.user).catch(() => {});
        if(!user){
            response.status = 400;
            response.status_message = "Bad Request";
            return res.status(400).json(response);
        }

        /* Try to insert vote */
        try {
            const supportGuild: any = client.guilds.cache.get(client.config.support["ID"]);
            if(!supportGuild) throw new Error("Support guild not found");

            const voteText: string = supportGuild.translate("api/controllers/VotesController:userVotes", { user: user.displayName, client: client.user!.displayName });
            const voteEmbed: EmbedBuilder = client.createEmbed(voteText, "shine", "normal");
            voteEmbed.setThumbnail(user.displayAvatarURL());

            const voteButton: ButtonBuilder = client.createButton(null, supportGuild.translate("api/controllers/VotesController:voteNow"), "Link", "rocket", false, "https://top.gg/bot/" + client.user!.id + "/vote");
            const voteButtonRow: any = client.createMessageComponentsRow(voteButton);

            const voteAnnouncementChannel: any = supportGuild.channels.cache.get(client.config.channels["VOTE_ANNOUNCEMENT_ID"]);
            await voteAnnouncementChannel.send({ embeds: [voteEmbed], components: [voteButtonRow] });

            const voteStats: any = JSON.parse(fs.readFileSync("./assets/votes.json").toString());
            const currentMonth: number = new Date().getMonth();
            voteStats[currentMonth] = voteStats[currentMonth] + 1;
            fs.writeFileSync("./assets/votes.json", JSON.stringify(voteStats));

            response.status = 200;
            response.status_message = "OK";
            return res.status(200).json(response);
        }catch(error) {
            response.status = 500;
            response.status_message = "Internal Server Error";
            return res.status(500).json(response);
        }
    }
}