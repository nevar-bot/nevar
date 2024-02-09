import BaseCommand from "@structures/BaseCommand.js";
import BaseClient from "@structures/BaseClient.js";
import { ActionRowBuilder, SlashCommandBuilder, ComponentType, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder } from "discord.js";
import fs from "fs";
import path from "path";

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
			dirname: import.meta.url,
			botPermissions: ["ReadMessageHistory"],
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addStringOption((option: any) =>
					option
						.setName("command")
						.setNameLocalization("de", "befehl")
						.setDescription("Specify a command to get help for")
						.setDescriptionLocalization("de", "Wähle einen Befehl, zu dem du Hilfe benötigst")
						.setRequired(false)
						.setAutocomplete(true)
				),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;

		if (interaction.options.getString("command")) {
			await this.showHelpForCommand(interaction.options.getString("command"));
		} else {
			await this.showHelp();
		}
	}

	private async showHelp(): Promise<void> {
		const categoriesList: any[] = [];
		const categories: any = this.translate("categories");

		for (const command of this.client.commands){
			const commandCategory: string = command[1].help.category;
			if(!categoriesList.includes(categories[commandCategory])) categoriesList.push(categories[commandCategory]);
		}

		const embedDescription = this.translate("list:mainEmbedDescription", {
			e: this.client.emotes,
			support: this.client.support,
			invite: this.client.createInvite(),
			web: this.client.config.general["WEBSITE"],
			donate: "https://prohosting24.de/cp/donate/nevar",
			client: this.client,
			guilds: Math.floor(this.client.guilds.cache.size / 10) * 10,
		}).join("");


		const helpEmbed: EmbedBuilder = this.client.createEmbed(embedDescription, null, "normal");

		const categoryStringSelectMenu: StringSelectMenuBuilder = new StringSelectMenuBuilder().setCustomId("category_select").setPlaceholder(this.translate("list:chooseCategory"));
		for (const category of categoriesList){
			if(category !== categories["staff"] || this.data.user.staff.state || this.client.config.general["OWNER_IDS"].includes(this.interaction.user.id)){
				if(category !== categories["owner"] || (this.data.user.staff.role === "head-staff" || this.client.config.general["OWNER_IDS"].includes(this.interaction.user.id))){
					categoryStringSelectMenu.addOptions({ label: category, emoji: this.client.emotes.slashcommand, value: category });
				}
			}
		}

		const categoryActionRow: any = new ActionRowBuilder().addComponents(categoryStringSelectMenu);
		const helpEmbedSent: any = await this.interaction.followUp({ embeds: [helpEmbed], components: [categoryActionRow], fetchReply: true });

		const categoryCollector: any = await helpEmbedSent.createMessageComponentCollector({ filter: (i: any): boolean => i.user.id === this.interaction.user.id, componentType: ComponentType.StringSelect });
		categoryCollector.on("collect", async (categoryInteraction: any): Promise<void> => {
			const category: any = getKeyByValue(categories, categoryInteraction.values[0]);
			let commands: any = this.client.commands.filter((command) => command.help.category === category);
			let commandsArray: any[] = [...commands.values()];
			const disabledCommands = JSON.parse(fs.readFileSync("./assets/disabled.json").toString());
			const commandIds: any[] = [];
			const fetchedCommands: any = (await this.client.application!.commands.fetch().catch(() => {}))!.filter((c: any): boolean => c.type === 1);
			if (fetchedCommands) fetchedCommands.forEach((command: any) => commandIds.push({ name: command.name, id: command.id }));

			let formattedCommands: any[] = [];
			for (const command of commandsArray) {
				const commandId: any = commandIds.find((s: any): boolean => s.name === command.help.name)?.id;
				const availableAsSlashCommand: boolean = !!commandId;
				const isDisabled: any = disabledCommands.includes(command.help.name);
				const commandMentionString: any = availableAsSlashCommand ? "</" + command.help.name + ":" + commandId + ">" : command.help.name;
				const text: string = (isDisabled ? this.client.emotes.error + " ~~" + commandMentionString + "~~" : this.client.emotes.slashcommand + " " + commandMentionString) + "\n" + this.client.emotes.text + " " + (this.data.guild.locale === "de" ? command.help.localizedDescriptions.de : command.help.description) + "\n";
				formattedCommands.push(text);
			}

			let currentIndex: number = 0;
			const backId: string = this.interaction.user.id + "_back";
			const forwardId: string = this.interaction.user.id + "_forward";
			const homeId: string = this.interaction.user.id + "_home";

			const backButton: ButtonBuilder = this.client.createButton(backId, this.getBasicTranslation("back"), "Secondary", this.client.emotes.arrows.left);
			const forwardButton: ButtonBuilder = this.client.createButton(forwardId, this.getBasicTranslation("further"), "Secondary", this.client.emotes.arrows.right);
			const homeButton: ButtonBuilder = this.client.createButton(homeId, this.translate("list:backToOverview"), "Primary", "discover");

			const generateEmbed = async (start: any): Promise<EmbedBuilder> => {
				const current: any[] = formattedCommands.slice(start, start + 5);
				const pages: any = { total: Math.ceil(commandsArray.length / 5), current: Math.round(start / 5) + 1 };
				if (pages.total === 0) pages.total = 1;
				const text: string = current.map((item) => "\n" + item).join("");
				const paginatedEmbed: EmbedBuilder = this.client.createEmbed(text, null, "normal");
				if(pages.total > 1) paginatedEmbed.setTitle(categories[category] + " • " + this.getBasicTranslation("pagination", { pages }));
				else paginatedEmbed.setTitle(categories[category]);
				paginatedEmbed.setThumbnail(this.interaction.guild!.iconURL({size: 4096,}));
				return paginatedEmbed;
			};

			const canFitOnePage: boolean = formattedCommands.length <= 5;
			await categoryInteraction.update({ embeds: [await generateEmbed(0)], components: canFitOnePage ? [new ActionRowBuilder({ components: [homeButton] })] : [new ActionRowBuilder({ components: [forwardButton, homeButton] })] });
			const paginationCollector = helpEmbedSent.createMessageComponentCollector({ filter: (i: any): boolean => i.user.id === this.interaction.user.id, componentType: ComponentType.Button });
			if (canFitOnePage) paginationCollector.stop();

			if (!canFitOnePage) {
				currentIndex = 0;

				paginationCollector.on("collect", async (paginationInteraction: any): Promise<void> => {
					if (paginationInteraction.customId === backId || paginationInteraction.customId === forwardId) {
						paginationInteraction.customId === backId ? (currentIndex -= 5) : (currentIndex += 5);
						await paginationInteraction.deferUpdate().catch(() => {});
						await helpEmbedSent.edit({ embeds: [await generateEmbed(currentIndex)], components: [new ActionRowBuilder({ components: [...(currentIndex ? [backButton] : []), ...(currentIndex + 5 < formattedCommands.length ? [forwardButton] : []), homeButton] })] });
					}
				});
			}

			const homeCollector = helpEmbedSent.createMessageComponentCollector({ filter: (i: any): boolean => i.customId === this.interaction.user.id + "_home" });
			homeCollector.on("collect", async (homeInteraction: any): Promise<void> => {
				if (homeInteraction.customId !== homeInteraction.user.id + "_home") return;
				commands = [];
				commandsArray = [];
				formattedCommands = [];
				paginationCollector.stop();
				await homeInteraction.deferUpdate().catch((): void => {});
				await helpEmbedSent.edit({ embeds: [helpEmbed], components: [categoryActionRow] });
				currentIndex = 0;
			});
		});
	}


	private async showHelpForCommand(command: string): Promise<any> {
		const categories: any = this.translate("categories");
		const clientCommand: any = this.client.commands.find((c): boolean => c.help.name === command);
		if (clientCommand) {
			const helpString: string = "### " +
				this.client.emotes.text + " " + (this.data.guild.locale === "de" ? clientCommand.help.localizedDescriptions.de : clientCommand.help.description) + "\n\n" +
				this.client.emotes.timeout + ` **${this.translate("help:commandCooldown")}:** ${clientCommand.conf.cooldown / 1000} ${clientCommand.conf.cooldown / 1000 === 1 ? this.getTimeUnitTranslation("second") : this.getTimeUnitTranslation("seconds")}\n` +
				this.client.emotes.underage + ` **${this.translate("help:commandIsNsfw")}:** ${(clientCommand.conf.nsfw ? this.getBasicTranslation("yes") : this.getBasicTranslation("no"))}\n\n` +
				(clientCommand.conf.memberPermissions.length > 0 ? this.client.emotes.user + ` **${this.translate("help:commandUserPermissions")}:**\n${clientCommand.conf.memberPermissions.map((p: any): string => this.client.emotes.arrow + " " + this.getPermissionTranslation(p)).join("\n")}\n\n` : "") +
				(clientCommand.conf.botPermissions.length > 0 ? this.client.emotes.bot + ` **${this.translate("help:commandBotPermissions")}:**\n${clientCommand.conf.botPermissions.map((p: any): string => this.client.emotes.arrow + " " + this.getPermissionTranslation(p)).join("\n")}\n\n` : "") +
				(clientCommand.conf.ownerOnly ? this.client.emotes.crown + ` **${this.translate("help:commandIsOwnerOnly", { client: this.client })}:** ${this.getBasicTranslation("yes")}\n\n` : "") +
				(clientCommand.conf.staffOnly ? this.client.emotes.users + ` **${this.translate("help:commandIsStaffOnly", { client: this.client })}:** ${this.getBasicTranslation("yes")}\n\n` : "");

			const helpEmbed: EmbedBuilder = this.client.createEmbed(helpString, null, "normal");

			helpEmbed.setTitle(this.translate("help:helpTitle", { command: clientCommand.help.name.slice(0, 1).toUpperCase() + clientCommand.help.name.slice(1), category: categories[clientCommand.help.category] }));
			helpEmbed.setThumbnail(this.interaction.guild!.iconURL({ size: 4096 }));

			return this.interaction.followUp({ embeds: [helpEmbed] });
		} else {
			await this.showHelp();
		}
	}
}
