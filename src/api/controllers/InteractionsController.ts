/* @ts-ignore */
import { Request, Response } from "express";
import { client } from "@src/app.js";
import mongoose from "mongoose";

export default {
    /**
     * Returns all commands
     * Route: GET /interactions/commands
     * Request body: none
     * Authorization required: no
     */
    async commands(req: Request, res: Response): Promise<void> {
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

        /* Try returning commands */
        response.commands = [];
        try {
            client.commands.forEach((command: any): void => {
                response.commands.push({
                    name: command.help.name,
                    category: command.help.category,
                    description: command.help.description,
                    localized_descriptions: command.help.localizedDescriptions,
                    member_permissions: command.conf.memberPermissions,
                    bot_permissions: command.conf.botPermissions,
                    cooldown: command.conf.cooldown,
                    nsfw: command.conf.nsfw,
                    owner_only: command.conf.ownerOnly,
                    staff_only: command.conf.staffOnly
                });
            });

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
     * Returns usage statistics for a command
     * Route: POST /interactions/commands/stats
     * Request body: command_name: String
     * Authorization required: yes
     */
    async commandsStats(req: Request, res: Response): Promise<void> {
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

        /* Check if request body contains command_name */
        if(!req.body.command_name) {
            response.status = 400;
            response.status_message = "Bad Request";
            return res.status(400).json(response);
        }

        /* Check if command exists */
        if(!client.commands.has(req.body.command_name)) {
            response.status = 404;
            response.status_message = "Not Found";
            return res.status(404).json(response);
        }

        /* Try returning commands stats */
        response.stats = {};
        try {
            /* Get all logs for requested command */
            const commandLogs: any = await mongoose.connection.db.collection("logs").find({ command: req.body.command_name }).toArray();

            /* Get stats */
            const today: Date = new Date();
            const currentYear: Number = today.getFullYear();
            const currentMonth: Number = today.getMonth();
            const currentDay: Number = today.getDay();
            const currentHour: Number = today.getHours();

            /* Executions total */
            const executionsTotal: Number = commandLogs.length;

            /* Executions this year */
            const executionsThisYear: Number = commandLogs.filter((log: any): boolean => new Date(log.date).getFullYear() === currentYear).length;

            /* Executions this month */
            const executionsThisMonth: Number = commandLogs.filter((log: any): boolean => new Date(log.date).getFullYear() === currentYear && new Date(log.date).getMonth() === currentMonth).length;

            /* Executions today */
            const executionsToday: Number = commandLogs.filter((log: any): boolean => new Date(log.date).getFullYear() === currentYear && new Date(log.date).getMonth() === currentMonth && new Date(log.date).getDay() === currentDay).length;

            /* Executions this hour */
            const executionsThisHour: Number = commandLogs.filter((log: any): boolean => new Date(log.date).getFullYear() === currentYear && new Date(log.date).getMonth() === currentMonth && new Date(log.date).getDay() === currentDay && new Date(log.date).getHours() === currentHour).length;

            response.stats = {
                executions_total: executionsTotal,
                executions_this_year: executionsThisYear,
                executions_this_month: executionsThisMonth,
                executions_today: executionsToday,
                executions_this_hour: executionsThisHour
            };

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
     * Returns all context menus
     * Route: GET /interactions/contexts
     * Request body: none
     * Authorization required: no
     */
    async contexts(req: Request, res: Response): Promise<void> {
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

        /* Try returning contexts */
        response.contexts = [];
        try {
            client.contextMenus.forEach((context: any): void => {
                response.contexts.push({
                    name: context.help.name,
                    member_permissions: context.conf.memberPermissions,
                    bot_permissions: context.conf.botPermissions,
                    cooldown: context.conf.cooldown
                });
            });

            response.status = 200;
            response.status_message = "OK";
            return res.status(200).json(response);
        }catch(error) {
            console.log(error);
            response.status = 500;
            response.status_message = "Internal Server Error";
            return res.status(500).json(response);
        }
    },

    /**
     * Returns usage statistics for a context menu
     * Route: POST /interactions/contexts/stats
     * Request body: context_name: String
     * Authorization required: yes
     */
    async contextsStats(req: Request, res: Response): Promise<void> {
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

        /* Check if request body contains context_name */
        if(!req.body.context_name) {
            response.status = 400;
            response.status_message = "Bad Request";
            return res.status(400).json(response);
        }

        /* Check if context menu exists */
        if(!client.contextMenus.has(req.body.context_name)) {
            response.status = 404;
            response.status_message = "Not Found";
            return res.status(404).json(response);
        }

        /* Try returning context menu stats */
        response.stats = {};
        try {
            /* Get all logs for requested context menu */
            const contextLogs: any = await mongoose.connection.db.collection("logs").find({ command: req.body.context_name }).toArray();

            /* Get stats */
            const today: Date = new Date();
            const currentYear: Number = today.getFullYear();
            const currentMonth: Number = today.getMonth();
            const currentDay: Number = today.getDay();
            const currentHour: Number = today.getHours();

            /* Executions total */
            const executionsTotal: Number = contextLogs.length;

            /* Executions this year */
            const executionsThisYear: Number = contextLogs.filter((log: any): boolean => new Date(log.date).getFullYear() === currentYear).length;

            /* Executions this month */
            const executionsThisMonth: Number = contextLogs.filter((log: any): boolean => new Date(log.date).getFullYear() === currentYear && new Date(log.date).getMonth() === currentMonth).length;

            /* Executions today */
            const executionsToday: Number = contextLogs.filter((log: any): boolean => new Date(log.date).getFullYear() === currentYear && new Date(log.date).getMonth() === currentMonth && new Date(log.date).getDay() === currentDay).length;

            /* Executions this hour */
            const executionsThisHour: Number = contextLogs.filter((log: any): boolean => new Date(log.date).getFullYear() === currentYear && new Date(log.date).getMonth() === currentMonth && new Date(log.date).getDay() === currentDay && new Date(log.date).getHours() === currentHour).length;

            response.stats = {
                executions_total: executionsTotal,
                executions_this_year: executionsThisYear,
                executions_this_month: executionsThisMonth,
                executions_today: executionsToday,
                executions_this_hour: executionsThisHour
            };

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