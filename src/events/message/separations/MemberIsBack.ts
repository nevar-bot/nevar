import { NevarClient } from "@core/NevarClient";
import { EmbedBuilder } from "discord.js";

export default class {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async dispatch(message: any, data: any, guild: any): Promise<void> {
		const since: any = data.user.afk.since;
		const afkReason: any = data.user.afk.reason;

		data.user.afk = {
			state: false,
			reason: null,
			since: null,
		};
		data.user.markModified("afk");
		await data.user.save();

		const afkSinceString: string = this.client.utils.getDiscordTimestamp(since, "f");

		const backText: string =
			"Du warst seit **" + afkSinceString + "** abwesend: " + (afkReason || "Kein Grund angegeben");

		const welcomeBackEmbed: EmbedBuilder = this.client.createEmbed("{0}", "reminder", "normal", backText);
		welcomeBackEmbed.setTitle(this.client.emotes.shine2 + " Willkommen zurück!");
		return message.reply({ embeds: [welcomeBackEmbed] }).catch((): void => {});
	}
}
