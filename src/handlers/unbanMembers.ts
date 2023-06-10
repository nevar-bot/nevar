import { Guild } from "discord.js";

export default {
    init(client: any): void {
        client.membersData.find({ "banned.state": true }).then((members: any) => {
            members.forEach((member: any): void => {
                client.databaseCache.bannedUsers.set(member.id + member.guildID, member);
            });
        });

        setInterval((): void => {
            for(const memberData of [...client.databaseCache.bannedUsers.values()].filter((m: any): boolean => m.banned.bannedUntil <= Date.now())){
                const guild: Guild = client.guilds.cache.get(memberData.guildID);
                if(!guild) continue;

                guild.members.unban(memberData.id, "Banzeit abgelaufen").catch(async (e: any): Promise<void> => {
                    const errorMessage: string =
                        " **Automatischer Unban fehlgeschlagen**\n\n" +
                        client.emotes.user + " Nutzer: " + memberData.id;


                    await guild.logAction(errorMessage, "moderation", client.emotes.error, "error", null);
                });

                memberData.banned = {
                    state: false,
                    reason: null,
                    moderator: {
                        name: null,
                        id: null
                    },
                    duration: null,
                    bannedAt: null,
                    bannedUntil: null
                };
                memberData.markModified("banned");
                memberData.save();
                client.databaseCache.bannedUsers.delete(memberData.id + memberData.guildID);
            }
        }, 1000);
    }
}