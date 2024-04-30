import { NevarClient } from "@core/NevarClient";
import { ButtonBuilder, EmbedBuilder } from "discord.js";

export default class {
	private client: NevarClient;
	private timeouts: any;

	public constructor(client: NevarClient) {
		this.client = client;
		this.timeouts = new Set();
	}

	public async dispatch(message: any): Promise<any> {
		if (!message || !message.member || !message.guild || !message.guild.available) return;

		/* Basic information */
		const { guild, member, channel }: any = message;

		const data: any = {
			guild: await this.client.findOrCreateGuild(guild.id),
			member: await this.client.findOrCreateMember(member.id, guild.id),
			user: await this.client.findOrCreateUser(member.user.id),
		};
		guild.data = data.guild;
		member.data = data.member;
		member.user.data = data.user;

		/* Author mentioned bot */
		if (message.content.match(new RegExp(`^<@!?${this.client.user!.id}>( |)$`)) && !message.author.bot) {
			const currentHour: number = new Date().getHours();
			const greetings: (number | string)[][] = [
				[0, 5, guild.translate("events/message/MessageCreate:greetings:night", { user: message.author.toString() })],
				[6, 10, guild.translate("events/message/MessageCreate:greetings:morning", { user: message.author.toString() })],
				[11, 13, guild.translate("events/message/MessageCreate:greetings:noon", { user: message.author.toString() })],
				[14, 17, guild.translate("events/message/MessageCreate:greetings:afternoon", { user: message.author.toString() })],
				[18, 23, guild.translate("events/message/MessageCreate:greetings:evening", { user: message.author.toString() })],
			];

			let greeting;
			greetings.forEach(([start, end, message]: any): void => {
				if(currentHour >= start && currentHour <= end) greeting = message;
			});

			const helpCommand: any = (await this.client.application!.commands.fetch()).find((command: any): boolean => command.name === "help");
			const helpString: string = helpCommand ? "</help:" + helpCommand.id + ">" : "/help";
			const flooredGuildCount: number = Math.floor(this.client.guilds.cache.size / 10) * 10;

			const greetingText: string =
				"### " + this.client.emotes.wave + " " + greeting + "\n\n\n" +
				this.client.emotes.shine + " " + guild.translate("events/message/MessageCreate:mentionIntroduction", { client: this.client.user!.toString(), guilds: flooredGuildCount }) + "\n" +
				this.client.emotes.question + "  " + guild.translate("events/message/MessageCreate:mentionHelp", { help: helpString });

			const helpEmbed: EmbedBuilder = this.client.createEmbed(greetingText, null, "normal");
			helpEmbed.setThumbnail(this.client.user!.displayAvatarURL());

			const inviteButton: ButtonBuilder = this.client.createButton(null, "Einladen", "Link", this.client.emotes.logo.icon, false, this.client.createInvite());
			const supportButton: ButtonBuilder = this.client.createButton(null, "Support", "Link", this.client.emotes.discord, false, this.client.config.support["INVITE"]);
			const websiteButton: ButtonBuilder = this.client.createButton(null, "Website", "Link", this.client.emotes.globe, false, this.client.config.general["WEBSITE"])
			const buttonRow: any = this.client.createMessageComponentsRow(inviteButton, supportButton, websiteButton);

			return message.reply({ embeds: [helpEmbed], components: [buttonRow] });
		} else if (message.content) {
			/* Split messages by spaces */
			const splittedMessage: string[] = message.content.split(" ");

			/* Check if message starts with mentioning the bot */
			if (RegExp(new RegExp(`^<@!?${this.client.user!.id}>( |)$`)).exec(splittedMessage[0])) {
				/* Remove first element from array */
				splittedMessage.shift();

				/* Seperate command from arguments */
				const command: any = splittedMessage.shift();
				const args: string[] = splittedMessage;

				/* Check if command exists and if user is permitted to use it */
				const clientCommand: any = this.client.commands.get(command);
				if (clientCommand && (clientCommand.conf.staffOnly || clientCommand.conf.ownerOnly)) {
					/* check if user is staff or owner */
					if (!data.user.staff.state && !this.client.config.general["OWNER_IDS"].includes(message.author.id)) return;
					if (clientCommand.help.category === "owner" && data.user.staff.role !== "head-staff" && !this.client.config.general["OWNER_IDS"].includes(message.author.id)) return;

					/* Execute command */
					try {
						clientCommand.dispatch(message, args, data);
					} catch (e: any) {
						return this.client.alertException(e, message.guild, message.member, "<ClientMessageCommand>.dispatch(<message>, <args>, <data>)");
					}
				}
			}
		}

		/* Autodelete */
		if (data.guild.settings.autodelete && data.guild.settings.autodelete.length > 0) {
			for (const autodelete of data.guild.settings.autodelete) {
				const channelId: any = autodelete.channel;
				const time: any = autodelete.time;
				if (
					(channelId !== message.channel.id && message.channel.type !== 11) ||
					(message.channel.type === 11 && message.channel.parentId !== channelId && message.channel.id !== channelId)
				) continue;

				this.client.wait(Number(time)).then((): void => {
					if (!message.pinned) {
						message.delete().catch((e: any): void => {});
					}
				}).catch((e: any): void => {});
			}
		}

		/* Autoreact */
		if (data.guild.settings.autoreact && data.guild.settings.autoreact.length > 0) {
			for (const autoreact of data.guild.settings.autoreact) {
				const channelId = autoreact.channel;
				const emoji = autoreact.emoji;
				if (
					(channelId !== message.channel.id && message.channel.type !== 11) ||
					(message.channel.type === 11 && message.channel.parentId !== channelId && message.channel.id !== channelId)
				) continue;
				message.react(emoji).catch((e: any): void => {});
			}
		}

		/* Leveling */
		if (message.author.bot) return;

		if (data.guild.settings.levels.enabled) {
			/* Get xp amount */
			const minXp = data.guild.settings.levels.xp.min || 1;
			const maxXp = data.guild.settings.levels.xp.max || 30;

			let xp: number = this.client.utils.getRandomInt(minXp, maxXp);

			/* Check if channel is excluded or user has excluded roles */
			if (data.guild.settings.levels.exclude) {
				for (const excludedRoleId of data.guild.settings.levels.exclude.roles) {
					if (message.member.roles.cache.get(excludedRoleId)) return;
				}
				for (let excludedChannelId of data.guild.settings.levels.exclude.channels) {
					if (message.channel.id === excludedChannelId) return;
				}
			}

			/* Check for double xp roles */
			if (data.guild.settings.levels.doubleXP && data.guild.settings.levels.doubleXP.length > 0) {
				for (const doubleXP of data.guild.settings.levels.doubleXP) {
					if (message.member.roles.cache.get(doubleXP)) {
						xp = xp * 2;
					}
				}
			}

			/* Check if user leveled up */
			if (!this.timeouts.has(message.author.id)) {
				const hasLeveledUp: boolean = await this.client.levels.appendXp(message.author.id, message.guild.id, xp);
				const levelUser: any = await this.client.levels.fetch(message.author.id, message.guild.id, true);

				if (hasLeveledUp) {
					const newLevel: number = Number(levelUser.level);
					/* Check for new level roles */
					if (data.guild.settings.levels.roles && data.guild.settings.levels.roles.length > 0) {
						for (const levelRole of data.guild.settings.levels.roles) {
							const roleId: any = levelRole.role;
							const level: any = levelRole.level;
							if (Number(level) === newLevel || Number(level) < newLevel) {
								message.member.roles.add(roleId).catch((e: any): void => {});
							}
						}
					}

					/* Send level up message */
					function parseMessage(str: string): string {
						return str
							.replaceAll(/%level/g, String(newLevel))
							.replaceAll(/%user.name/g, message.author.username)
							.replaceAll(/%user.displayName/g, message.author.displayName)
							.replaceAll(/%user.id/g, message.author.id)
							.replaceAll(/%user/g, message.author)
							.replaceAll(/%server.id/g, message.guild.id)
							.replaceAll(/%server.memberCount/g, message.guild.memberCount)
							.replaceAll(/%server/g, message.guild.name);
					}

					const parsedMessage: string = parseMessage(data.guild.settings.levels.message);

					const channel: any = message.guild.channels.cache.get(data.guild.settings.levels.channel) || message.channel;
					if (!channel) return;

					channel.send({ content: parsedMessage }).catch((e: any): void => {});
				}
				this.timeouts.add(message.author.id);
				setTimeout((): void => this.timeouts.delete(message.author.id), 15000);
			}
		}
	}
}