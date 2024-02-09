/* @ts-ignore */
import { Request, Response } from "express";
import { client } from "@src/app.js";

export default {
    /**
     * Sends a message to a channel in a guild
     * Route: POST /messages/send
     * Request body: guild_id: String, channel_id: String, message_content: String
     * Authorization required: yes
     */
    async send(req: Request, res: Response): Promise<void> {
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
        if(!req.body.guild_id || !req.body.channel_id || !req.body.message_content) {
            response.status = 400;
            response.status_message = "Bad Request";
            return res.status(400).json(response);
        }

        /* Check if guild exists */
        if(!client.guilds.cache.get(req.body.guild_id)) {
            response.status = 404;
            response.status_message = "Not Found";
            return res.status(404).json(response);
        }

        /* Check if channel exists */
        const guild: any = client.guilds.cache.get(req.body.guild_id);
        if(!guild.channels.cache.get(req.body.channel_id)) {
            response.status = 404;
            response.status_message = "Not Found";
            return res.status(404).json(response);
        }

        /* Try to send message */
        try {
            const guild: any = client.guilds.cache.get(req.body.guild_id);
            if(!guild) throw new Error("Guild not found");
            const channel: any = guild.channels.cache.get(req.body.channel_id);
            if(!channel) throw new Error("Channel not found");

            await channel.send({ content: req.body.message_content });
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