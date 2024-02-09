/* @ts-ignore */
import { Request, Response } from "express";
import { client } from "@src/app.js";

export default {
    /**
     * Returns all guilds the bot is in
     * Route: GET /guilds/list
     * Request body: none
     * Authorization required: yes
     */
    async list(req: Request, res: Response): Promise<void> {
        /* Prepare response */
        const response: any = {
            status: null,
            status_message: null,
        };

        /* Check request authorization */
        if(!req.headers.authorization || req.headers.authorization !== client.config.api["AUTHORIZATION"]) {
            response.status = 401;
            response.status_message = "Unauthorized";
            return res.status(401).json(response);
        }

        /* Try returning guilds */
        response.guilds = [];
        try {
            client.guilds.cache.forEach((guild: any) => {
                response.guilds.push({
                    id: guild.id,
                    name: guild.name,
                    icon: guild.iconURL(),
                    member_count: guild.memberCount
                });
            });

            response.status = 200;
            response.status_message = "OK";
            return res.status(200).json(response);
        /* Catch errors */
        }catch(error) {
            response.status = 500;
            response.status_message = "Internal Server Error";
            return res.status(500).json(response);
        }
    },

    /**
     * Leaves a guild
     * Route: DELETE /guilds/leave
     * Request body: guild_id: String
     * Authorization required: yes
     */
    async leave(req: Request, res: Response): Promise<void> {
        /* Prepare response */
        const response: any = {
            status: null,
            status_message: null,
        };

        /* Check request authorization */
        if(!req.headers.authorization || req.headers.authorization !== client.config.api["AUTHORIZATION"]) {
            response.status = 401;
            response.status_message = "Unauthorized";
            return res.status(401).json(response);
        }

        /* Check if request body contains guild_id */
        if(!req.body.guild_id) {
            response.status = 400;
            response.status_message = "Bad Request";
            return res.status(400).json(response);
        }

        /* Check if guild exists */
        if(!client.guilds.cache.find((guild: any): boolean => guild.id === req.body.guild_id)){
            response.status = 404;
            response.status_message = "Not Found";
            return res.status(404).json(response);
        }

        /* Try leaving guild */
        try {
            await client.guilds.cache.find((guild: any): boolean => guild.id === req.body.guild_id)!.leave();
            response.status = 200;
            response.status_message = "OK";
            return res.status(200).json(response);
        /* Catch errors */
        }catch(error) {
            response.status = 500;
            response.status_message = "Internal Server Error";
            return res.status(500).json(response);
        }
    }
}