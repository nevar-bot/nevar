import axios from "axios";
import { scheduleJob } from "node-schedule";
import { createDjsClient, DBLClient } from "discordbotlist";

export = {
    init(client: any): void
    {
        if (client.config.apikeys["DBL"] && client.config.apikeys["DBL"] !== "" && client.config.channels["VOTE_ANNOUNCEMENT_ID"] && client.config.channels["VOTE_ANNOUNCEMENT_ID"] !== "") {
            const dbl: DBLClient<any> = createDjsClient(client.config.apikeys["DBL"], client);
            dbl.startPosting(10 * 60 * 1000);

            scheduleJob("0 0 * * *", async () => {
                const commands: Array<any> = [];

                for(let command of client.commands.values()) commands.push({ name: command.help.name, description: command.help.description, type: 1 });
                for(let context of client.contextMenus.values()) commands.push({ name: context.help.name, description: null, type: context.help.type });

                const config = {
                    method: "post",
                    url: "https://discordbotlist.com/api/v1/bots/" + client.user.id + "/commands",
                    headers: {
                        "Authorization": client.config.apikeys["DBL"],
                        "Content-Type": "application/json",
                        "User-Agent": "Nevar Autopost"
                    },
                    data: JSON.stringify(commands)
                };

                await axios(config).catch((e: Error) => console.log(e));
            });
        }
    }
}