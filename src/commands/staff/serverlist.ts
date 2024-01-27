import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";

export default class ServerlistCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "serverlist",
			description: "Sends the server list",
			localizedDescriptions: {
				de: "Sendet die Serverliste",
			},
			staffOnly: true,
			dirname: __dirname,
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
