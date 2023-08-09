import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default class CreditsCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "credits",
			description: "Zeigt die Credits für dieses Projekt an",
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		await this.showCredits();
	}

	private async showCredits() {
		const credits: string =
			"## HTTP-Anfragen\n" +
			this.client.emotes.arrow +
			" [axios](https://npmjs.com/package/axios) - HTTP Anfragen\n" +
			"## Express und Middleware\n" +
			this.client.emotes.arrow +
			" [express](https://npmjs.com/package/express) - Web-Framework\n" +
			this.client.emotes.arrow +
			" [body-parser](https://npmjs.com/package/body-parser) - Parsing von HTTP Requests\n" +
			this.client.emotes.arrow +
			" [cors](https://npmjs.com/package/cors) - Cross-Origin Resource Sharing Middleware\n" +
			this.client.emotes.arrow +
			" [helmet](https://npmjs.com/package/helmet) - HTTP-Header-Sicherheits-Middleware\n" +
			"## Datenbank\n" +
			this.client.emotes.arrow +
			" [mongoose](https://npmjs.com/package/mongoose) - MongoDB ODM\n" +
			"## Discord\n" +
			this.client.emotes.arrow +
			" [discord.js](https://npmjs.com/package/discord.js) - Discord Client\n" +
			this.client.emotes.arrow +
			" [discord-giveaways](https://npmjs.com/package/discord-giveaways) - Discord Gewinnspiele\n" +
			this.client.emotes.arrow +
			" [@top-gg/sdk](https://www.npmjs.com/package/@top-gg/sdk) - Vote Webhook TOP.GG\n" +
			this.client.emotes.arrow +
			" [topgg-autoposter](https://www.npmjs.com/package/topgg-autoposter) - TOP.GG Bot-Statistiken\n" +
			"## Bildverarbeitung und -manipulation\n" +
			this.client.emotes.arrow +
			" [canvacord](https://npmjs.com/package/canvacord) - Bildmanipulation für Discord\n" +
			this.client.emotes.arrow +
			" [jimp](https://npmjs.com/package/jimp) - Bildverarbeitung\n" +
			"## Zeit- und Zeitzonen-Handling\n" +
			this.client.emotes.arrow +
			" [moment](https://npmjs.com/package/moment) - Datums- und Zeitmanipulation\n" +
			this.client.emotes.arrow +
			" [moment-timezone](https://npmjs.com/package/moment-timezone) - Zeitzonen-Unterstützung für moment\n" +
			this.client.emotes.arrow +
			" [enhanced-ms](https://npmjs.com/package/enhanced-ms) - Zeitkonvertierung\n" +
			this.client.emotes.arrow +
			" [node-schedule](https://npmjs.com/package/node-schedule) - Cronjobs\n" +
			"## Mathematische Berechnungen\n" +
			this.client.emotes.arrow +
			" [mathjs](https://npmjs.com/package/mathjs) - Mathematische Berechnungen\n" +
			"## Sonstiges\n" +
			this.client.emotes.arrow +
			" [chalk](https://npmjs.com/package/chalk) - Terminaltext-Styling\n" +
			this.client.emotes.arrow +
			" [rimraf](https://npmjs.com/package/rimraf) - Entfernen von Dateien und Ordnern\n" +
			this.client.emotes.arrow +
			" [source-map-support](https://npmjs.com/package/source-map-support) - Source-Map-Unterstützung\n" +
			this.client.emotes.arrow +
			" [node-emoji](https://npmjs.com/package/node-emoji) - Emoji-Konvertierung\n" +
			this.client.emotes.arrow +
			" [perspective-api-client](https://npmjs.com/package/perspective-api-client) - Google Perspective API Client\n" +
			this.client.emotes.arrow +
			" [googleapis](https://npmjs.com/package/googleapis) - Google APIs\n" +
			this.client.emotes.arrow +
			" [toml](https://npmjs.com/package/toml) - TOML-Parser und -Encoder\n" +
			this.client.emotes.arrow +
			" [module-alias](https://npmjs.com/package/module-alias) - Erstellung von Aliasen für Module\n" +
			this.client.emotes.arrow +
			" [typescript](https://npmjs.com/package/typescript) - Typisierter JavaScript-Compiler\n" +
			this.client.emotes.arrow +
			" [typescript-formatter](https://npmjs.com/package/typescript-formatter) - Formatter für TypeScript-Code\n" +
			this.client.emotes.arrow +
			" [icons](https://discord.gg/9AtkECMX2P) - Emojis für " +
			this.client.user!.username;

		const creditsEmbed: EmbedBuilder = this.client.createEmbed(
			credits,
			null,
			"normal"
		);
		creditsEmbed.setThumbnail(this.client.user!.displayAvatarURL());
		creditsEmbed.setTitle("Credits für " + this.client.user!.username);

		return this.interaction.followUp({ embeds: [creditsEmbed] });
	}
}
