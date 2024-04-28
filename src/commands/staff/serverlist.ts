import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";

export default class ServerlistCommand extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "serverlist",
			description: "Sends the server list",
			localizedDescriptions: {
				de: "Sendet die Serverliste",
			},
			staffOnly: true,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: false,
				data: null,
			},
		});
	}


	public async dispatch(message: any, args: any[], data: any): Promise<void> {
		this.message = message;
		this.guild = message.guild;
		this.data = data;
		await this.showServerList();
	}

	private async showServerList(): Promise<void> {
		const servers: any[] = [];

		for (const guild of this.client.guilds.cache) {
			const text: string =
				"### " +
				this.client.emotes.discord +
				" " +
				guild[1].name +
				"\n" +
				this.client.emotes.arrow + " " +
				this.translate("memberCount") + ": " +
				this.client.format(guild[1].memberCount) +
				"\n" +
				this.client.emotes.arrow + " " +
				this.translate("id") + ": " +
				guild[1].id +
				"\n";
			servers.push({ guild: guild[1], text: text });
		}
		servers.sort((a: any, b: any): number => b.guild.memberCount - a.guild.memberCount);

		const serverTexts: any[] = servers.map((server) => server.text);

		await this.client.utils.sendPaginatedEmbedMessage(
			this.message,
			5,
			serverTexts,
			this.translate("list:title"),
			this.translate("list:noGuilds")
		);
	}
}
