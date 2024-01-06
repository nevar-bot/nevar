import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import {
	ActionRowBuilder,
	SlashCommandBuilder,
	ComponentType,
	StringSelectMenuBuilder,
	EmbedBuilder,
	ButtonBuilder,
} from "discord.js";
import moment from "moment";
import fs from "fs";

function getKeyByValue(object: any, value: any): any {
	return Object.keys(object).find((key: string): boolean => object[key] === value);
}

export default class HelpCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "help",
			description: "Sendet eine Übersicht aller Befehle, oder Hilfe zu einem bestimmten Befehl",
			cooldown: 1000,
			dirname: __dirname,
			botPermissions: ["ReadMessageHistory"],
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addStringOption((option: any) =>
					option
						.setName("befehl")
						.setDescription("Gib einen Befehl an, zu dem du Hilfe benötigst")
						.setRequired(false),
				),
			},
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;

		if (interaction.options.getString("befehl")) {
			await this.showHelpForCommand(interaction.options.getString("befehl"));
		} else {
			await this.showHelp(data);
		}
	}

	private async showHelp(data: any): Promise<void> {
		// Get all categories
		const categoriesList: any[] = [];

		const categories: any = {
			administration: "Administration",
			fun: "Fun",
			minigames: "Minispiele",
			misc: "Sonstiges",
			moderation: "Moderation",
			owner: "Owner",
			staff: "Staff",
		};

		// Create a category list
		for (const command of this.client.commands) {
			if (!categoriesList.includes(categories[command[1].help.category])) {
				categoriesList.push(categories[command[1].help.category]);
			}
		}

		// Create the link section of the embed
		const links: string =
			"### • " +
			this.client.emotes.discord +
			" [Support](" +
			this.client.config.support["INVITE"] +
			") • " +
			this.client.emotes.growth_up +
			" [Einladen](" +
			this.client.createInvite() +
			") • " +
			this.client.emotes.globe +
			" [Website](" +
			this.client.config.general["WEBSITE"] +
			") • " +
			this.client.emotes.gift +
			" [Unterstützen](https://prohosting24.de/cp/donate/nevar) •";

		// Create the description section of the embed
		const description: string =
			"### " +
			this.client.emotes.globe +
			" " +
			this.client.user!.username +
			" ist ein Discord-Bot, der auf aktuell mehr als " +
			Math.floor(this.client.guilds.cache.size / 10) * 10 +
			" Servern genutzt wird.\n\n" +
			this.client.emotes.discover +
			" Hier findest du eine Liste aller Befehle, welche du nutzen kannst.\n\n" +
			this.client.emotes.slashcommand +
			" Jeder Befehl beginnt mit dem **Slash (/)**.\n" +
			this.client.emotes.question +
			" Um Hilfe zu einem spezifischen Befehl zu erhalten, hänge den gewünschten Befehl an den Hilfe-Command an.";

		// Create the news section of the embed
		const newsJson = JSON.parse(fs.readFileSync("./assets/news.json").toString());
		const newsDate: string = moment(newsJson.timestamp).format("DD.MM.YYYY");
		const news: string = "### " + this.client.emotes.new + " Nachricht vom " + newsDate + ":\n" + newsJson.text;

		// Create the embed
		const helpEmbed: EmbedBuilder = this.client.createEmbed(
			"{0}\n\n{1}\n\n{2}",
			null,
			"normal",
			links,
			description,
			news,
		);
		// Create the category select menu
		const categoryStringSelectMenu: StringSelectMenuBuilder = new StringSelectMenuBuilder()
			.setCustomId("category_select")
			.setPlaceholder("Wähle eine Kategorie");

		// Add the categories to the select menu
		for (const category of categoriesList) {
			if (
				category === "Staff" &&
				!data.user.staff.state &&
				!this.client.config.general["OWNER_IDS"].includes(this.interaction.user.id)
			)
				continue;
			if (
				category === "Owner" &&
				data.user.staff.role !== "head-staff" &&
				!this.client.config.general["OWNER_IDS"].includes(this.interaction.user.id)
			)
				continue;
			categoryStringSelectMenu.addOptions({
				label: category,
				emoji: this.client.emotes.slashcommand,
				value: category,
			});
		}

		// Create the action row
		const categoryActionRow: any = new ActionRowBuilder().addComponents(categoryStringSelectMenu);

		// Send the embed with the select menu
		const helpEmbedSent: any = await this.interaction.followUp({
			embeds: [helpEmbed],
			components: [categoryActionRow],
			fetchReply: true,
		});

		// Create collector for the select menu
		const categoryCollector: any = await helpEmbedSent.createMessageComponentCollector({
			filter: (i: any): boolean => i.user.id === this.interaction.user.id,
			componentType: ComponentType.StringSelect,
		});

		categoryCollector.on("collect", async (categoryInteraction: any): Promise<void> => {
			// Get selected category
			const category: any = getKeyByValue(categories, categoryInteraction.values[0]);

			// Get all commands of the selected category
			let commands: any = this.client.commands.filter((command) => command.help.category === category);
			let commandsArray: any[] = [...commands.values()];

			// Get all disabled commands
			const disabledCommands = JSON.parse(fs.readFileSync("./assets/disabled.json").toString());

			// Get all application commands
			const commandIds: any[] = [];
			const fetchedCommands: any = (await this.client.application!.commands.fetch().catch(() => {}))!.filter(
				(c: any): boolean => c.type === 1,
			);
			if (fetchedCommands)
				fetchedCommands.forEach((command: any) => commandIds.push({ name: command.name, id: command.id }));

			let formattedCommands: any[] = [];
			for (const command of commandsArray) {
				const commandId: any = commandIds.find((s: any): boolean => s.name === command.help.name)?.id;
				const availableAsSlashCommand: boolean = !!commandId;
				const isDisabled: any = disabledCommands.includes(command.help.name);
				const commandMentionString: any = availableAsSlashCommand
					? "</" + command.help.name + ":" + commandId + ">"
					: command.help.name;

				const text: string =
					(isDisabled
						? this.client.emotes.error + " ~~" + commandMentionString + "~~"
						: this.client.emotes.slashcommand + " " + commandMentionString) +
					"\n" +
					this.client.emotes.text +
					" " +
					command.help.description +
					"\n";

				formattedCommands.push(text);
			}

			let currentIndex: number = 0;
			const backId: string = this.interaction.user.id + "_back";
			const forwardId: string = this.interaction.user.id + "_forward";
			const homeId: string = this.interaction.user.id + "_home";

			const backButton: ButtonBuilder = this.client.createButton(
				backId,
				"Zurück",
				"Secondary",
				this.client.emotes.arrows.left,
			);
			const forwardButton: ButtonBuilder = this.client.createButton(
				forwardId,
				"Weiter",
				"Secondary",
				this.client.emotes.arrows.right,
			);
			const homeButton: ButtonBuilder = this.client.createButton(homeId, "Zur Startseite", "Primary", "discover");

			const generateEmbed = async (start: any): Promise<EmbedBuilder> => {
				const current: any[] = formattedCommands.slice(start, start + 5);

				const pages: any = {
					total: Math.ceil(commandsArray.length / 5),
					current: Math.round(start / 5) + 1,
				};
				if (pages.total === 0) pages.total = 1;

				const text: string = current.map((item) => "\n" + item).join("");
				const paginatedEmbed: EmbedBuilder = this.client.createEmbed(text, null, "normal");
				paginatedEmbed.setTitle(categories[category] + " ● Seite " + pages.current + " von " + pages.total);
				paginatedEmbed.setThumbnail(
					this.interaction.guild.iconURL({
						dynamic: true,
						size: 4096,
					}),
				);
				return paginatedEmbed;
			};

			const canFitOnePage: boolean = formattedCommands.length <= 5;
			await categoryInteraction.update({
				embeds: [await generateEmbed(0)],
				components: canFitOnePage
					? [new ActionRowBuilder({ components: [homeButton] })]
					: [
							new ActionRowBuilder({
								components: [forwardButton, homeButton],
							}),
						],
			});
			const paginationCollector = helpEmbedSent.createMessageComponentCollector({
				filter: (i: any): boolean => i.user.id === this.interaction.user.id,
				componentType: ComponentType.Button,
			});
			if (canFitOnePage) paginationCollector.stop();

			if (!canFitOnePage) {
				currentIndex = 0;

				paginationCollector.on("collect", async (paginationInteraction: any): Promise<void> => {
					if (paginationInteraction.customId === backId || paginationInteraction.customId === forwardId) {
						paginationInteraction.customId === backId ? (currentIndex -= 5) : (currentIndex += 5);

						await paginationInteraction.deferUpdate().catch(() => {});
						await helpEmbedSent.edit({
							embeds: [await generateEmbed(currentIndex)],
							components: [
								new ActionRowBuilder({
									components: [
										...(currentIndex ? [backButton] : []),
										...(currentIndex + 5 < formattedCommands.length ? [forwardButton] : []),
										homeButton,
									],
								}),
							],
						});
					}
				});
			}

			const homeCollector = helpEmbedSent.createMessageComponentCollector({
				filter: (i: any): boolean => i.customId === this.interaction.user.id + "_home",
			});

			homeCollector.on("collect", async (homeInteraction: any): Promise<void> => {
				if (homeInteraction.customId !== homeInteraction.user.id + "_home") return;
				commands = [];
				commandsArray = [];
				formattedCommands = [];
				paginationCollector.stop();
				await homeInteraction.deferUpdate().catch((): void => {});
				await helpEmbedSent.edit({
					embeds: [helpEmbed],
					components: [categoryActionRow],
				});
				currentIndex = 0;
			});
		});
	}

	private async showHelpForCommand(command: string): Promise<any> {
		const categories: any = {
			administration: "Administration",
			fun: "Fun",
			minigames: "Minispiele",
			misc: "Sonstiges",
			moderation: "Moderation",
			owner: "Owner",
			staff: "Staff",
		};
		const clientCommand: any = this.client.commands.find((c): boolean => c.help.name === command);
		if (clientCommand) {
			let helpString: string =
				"### " +
				this.client.emotes.text +
				" " +
				clientCommand.help.description +
				"\n\n" +
				this.client.emotes.timeout +
				" **Cooldown:** " +
				clientCommand.conf.cooldown / 1000 +
				" Sekunde(n)\n" +
				this.client.emotes.underage +
				" **NSFW:** " +
				(clientCommand.conf.nsfw ? "Ja" : "Nein") +
				"\n\n";

			if (clientCommand.conf.memberPermissions.length > 0) {
				helpString +=
					this.client.emotes.user +
					" **Benötigte Rechte (Nutzer/-in):** \n" +
					clientCommand.conf.memberPermissions
						.map((p: any): string => this.client.emotes.arrow + " " + this.client.permissions[p])
						.join("\n") +
					"\n\n";
			}

			if (clientCommand.conf.botPermissions.length > 0) {
				helpString +=
					this.client.emotes.bot +
					" **Benötigte Rechte (Bot):** \n" +
					clientCommand.conf.botPermissions
						.map((p: any): string => this.client.emotes.arrow + " " + this.client.permissions[p])
						.join("\n") +
					"\n\n";
			}

			if (clientCommand.conf.ownerOnly) {
				helpString +=
					this.client.emotes.crown + " **Nur für " + this.client.user!.username + "-Entwickler:** Ja\n\n";
			}

			if (clientCommand.conf.staffOnly) {
				helpString +=
					this.client.emotes.users + " **Nur für " + this.client.user!.username + "-Staffs:** Ja\n\n";
			}

			const helpEmbed: EmbedBuilder = this.client.createEmbed(helpString, null, "normal");

			helpEmbed.setTitle(
				" Hilfe für den " +
					clientCommand.help.name.slice(0, 1).toUpperCase() +
					clientCommand.help.name.slice(1) +
					" Befehl (" +
					categories[clientCommand.help.category] +
					")",
			);
			helpEmbed.setThumbnail(this.interaction.guild.iconURL({ dynamic: true, size: 4096 }));

			return this.interaction.followUp({ embeds: [helpEmbed] });
		} else {
			const userData = await this.client.findOrCreateUser(this.interaction.user.id);
			await this.showHelp({
				user: userData,
			});
		}
	}
}
