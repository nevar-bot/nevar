import { Request, Response } from "express";
import AuthController from "@dashboard/controllers/AuthController";
import { client } from "@src/app";
import UserController from "@dashboard/controllers/UserController";
import mongoose from "mongoose";

export default {
    async getIndex(req: any, res: any): Promise<void> {
        if(!await AuthController.isAuthorized(req, res)){
            res.render("login", {
                client: client,
                favicon: client.user!.displayAvatarURL()
            });
        }else{
            const user = await UserController.getUserInfo(JSON.parse(req.cookies?.["oauth2"])?.access_token);
            const userGuilds = await UserController.getUserGuilds(JSON.parse(req.cookies?.["oauth2"])?.access_token)
            const permittedGuilds: any[] = [];
            const notInvitedGuilds: any[] = [];
            console.log(userGuilds);
            for(let guild of userGuilds){
                if (guild.owner || ((guild.permissions & 0x08) === 0x08) || ((guild.permissions & 0x20) === 0x20)) {
                    if(client.guilds.cache.get(guild.id)){
                        permittedGuilds.push(guild);
                    }else{
                        notInvitedGuilds.push(guild);
                    }
                }
            }
            res.render("guilds", {
                client: client,
                favicon: client.user!.displayAvatarURL(),
                username: user.username,
                displayName: user.global_name,
                avatarUrl: "https://cdn.discordapp.com/avatars/" + user.id + "/" + user.avatar + ".webp?size=256",
                guilds: permittedGuilds,
                notInvitedGuilds: notInvitedGuilds,
                inviteUrl: client.createInvite()
            });
        }
    },

    async getGuild(req: Request, res: Response): Promise<void> {
        if(!await AuthController.isAuthorized(req, res)) {
            res.render("login", {
                client: client,
                favicon: client.user!.displayAvatarURL()
            });
        }else{
            const guildId: string = req.params.guildId;
            if(!client.guilds.cache.get(guildId)) return res.status(404).render("error/404");
            const userGuilds = await UserController.getUserGuilds(JSON.parse(req.cookies?.["oauth2"])?.access_token);
            const guild = await userGuilds.find((guild: any): boolean => guild.id === guildId);
            if(!guild) return res.status(401).render("error/401");
            if(!guild.owner && ((guild.permissions & 0x08) !== 0x08) && ((guild.permissions & 0x20) !== 0x20)) return res.status(401).render("error/401");

            const discordGuild: any = client.guilds.cache.get(guildId);
            const user: any = await UserController.getUserInfo(JSON.parse(req.cookies?.["oauth2"])?.access_token);
            const executedCommands: number = (await (await mongoose.connection.db.collection("logs")).find({ "guild.id": guild.id }).toArray()).length;
            discordGuild.commandCount = executedCommands;

            res.render("guild/index", {
                client: client,
                guild: discordGuild,
                favicon: client.user!.displayAvatarURL(),
                user: user,
                avatarUrl: "https://cdn.discordapp.com/avatars/" + user.id + "/" + user.avatar + ".webp?size=256",
            })
        }
    }
}