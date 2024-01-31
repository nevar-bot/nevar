/* @ts-ignore */
import { Request, Response } from "express";
import { client } from "@src/app";
import mongoose from "mongoose";

export default {
    /**
     * Returns general bot statistics
     * Route: GET /general/stats
     * Request body: none
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
         * if(!req.headers.authorization || req.headers.authorization !== client.config.api["AUTHORIZATION"]) {
         *    response.status = 401;
         *    response.status_message = "Unauthorized";
         *    return res.status(401).json(response);
         * }
         **/

        /* Try returning stats */
        try {
            response.system = {
                platform: process.platform,
                node_version: process.version,
                cpu_arch: process.arch,
                cpu_usage: process.cpuUsage(),
                memory_usage: process.memoryUsage().heapUsed / 1024 / 1024
            };

            response.bot = {
                version: require("@root/package.json").version,
                guild_count: client.guilds.cache.size,
                user_count: client.users.cache.size,
                channel_count: client.channels.cache.size,
                commands: client.commands.size,
                uptime: client.uptime,
            }

            response.database = await mongoose.connection.db.stats();

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
     * Returns bot staff members
     * Route: GET /general/staffs
     * Request body: guild_id: String
     * Authorization required: no
     */
    async staffs(req: Request, res: Response): Promise<void> {
        /* Prepare response */
        const response: any = {
            status: null,
            status_message: null,
        };

        /* No authorization required */
        /**
         * if(!req.headers.authorization || req.headers.authorization !== client.config.api["AUTHORIZATION"]) {
         *    response.status = 401;
         *    response.status_message = "Unauthorized";
         *    return res.status(401).json(response);
         * }
         **/

        /* Try returning stats */
        try {
            const head_staffs: any[] = [];
            const staffs: any[] = [];

            /* Get head staff members */
            for(const headStaffId of client.config.general["OWNER_IDS"]) {
                const headStaff: any = await client.users.fetch(headStaffId);
                head_staffs.push({
                    id: headStaff.id,
                    name: headStaff.username,
                    displayName: headStaff.displayName,
                    avatar: headStaff.avatarURL(),
                    role: "head staff"
                });
            }

            /* Get staff members */
            const staffsCollection: any = await mongoose.connection.db.collection("users").find({ "staff.state": true }).toArray();
            for(const staff of staffsCollection) {
                if(head_staffs.find((headStaff: any): boolean => headStaff.id === staff.id)) continue;
                const staffUser: any = await client.users.fetch(staff.id);
                const staffData: any = {
                    id: staffUser.id,
                    name: staffUser.username,
                    displayName: staffUser.displayName,
                    avatar: staffUser.displayAvatarURL(),
                    role: staff.staff.role === "head-staff" ? "head staff" : "staff"
                };
                if(staff.staff.role === "head-staff") head_staffs.push(staffData);
                else staffs.push(staffData);
            }

            response.status = 200;
            response.status_message = "OK";
            response.head_staffs = head_staffs;
            response.staffs = staffs;
            return res.status(200).json(response);
        }catch(error) {
            console.log(error);
            response.status = 500;
            response.status_message = "Internal Server Error";
            return res.status(500).json(response);
        }
    },

    /**
     * Reboots the bot
     * Route: GET /general/reboot
     * Request body: none
     * Authorization required: yes
     */
    async reboot(req: Request, res: Response): Promise<void> {
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

        /* Reboot bot */
        response.status = 200;
        response.status_message = "OK";
        res.status(200).json(response);
        process.exit(0);
    }
}