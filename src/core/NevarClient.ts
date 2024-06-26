/* Import modules */
import * as path from "path";
import * as toml from "toml";
import * as fs from "fs";
import * as util from "util";

/* Import discord.js classes */
import { ActionRowBuilder, AnyComponentBuilder, ButtonBuilder, ButtonStyle, Client as DiscordClient, Collection, EmbedBuilder, GatewayIntentBits, Guild, OAuth2Scopes, Partials, PermissionsBitField, User } from "discord.js";

/* Import emojis */
const emotes: any = JSON.parse(fs.readFileSync("./assets/emojis.json", "utf8"));

import { Logger } from "@helpers/Logger.js";
import { Utils } from "@helpers/Utils.js";
import { LevelsManager } from "@helpers/LevelsManager.js";
import { GiveawaysManager } from "@helpers/GiveawaysManager.js";

/* Import database schemas */
import { LogModel } from "@schemas/Log.js";
import { GuildModel } from "@schemas/Guild.js";
import { UserModel } from "@schemas/User.js";
import { MemberModel } from "@schemas/Member.js";
import { GiveawayModel } from "@schemas/Giveaway.js";

export class NevarClient extends DiscordClient {
	public wait: (ms: number) => Promise<void>;
	public config: any;
	public emotes: any;
	public support: string;
	public locales: any;
	public commands: Collection<string, any>;
	public contextMenus: Collection<string, any>;
	public giveawayManager: any;
	public logger: any;
	public utils: any;
	public levels: any;
	public logs: any;
	public guildsData: any;
	public usersData: any;
	public membersData: any;
	public giveawaysData: any;
	public databaseCache: {
		users: Collection<string, any>;
		guilds: Collection<string, any>;
		members: Collection<string, any>;
		bannedUsers: Collection<string, any>;
		mutedUsers: Collection<string, any>;
		reminders: Collection<string, any>;
	};
	public invites: Collection<string, any>;

	constructor() {
		super({
			intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildScheduledEvents, GatewayIntentBits.GuildInvites, GatewayIntentBits.MessageContent ],
			partials: [ Partials.User, Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction, Partials.GuildScheduledEvent, Partials.ThreadMember ],
			allowedMentions: {
				parse: ["users"],
			},
		});

		this.wait = util.promisify(setTimeout);
		this.config = toml.parse(fs.readFileSync("./config.toml", "utf8"));
		this.emotes = emotes;
		this.support = this.config.support["INVITE"];

		this.commands = new Collection();
		this.contextMenus = new Collection();

		this.giveawayManager = new GiveawaysManager(this);
		this.logger = new Logger();
		this.utils = new Utils();
		this.levels = new LevelsManager();

		this.logs = LogModel;
		this.guildsData = GuildModel;
		this.usersData = UserModel;
		this.membersData = MemberModel;
		this.giveawaysData = GiveawayModel;

		this.databaseCache = {
			users: new Collection(),
			guilds: new Collection(),
			members: new Collection(),
			bannedUsers: new Collection(),
			mutedUsers: new Collection(),
			reminders: new Collection(),
		};

		this.invites = new Collection();
	}

	getLocaleString(key: string, locale: string, args?: object): Promise<string | null> {
		const language: any = this.locales.get(locale);
		return language(key, args);
	}

	async findOrCreateUser(userID: string, isLean: boolean = false): Promise<any> {
		const cachedUser = this.databaseCache.users.get(userID);

		if (cachedUser) {
			return isLean ? cachedUser.toJSON() : cachedUser;
		}

		let userData = isLean
			? await this.usersData.findOne({ id: userID }).lean()
			: await this.usersData.findOne({ id: userID });

		if (!userData) {
			userData = await this.usersData.create({ id: userID });
		}

		this.databaseCache.users.set(userID, userData);

		return isLean ? userData.toJSON() : userData;
	}

	async findUser(userID: string): Promise<any> {
		const cachedUser: any = this.databaseCache.users.get(userID);
		return cachedUser || (await this.usersData.findOne({ id: userID }));
	}

	async deleteUser(userID: string): Promise<any> {
		if (this.databaseCache.users.get(userID)) {
			await this.usersData.findOneAndDelete({ id: userID }).catch((): void => {});
			this.databaseCache.users.delete(userID);
		}
	}

	async findOrCreateMember(memberID: string, guildID: string, isLean: boolean = false): Promise<any> {
		const cachedMember = this.databaseCache.members.get(`${memberID}${guildID}`);
		if (cachedMember) {
			return isLean ? cachedMember.toJSON() : cachedMember;
		}

		let memberData = isLean
			? await this.membersData.findOne({ guildID, id: memberID }).lean()
			: await this.membersData.findOne({ guildID, id: memberID });

		if (!memberData) {
			memberData = new this.membersData({ id: memberID, guildID: guildID });
			await memberData.save();

			this.databaseCache.members.set(`${memberID}${guildID}`, memberData);

			const guild = await this.findOrCreateGuild(guildID);
			if (guild) {
				guild.members.push(memberData._id);
				await guild.save().catch((): void => {});
			}
		}

		return isLean ? memberData.toJSON() : memberData;
	}

	async findMember(memberID: string, guildID: string): Promise<any> {
		const cachedMember: any = this.databaseCache.members.get(`${memberID}${guildID}`);
		return cachedMember || await this.membersData.findOne({ id: memberID, guildID: guildID });
	}

	async deleteMember(memberID: string, guildID: string): Promise<any> {
		if (this.databaseCache.members.get(`${memberID}${guildID}`)) {
			await this.membersData.findOne({ id: memberID, guildID: guildID }).deleteOne().exec().catch((): void => {});
			this.databaseCache.members.delete(`${memberID}${guildID}`);
		}
	}

	async findOrCreateGuild(guildID: string, isLean: boolean = false): Promise<any> {
		const cachedGuild = this.databaseCache.guilds.get(guildID);
		if (cachedGuild) {
			return isLean ? cachedGuild.toJSON() : cachedGuild;
		}

		let guildData = isLean
			? await this.guildsData.findOne({ id: guildID }).populate("members").lean()
			: await this.guildsData.findOne({ id: guildID }).populate("members");

		if (!guildData) {
			guildData = new this.guildsData({ id: guildID });
			await guildData.save();
			this.databaseCache.guilds.set(guildID, guildData);
		}

		return isLean ? guildData.toJSON() : guildData;
	}

	async findGuild(guildID: string): Promise<any> {
		const cachedGuild: any = this.databaseCache.guilds.get(guildID);
		return cachedGuild || await this.guildsData.findOne({id: guildID});
	}

	async deleteGuild(guildID: string): Promise<any> {
		if (this.databaseCache.guilds.get(guildID)) {
			await this.guildsData.findOne({ id: guildID }).deleteOne().exec().catch((): void => {});
			this.databaseCache.guilds.delete(guildID);
		}
	}

	// Command methods
	async loadCommand(commandPath: string, name: string): Promise<boolean | any> {
		try {
			const props = new (await import(commandPath + "/" + name)).default(this);
			props.conf.location = commandPath;
			if (props.init) props.init(this);
			this.commands.set(props.help.name, props);
			return false;
		} catch (e: any) {
			return e;
		}
	}

	async unloadCommand(commandPath: string, name: string): Promise<string | boolean> {
		let command: any;
		if (this.commands.has(name)) command = this.commands.get(name);
		if (!command) return "Command not found: " + name;
		if (command.shutdown) await command.shutdown(this);

		delete require.cache[require.resolve(commandPath + path.sep + name + ".js")];
		return false;
	}

	// Utility methods
	format(integer: number): string {
		return new Intl.NumberFormat("de-DE").format(integer);
	}

	createEmbed(message: string | null, emote: string | null, type: "normal" | "success" | "warning" | "error" | "transparent", ...args: any): EmbedBuilder {
		const color: any = type
			.replace("normal", this.config.embeds["DEFAULT_COLOR"])
			.replace("success", this.config.embeds["SUCCESS_COLOR"])
			.replace("warning", this.config.embeds["WARNING_COLOR"])
			.replace("transparent", this.config.embeds["TRANSPARENT_COLOR"])
			.replace("error", this.config.embeds["ERROR_COLOR"]);

		let formattedMessage: string | null = message;
		for (let i: number = 0; i < args.length; i++) {
			formattedMessage = formattedMessage!.replaceAll("{" + i + "}", args[i]);
		}

		return new EmbedBuilder()
			.setDescription((emote ? this.emotes[emote] + " " : " ") + (formattedMessage || " "))
			.setColor(color)
			.setFooter({ text: this.config.embeds["FOOTER_TEXT"] });
	}

	createButton(customId: string|null, label: string|null, style: string, emote: string|null = null, disabled: boolean = false, url: string|null = null): ButtonBuilder {
		const button: ButtonBuilder = new ButtonBuilder()
			.setLabel(label || " ")
			// @ts-ignore - Element implicitly has an 'any' type because index expression is not of type 'number'
			.setStyle(ButtonStyle[style])
			.setDisabled(disabled);

		if (customId && !url) button.setCustomId(customId);
		if (!customId && url) button.setURL(url);
		if (emote && this.emotes[emote]) button.setEmoji(this.emotes[emote]);
		else if (emote) button.setEmoji(emote);

		return button;
	}

	createMessageComponentsRow(...components: any): ActionRowBuilder<AnyComponentBuilder> {
		return new ActionRowBuilder().addComponents(components);
	}

	createInvite(): string {
		const { Flags } = PermissionsBitField;
		return this.generateInvite({
			scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
			permissions: [
				Flags.AddReactions, Flags.AttachFiles, Flags.BanMembers, Flags.ManageEmojisAndStickers,
				Flags.EmbedLinks, Flags.KickMembers, Flags.ManageChannels,
				Flags.ManageMessages, Flags.ManageWebhooks, Flags.ModerateMembers, Flags.MoveMembers,
				Flags.ReadMessageHistory, Flags.SendMessages, Flags.SendMessagesInThreads, Flags.UseExternalEmojis,
				Flags.ViewAuditLog, Flags.ViewChannel, Flags.ManageRoles,
				// TODO: --- sobald Discord API endlich mal CreateGuildExpressions beinhaltet
				// TODO: --- ManageEmojisAndStickers removen, CreateGuildExpressions und ManageGuildExpressions adden
			],
		});
	}

	alertException(exception: any, guild: string|null = null, user: User|null = null, action: string|null = null): any {
		const supportGuild: Guild | undefined = this.guilds.cache.get(this.config.support["ID"]);
		const errorLogChannel: any = supportGuild?.channels.cache.get(this.config.support["ERROR_LOG"]);
		if (!supportGuild || !errorLogChannel) return;

		const exceptionEmbed: EmbedBuilder = this.createEmbed("Ein Fehler ist aufgetreten", "error", "error");
		let description: string | undefined = exceptionEmbed.data.description;

		if (guild) description += "\n" + this.emotes.arrow + " Server: " + guild;
		if (user) description += "\n" + this.emotes.arrow + " Nutzer/-in: " + user.username + " (" + user.id + ")";
		if (action) description += "\n" + this.emotes.arrow + " Aktion: " + action;
		description += "\n```js\n" + exception.stack + "```";

		exceptionEmbed.setDescription(description!);
		exceptionEmbed.setThumbnail(this.user!.displayAvatarURL());
		return errorLogChannel.send({ embeds: [exceptionEmbed] }).catch(() => {});
	}

	alert(text: string, color: "normal"|"success"|"warning"|"error"|"transparent"): any {
		const supportGuild: Guild | undefined = this.guilds.cache.get(this.config.support["ID"]);
		if (!supportGuild) return;
		const logChannel: any = supportGuild.channels.cache.get(this.config.support["BOT_LOG"]);
		if (!logChannel) return;

		const embed: EmbedBuilder = this.createEmbed(text, "information", color);
		embed.setThumbnail(this.user!.displayAvatarURL());
		return logChannel.send({ embeds: [embed] });
	}

	async resolveUser(query: string, exact: boolean = false): Promise<any> {
		const USER_MENTION: RegExp = /<?@?!?(\d{17,20})>?/;
		if (!query) return;

		const patternMatch: RegExpExecArray | null = RegExp(USER_MENTION).exec(query);
		if (patternMatch) {
			const id: string = patternMatch[1];
			const fetchedUser: any = await this.users.fetch(id, { cache: true }).catch((): void => {});
			if (fetchedUser) return fetchedUser;
		}

		const matchingUsernames: any = this.users.cache.filter((user: any): boolean => user.username === query);
		if (matchingUsernames.size === 1) return matchingUsernames.first();

		if (!exact) {
			return this.users.cache.find(
				(x: any): any => x.username === query || x.username.toLowerCase().includes(query.toLowerCase()),
			);
		}
	}
}