/* @ts-ignore */
import { Request, Response } from "express";
import { client } from "@src/app.js";

export default {
    /**
     * Returns the leaderboard for a specific guild
     * Route: POST /levels/leaderboard
     * Request body: guild_id: String, limit: Number|null
     * Authorization required: no
     */
    async leaderboard(req: Request, res: Response): Promise<void> {
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
        if(!req.body.guild_id) {
            response.status = 400;
            response.status_message = "Bad Request";
            return res.status(400).json(response);
        }

        if(req.body.limit && isNaN(Number(req.body.limit))){
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

        /* Try to fetch leaderboard */
        try {
            const guild: any = client.guilds.cache.get(req.body.guild_id);
            const limit: number = Number(req.body.limit) || guild.memberCount;

            const fetchedLeaderboard: any = await client.levels.fetchLeaderboard(guild.id, limit);
            if(!fetchedLeaderboard) {
                response.status = 500;
                response.status_message = "Internal Server Error";
                return res.status(500).json(response);
            }

            const leaderboard: any[] = await client.levels.computeLeaderboard(client, fetchedLeaderboard, true);

            response.status = 200;
            response.status_message = "OK";
            response.leaderboard = leaderboard;
            return res.status(200).json(response);
        }catch(error) {
            response.status = 500;
            response.status_message = "Internal Server Error";
            return res.status(500).json(response);
        }
    },

    /**
     * Returns level data for a specific user
     * Route: POST /levels/user
     * Request body: guild_id: String, user_id: String
     * Authorization required: no
     */
    async user(req: Request, res: Response): Promise<void> {
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
        if(!req.body.guild_id || !req.body.user_id) {
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

        /* Check if user exists & is in guild */
        const guild: any = client.guilds.cache.get(req.body.guild_id);
        if(!await guild.members.fetch(req.body.user_id).catch(() => {})){
            response.status = 404;
            response.status_message = "Not Found";
            return res.status(404).json(response);
        }

        /* Try to fetch level data */
        const user: any = await client.levels.fetch(req.body.user_id, req.body.guild_id, true);
        if(!user){
            response.status = 404;
            response.status_message = "Not Found";
            return res.status(404).json(response);
        }

        response.status = 200;
        response.status_message = "OK";
        response.level_user = {
            user: {
                id: user.userID,
                name: guild.members.cache.get(user.userID).user.username,
                displayName: guild.members.cache.get(user.userID).displayName,
                avatar: guild.members.cache.get(user.userID).displayAvatarURL()
            },
            guild: {
                id: guild.id,
                name: guild.name,
                icon: guild.iconURL()
            },
            level: user.level,
            xp: user.xp,
            nextLevelXp: client.levels.xpFor(user.level + 1),
            cleanXp: user.cleanXp,
            cleanNextLevelXp: user.cleanNextLevelXp,
            lastUpdated: user.lastUpdated
        }
        return res.status(200).json(response);
    },

    /**
     * Manipulates the XP of a user in a guild
     * Route: POST /levels/user/xp
     * Request body: guild_id: String, user_id: String, action: enum("add", "remove", "set"), amount: Number
     * Authorization required: yes
     */
    async manipulateUserXp(req: Request, res: Response): Promise<void> {
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
        const actions: string[] = ["add", "remove", "set"];
        if(!req.body.guild_id || !req.body.user_id || !req.body.action || !actions.includes(req.body.action) || !req.body.amount || isNaN(Number(req.body.amount))){
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

        /* Check if user exists & is in guild */
        const guild: any = client.guilds.cache.get(req.body.guild_id);
        if(!await guild.members.fetch(req.body.user_id).catch(() => {})){
            response.status = 404;
            response.status_message = "Not Found";
            return res.status(404).json(response);
        }

        /* Try to manipulate XP */
        try {
            switch(req.body.action){
                case "add":
                    await client.levels.appendXp(req.body.user_id, req.body.guild_id, Number(req.body.amount));
                    break;
                case "remove":
                    await client.levels.substractXp(req.body.user_id, req.body.guild_id, Number(req.body.amount));
                    break;
                case "set":
                    await client.levels.setXp(req.body.user_id, req.body.guild_id, Number(req.body.amount));
                    break;
            }

            response.status = 200;
            response.status_message = "OK";
            return res.status(200).json(response);
        }catch(error) {
            response.status = 500;
            response.status_message = "Internal Server Error";
            return res.status(500).json(response);
        }
    },

    /**
     * Manipulates the level of a user in a guild
     * Route: POST /levels/user/level
     * Request body: guild_id: String, user_id: String, action: enum("add", "remove", "set"), amount: Number
     * Authorization required: yes
     */
    async manipulateUserLevel(req: Request, res: Response): Promise<void> {
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
        const actions: string[] = ["add", "remove", "set"];
        if(!req.body.guild_id || !req.body.user_id || !req.body.action || !actions.includes(req.body.action) || !req.body.amount || isNaN(Number(req.body.amount))){
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

        /* Check if user exists & is in guild */
        const guild: any = client.guilds.cache.get(req.body.guild_id);
        if(!await guild.members.fetch(req.body.user_id).catch(() => {})){
            response.status = 404;
            response.status_message = "Not Found";
            return res.status(404).json(response);
        }

        /* Try to manipulate level */
        try {
            switch (req.body.action) {
                case "add":
                    await client.levels.appendLevel(req.body.user_id, req.body.guild_id, Number(req.body.amount));
                    break;
                case "remove":
                    await client.levels.substractLevel(req.body.user_id, req.body.guild_id, Number(req.body.amount));
                    break;
                case "set":
                    await client.levels.setLevel(req.body.user_id, req.body.guild_id, Number(req.body.amount));
                    break;
            }

            response.status = 200;
            response.status_message = "OK";
            return res.status(200).json(response);
        }catch(error) {
            response.status = 500;
            response.status_message = "Internal Server Error";
            return res.status(500).json(response);
        }
    },
}