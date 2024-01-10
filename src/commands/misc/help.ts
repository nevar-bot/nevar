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
			description: "Sends an overview of all commands, or help for a specific command",
			localizedDescriptions: {
				de: "Sendet eine Übersicht aller Befehle, oder Hilfe zu einem bestimmten Befehl",
			},
			cooldown: 1000,
			dirname: __dirname,
			botPermissions: ["ReadMessageHistory"],
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addStringOption((option: any) =>
					option
						.setName("command")
						.setNameLocalizations({
							de: "befehl"
						})
						.setDescription("Specify a command to get help for")
						.setDescriptionLocalizations({
							de: "Gib einen Befehl an, zu dem du Hilfe benötigst"
						})
						.setRequired(false),
				),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;

		if (interaction.options.getString("command")) {
			await this.showHelpForCommand(interaction.options.getString("command"), data);
		} else {
			await this.showHelp(data);
		}
	}

	private async showHelp(data: any): Promise<void> {
		/* Get all categories */
		const categoriesList: any[] = [];

		const categories: any = {
			administration: this.translate("categories:administration"),
			fun: this.translate("categories:fun"),
			minigames: this.translate("categories:minigames"),
			misc: this.translate("categories:misc"),
			moderation: this.translate("categories:moderation"),
			owner: this.translate("categories:owner"),
			staff: this.translate("categories:staff"),
		};

		/* Create a category list */
		for (const command of this.client.commands) {
			if (!categoriesList.includes(categories[command[1].help.category])) {
				categoriesList.push(categories[command[1].help.category]);
			}
		}

		/* Create the links section of the embed */
		const links: string =
			"### • " +
			this.client.emotes.discord +
			" [" + this.translate("main:links:support") + "](" +
			this.client.config.support["INVITE"] +
			") • " +
			this.client.emotes.growth_up +
			" [" + this.translate("main:links:invite") + "](" +
			this.client.createInvite() +
			") • " +
			this.client.emotes.globe +
			" [" + this.translate("main:links:web") + "](" +
			this.client.config.general["WEBSITE"] +
			") • " +
			this.client.emotes.gift +
			" [" + this.translate("main:links:donate") + "]" +
			"(https://prohosting24.de/cp/donate/nevar) •";

		// Create the description section of the embed
		const flooredGuilds: number = Math.floor(this.client.guilds.cache.size / 10) * 10;
		const description: string =
			"### " +
			this.client.emotes.globe + " " +
			this.translate("main:guilds", { client: this.client, guilds: flooredGuilds }) + "\n\n" +
			this.client.emotes.discover + " " +
			this.translate("main:discover") + "\n\n" +
			this.client.emotes.slashcommand + " " +
			this.translate("main:slash") + "\n" +
			this.client.emotes.question + " " +
			this.translate("main:help");

		// Create the embed
		const helpEmbed: EmbedBuilder = this.client.createEmbed(
			"{0}\n\n{1}",
			null,
			"normal",
			links,
			description,
		);
		// Create the category select menu
		const categoryStringSelectMenu: StringSelectMenuBuilder = new StringSelectMenuBuilder()
			.setCustomId("category_select")
			.setPlaceholder(this.translate("main:choose"));

		// Add the categories to the select menu
		for (const category of categoriesList) {
			if (
				category === this.translate("categories:staff") &&
				!data.user.staff.state &&
				!this.client.config.general["OWNER_IDS"].includes(this.interaction.user.id)
			)
				continue;
			if (
				category === this.translate("categories:owner") &&
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
					(data.guild.locale === "de" ? command.help.localizedDescriptions.de : command.help.description) +
					"\n";

				formattedCommands.push(text);
			}

			let currentIndex: number = 0;
			const backId: string = this.interaction.user.id + "_back";
			const forwardId: string = this.interaction.user.id + "_forward";
			const homeId: string = this.interaction.user.id + "_home";

			const backButton: ButtonBuilder = this.client.createButton(
				backId,
				this.translate("basics:back", undefined, true),
				"Secondary",
				this.client.emotes.arrows.left,
			);
			const forwardButton: ButtonBuilder = this.client.createButton(
				forwardId,
				this.translate("basics:further", undefined, true),
				"Secondary",
				this.client.emotes.arrows.right,
			);
			const homeButton: ButtonBuilder = this.client.createButton(homeId, this.translate("main:home"), "Primary", "discover");

			const generateEmbed = async (start: any): Promise<EmbedBuilder> => {
				const current: any[] = formattedCommands.slice(start, start + 5);

				const pages: any = {
					total: Math.ceil(commandsArray.length / 5),
					current: Math.round(start / 5) + 1,
				};
				if (pages.total === 0) pages.total = 1;

				const text: string = current.map((item) => "\n" + item).join("");
				const paginatedEmbed: EmbedBuilder = this.client.createEmbed(text, null, "normal");
				if(pages.total > 1){
					paginatedEmbed.setTitle(categories[category] + " • " + this.translate("utils:pagination", { pages }, true));
				}else{
					paginatedEmbed.setTitle(categories[category]);
				}
				paginatedEmbed.setThumbnail(
					this.interaction.guild!.iconURL({size: 4096,}),
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

	private async showHelpForCommand(command: string, data: any): Promise<any> {
		const categories: any = {
			administration: this.translate("categories:administration"),
			fun: this.translate("categories:fun"),
			minigames: this.translate("categories:minigames"),
			misc: this.translate("categories:misc"),
			moderation: this.translate("categories:moderation"),
			owner: this.translate("categories:owner"),
			staff: this.translate("categories:staff"),
		};
		const clientCommand: any = this.client.commands.find((c): boolean => c.help.name === command);
		if (clientCommand) {
			let helpString: string =
				"### " +
				this.client.emotes.text +
				" " +
				(data.guild.locale === "de" ? clientCommand.help.localizedDescriptions.de : clientCommand.help.description) +
				"\n\n" +
				this.client.emotes.timeout + " **" +
				this.translate("help:cooldown") + ":** " +
				clientCommand.conf.cooldown / 1000 + " " +
				this.translate("help:seconds") + "\n" +
				this.client.emotes.underage + " **" +
				this.translate("help:nsfw") + ":** " +
				(clientCommand.conf.nsfw ? this.translate("basics:yes", undefined, true) : this.translate("basics:no", undefined, true)) +
				"\n\n";

			if (clientCommand.conf.memberPermissions.length > 0) {
				helpString +=
					this.client.emotes.user + " **" +
					this.translate("help:userPermissions") + ":**\n" +
					clientCommand.conf.memberPermissions
						.map((p: any): string => this.client.emotes.arrow + " " + this.client.permissions[p])
						.join("\n") +
					"\n\n";
			}

			if (clientCommand.conf.botPermissions.length > 0) {
				helpString +=
					this.client.emotes.bot + " **" +
					this.translate("help:botPermissions") + ":**\n" +
					clientCommand.conf.botPermissions
						.map((p: any): string => this.client.emotes.arrow + " " + this.client.permissions[p])
						.join("\n") +
					"\n\n";
			}

			if (clientCommand.conf.ownerOnly) {
				helpString +=
					this.client.emotes.crown + " **" +
					this.translate("help:ownerOnly", { client: this.client }) + ":** " +
					this.translate("basics:yes", undefined, true) + "\n\n";
			}

			if (clientCommand.conf.staffOnly) {
				helpString +=
					this.client.emotes.users + " **" +
					this.translate("help:staffOnly", { client: this.client }) + ":** " +
					this.translate("basics:yes", undefined, true) + "\n\n";
			}

			const helpEmbed: EmbedBuilder = this.client.createEmbed(helpString, null, "normal");

			helpEmbed.setTitle(
				this.translate("help:title", {
					command: clientCommand.help.name.slice(0, 1).toUpperCase() + clientCommand.help.name.slice(1),
					category: categories[clientCommand.help.category],
				})
			);
			helpEmbed.setThumbnail(this.interaction.guild!.iconURL({ size: 4096 }));

			return this.interaction.followUp({ embeds: [helpEmbed] });
		} else {
			const userData = await this.client.findOrCreateUser(this.interaction.user.id);
			await this.showHelp({
				user: userData,
			});
		}
	}
}
