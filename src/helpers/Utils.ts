import { lstatSync, readdirSync, Stats } from "fs";
import { extname, join } from "path";
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "discord.js";
import moment from "moment";


export class Utils {
	public constructor(){};

	public recursiveReadDirSync(directory: string, allowedExtensions: Array<string> = [".js"]): any {
		const filePaths: Array<any> = [];
		const readCommands = (dir: string): void => {
			const files: any = readdirSync(join(process.cwd(), dir));
			files.forEach((file: string): void => {
				const stat: Stats = lstatSync(join(process.cwd(), dir, file));
				if (stat.isDirectory()) {
					readCommands(join(dir, file));
				} else {
					const extension: string = extname(file);
					if (!allowedExtensions.includes(extension)) return;
					const filePath: string = join(process.cwd(), dir, file);
					filePaths.push(filePath);
				}
			});
		};
		readCommands(directory);
		return filePaths;
	}

	public getRandomKey(length: number): string {
		let result: string = "";
		const characters: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		const charactersLength: number = characters.length;
		for (let i: number = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	public getRandomInt(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	public stringIsValidJson(str: string): boolean {
		try {
			JSON.parse(str);
		}catch(error) {
			return false;
		}
		return true;
	}

	public stringIsUrl(str: string): boolean {
		const pattern: RegExp = new RegExp(
			"^(https?:\\/\\/)?" + // protocol
			"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
			"((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
			"(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
			"(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
			"(\\#[-a-z\\d_]*)?$",
			"i",
		); // fragment locator
		return !!pattern.test(str);
	}

	public urlIsImage(str: string): boolean {
		return str.match(/^http[^]*.(jpg|jpeg|gif|png)(\?(.*))?$/gim) != null;
	}

	public stringIsCustomEmoji(str: string): boolean {
		const pattern: RegExp = new RegExp(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/);
		return pattern.test(str);
	}

	public stringIsHexColor(str: string): boolean {
		if (!str.startsWith("#")) str = "#" + str;
		const pattern: RegExp = new RegExp(/^#[0-9A-F]{6}$/i);
		return pattern.test(str);
	}

	public stringIsEmoji(str: string): boolean {
		const pattern: RegExp =
			/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
		return pattern.test(str);
	}

	public async sendPaginatedEmbed(interaction: any, entriesPerPage: number, data: Array<any>, title: string, empty: string): Promise<any> {
		const { client } = interaction;

		const backId: string = interaction.member!.user.id + "_back";
		const forwardId: string = interaction.member!.user.id + "_forward";
		const backButton: ButtonBuilder = client.createButton(
			backId,
			interaction.guild.translate("basics:back"),
			"Secondary",
			client.emotes.arrows.left,
		);
		const forwardButton: ButtonBuilder = client.createButton(
			forwardId,
			interaction.guild.translate("basics:further"),
			"Secondary",
			client.emotes.arrows.right,
		);

		async function generatePaginateEmbed(start: number): Promise<any> {
			const current: any[] = data.slice(start, start + entriesPerPage);
			let text: string = current.map((item) => "\n" + item).join("");

			const pages: any = {
				total: Math.ceil(data.length / entriesPerPage),
				current: Math.round(start / entriesPerPage) + 1,
			};
			if (pages.total === 0) pages.total = 1;
			if (data.length === 0) text = client.emotes.error + " " + empty;

			const paginatedEmbed: EmbedBuilder = client.createEmbed(text, null, "normal");
			if(pages.total > 1){
				paginatedEmbed.setTitle(title + " • " + interaction.guild.translate("basics:pagination", { pages }));
			}else{
				paginatedEmbed.setTitle(title);
			}
			return paginatedEmbed;
		}

		const fitOnePage: boolean = data.length <= entriesPerPage;

		const embedMessage: any = await interaction.followUp({
			embeds: [await generatePaginateEmbed(0)],
			components: fitOnePage ? [] : [client.createMessageComponentsRow(forwardButton)],
		});

		const pageCollector = embedMessage.createMessageComponentCollector({
			filter: (i: any) => i.user.id === interaction.member.user.id,
		});
		let currentPageIndex = 0;
		pageCollector
			.on("collect", async (i: any) => {
				i.customId === backId ? (currentPageIndex -= entriesPerPage) : (currentPageIndex += entriesPerPage);
				await i.update({
					embeds: [await generatePaginateEmbed(currentPageIndex)],
					components: [
						new ActionRowBuilder({
							components: [
								...(currentPageIndex ? [backButton] : []),
								...(currentPageIndex + entriesPerPage < data.length ? [forwardButton] : []),
							],
						}),
					],
				});
			})
			.on("end", async () => {
				return;
			});
	}

	public async sendPaginatedEmbedMessage(message: any, entriesPerPage: number, data: Array<any>, title: string, empty: string): Promise<void> {
		const { client } = message;

		const backId: string = message.member.user.id + "_back";
		const forwardId: string = message.member.user.id + "_forward";
		const backButton: ButtonBuilder = client.createButton(
			backId,
			message.guild.translate("basics:back"),
			"Secondary",
			client.emotes.arrows.left,
		);
		const forwardButton: ButtonBuilder = client.createButton(
			forwardId,
			message.guild.translate("basics:further"),
			"Secondary",
			client.emotes.arrows.right,
		);

		async function generatePaginateEmbed(start: number): Promise<any> {
			const current: any[] = data.slice(start, start + entriesPerPage);
			let text: string = current.map((item) => "\n" + item).join("");

			const pages: any = {
				total: Math.ceil(data.length / entriesPerPage),
				current: Math.round(start / entriesPerPage) + 1,
			};
			if (pages.total === 0) pages.total = 1;
			if (data.length === 0) text = client.emotes.error + " " + empty;

			const paginatedEmbed: EmbedBuilder = client.createEmbed(text, null, "normal");
			if(pages.total > 1){
				paginatedEmbed.setTitle(title + " • " + message.guild.translate("basics:pagination", { pages }));
			}else{
				paginatedEmbed.setTitle(title);
			}
			return paginatedEmbed;
		}

		const fitOnePage: boolean = data.length <= entriesPerPage;

		const embedMessage: any = await message.reply({
			embeds: [await generatePaginateEmbed(0)],
			components: fitOnePage ? [] : [client.createMessageComponentsRow(forwardButton)],
		});

		const pageCollector: any = embedMessage.createMessageComponentCollector({
			filter: (i: any) => i.user.id === message.member.user.id,
		});
		let currentPageIndex: number = 0;
		pageCollector
			.on("collect", async (i: any) => {
				i.customId === backId ? (currentPageIndex -= entriesPerPage) : (currentPageIndex += entriesPerPage);
				await i.update({
					embeds: [await generatePaginateEmbed(currentPageIndex)],
					components: [
						new ActionRowBuilder({
							components: [
								...(currentPageIndex ? [backButton] : []),
								...(currentPageIndex + entriesPerPage < data.length ? [forwardButton] : []),
							],
						}),
					],
				});
			})
			.on("end", async () => {
				return;
			});
	}

	public shuffleArray(array: Array<any>): Array<any> {
		return array.sort(() => Math.random() - 0.5);
	}

	/**
	 * Erstellt einen Discord-Timestamp
	 *
	 * @param {string} time - Zeit
	 * @param {"t"|"T"|"d"|"D"|"f"|"F"|"r"|undefined} type - gewünschter Typ
	 *   - undefined: Standard Zeitformat (z.B. "28. November 2023, 09:01")
	 *   - "t": Kurzes Zeitformat (z.B. "09:01")
	 *   - "T": Langes Zeitformat (z.B. "09:01:00")
	 *   - "d": Kurzes Datumsformat (z.B. "28.11.2023")
	 *   - "D": Langes Datumsformat (z.B. "28. November 2023")
	 *   - "f": Kurzes Datum und Uhrzeitformat (z.B. "28. November 2023 09:01")
	 *   - "F": Langes Datum und Uhrzeitformat (z.B. "Dienstag, 28. November 2023 09:01")
	 *   - "r": Relatives Zeitformat (z.B. "vor 5 Minuten")
	 * @returns {string} Generierter Discord-Timestamp
	 */
	public getDiscordTimestamp(time: string, type: "t" | "T" | "d" | "D" | "f" | "F" | "R" | undefined): string {
		if (!type) {
			return "<t:" + moment(time).unix() + ">";
		} else {
			return "<t:" + moment(time).unix() + ":" + type + ">";
		}
	}
}