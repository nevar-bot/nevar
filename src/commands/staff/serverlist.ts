import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";

export default class ServerlistCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "serverlist",
			description: "Sendet die Serverliste",
			staffOnly: true,
			dirname: __dirname,
			slashCommand: {
				addCommand: false,
				data: null
			}
		});
	}

	private message: any;

	public async dispatch(message: any, args: any[], data: any): Promise<void> {
		this.message = message;
		await this.showServerList();
	}

	private async showServerList(): Promise<void> {
		const servers: any[] = [];

		for (let guild of this.client.guilds.cache) {
			const text: string =
				"### " +
				this.client.emotes.discord +
				" " +
				guild[1].name +
				"\n" +
				this.client.emotes.arrow +
				" Mitglieder: " +
				this.client.format(guild[1].memberCount) +
				"\n" +
				this.client.emotes.arrow +
				" ID: " +
				guild[1].id +
				"\n";
			servers.push({ guild: guild[1], text: text });
		}
		servers.sort((a: any, b: any): number => b.guild.memberCount - a.guild.memberCount);

		const serverTexts: any[] = servers.map((server) => server.text);

		await this.client.utils.sendPaginatedEmbedMessage(this.message, 5, serverTexts, "Serverliste", "Der Bot ist auf keinem Server", null);
	}
}
