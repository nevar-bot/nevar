import {Guild} from "discord.js";

export default {
    init(client: any): void {
        client.membersData.find({ "muted.state": true }).then((members: any) => {
            members.forEach((member: any): void => {
                client.databaseCache.mutedUsers.set(member.id + member.guildID, member);
            });
        });

        setInterval((): void => {
            for(const memberData of [...client.databaseCache.mutedUsers.values()].filter((m: any): boolean => m.muted.mutedUntil <= Date.now())) {
                const guild: Guild = client.guilds.cache.get(memberData.guildID);
                if(!guild) continue;

                client.findOrCreateGuild({ id: guild.id })
                    .then((guildData: any): void => {
                        guild.members.fetch(memberData.id)
                            .then((member: any): void => {
                                member.roles.remove(guildData.settings.muterole, "Mutezeit abgelaufen")
                                    .then(async (): Promise<void> => {
                                        const unmuteMessage: string =
                                            " **Automatischer Unmute**\n\n" +
                                            client.emotes.user + " " + member.user.username + " wurde entmuted, da die Mutezeit abgelaufen ist.";
                                        await guild.logAction(unmuteMessage, "moderation", client.emotes.success, "success", null);
                                    })
                                    .catch(async (e: any): Promise<void> => {
                                        const errorMessage: string =
                                            " **Automatischer Unmute fehlgeschlagen**\n\n" +
                                            client.emotes.user + " Nutzer: " + memberData.id;
                                        await guild.logAction(errorMessage, "moderation", client.emotes.error, "error", null);
                                    });
                            })
                            .catch((): void => {});
                    })
                    .catch((): void => {});
            }
        })
    }
}