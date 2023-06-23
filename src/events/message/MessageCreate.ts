import BaseClient from "@structures/BaseClient";
import { ButtonBuilder, EmbedBuilder } from "discord.js";
import ems from "enhanced-ms";
const ms: any = ems("de");
import Levels from "discord-xp";

export default class
{
	private client: BaseClient;
	private timeouts: any;

	public constructor(client: BaseClient)
	{
		this.client = client;
		this.timeouts = new Set();
	}

	public async dispatch(message: any): Promise<any>
	{
		if (!message || !message.member || !message.guild || !message.guild.available) return;

		/* Basic information */
		const { guild, member, channel }: any = message;

		const data: any = {
			guild: await this.client.findOrCreateGuild(guild.id),
			member: await this.client.findOrCreateMember(member.id, guild.id),
			user: await this.client.findOrCreateUser(member.user.id)
		};

		/* Afk system */

		/* Author mentions afk user */
		if ((message.mentions.repliedUser || message.mentions.users) && !message.author.bot) {
			this.client.emit("MemberIsAway", message, data, guild);
		}

		/* Author is afk */
		if (data.user.afk.state) {
			this.client.emit("MemberIsBack", message, data, guild);
		}

		/* Author mentioned bot */
		if (message.content.match(new RegExp(`^<@!?${this.client.user!.id}>( |)$`)) && !message.author.bot) {

			const currentHour: number = new Date().getHours();
			const greetings: (number | string)[][] = [
				[0, 5, "Gute Nacht"],
				[5, 10, "Guten Morgen"],
				[11, 13, "Guten Mittag"],
				[14, 17, "Guten Tag"],
				[18, 23, "Guten Abend"]
			]

			let greeting;
			for (const element of greetings) {
				// @ts-ignore - Operator '>=' cannot be applied to types 'number' and 'string | number'
				if (currentHour >= element[0] && currentHour <= element[1]) {
					greeting = element[2] + " " + message.author.username + "!";
				}
			}

			const helpCommand: any = (await this.client.application!.commands.fetch()).find((command: any): boolean => command.name === "help");
			const greetingText: string =
				"**{0}**" +
				"\n\n{1} Ich bin {2} und helfe dir bei der Verwaltung deines Servers." +
				"\n{1} Eine Übersicht meiner Befehle erhältst du durch folgenden Befehl: {3}"

			const helpEmbed: EmbedBuilder = this.client.createEmbed(greetingText, "wave", "normal", greeting, this.client.emotes.arrow, this.client.user!.username, (helpCommand ? "</" + helpCommand.name + ":" + helpCommand.id + ">" : "/help"));
			helpEmbed.setThumbnail(this.client.user!.displayAvatarURL());

			const inviteButton: ButtonBuilder = this.client.createButton(null, "Einladen", "Link", null, false, this.client.createInvite());
			const buttonRow: any = this.client.createMessageComponentsRow(inviteButton);

			return message.reply({ embeds: [helpEmbed], components: [buttonRow] });
		} else if (message.content) {
			/* split message into parts */
			const splittedMessage: string[] = message.content.split(" ");

			/* remove bot mention */
			splittedMessage.shift();

			/* seperate command from arguments */
			const command: any = splittedMessage.shift();

			/* define arguments */
			const args: string[] = splittedMessage;

			/* only execute if command is a staff or owner command */
			const clientCommand: any = this.client.commands.get(command);
			if (!clientCommand || !clientCommand.conf.staffOnly && !clientCommand.conf.ownerOnly) return;

			/* check if user is staff or owner */
			if (!data.user.staff.state && !this.client.config.general["OWNER_IDS"].includes(message.author.id)) return;
			if (clientCommand.help.category === "owner" && data.user.staff.role !== "head-staff" && !this.client.config.general["OWNER_IDS"].includes(message.author.id)) return;

			/* execute command */
			try {
				clientCommand.dispatch(message, args, data);
			} catch (e: any) {
				return this.client.alertException(e, message.guild, message.member, "<ClientMessageCommand>.dispatch(<message>, <args>, <data>)");
			}
		}

		/* Autodelete */
		if (data.guild.settings.autodelete && data.guild.settings.autodelete.length > 0) {
			for (const autodelete of data.guild.settings.autodelete) {
				const channelId: any = autodelete.channel;
				const time: any = autodelete.time;
				if ((channelId !== message.channel.id && message.channel.type !== 11) || (message.channel.type === 11 && (message.channel.parentId !== channelId && message.channel.id !== channelId))) continue;

				this.client.wait(Number(time)).then((): void =>
				{
					if (!message.pinned) {
						message.delete().catch((e: any): void =>
						{
							const errorText: string =
								this.client.emotes.channel + " Channel: " + message.channel + "\n" +
								this.client.emotes.reminder + " Löschen nach: " + ms(Number(time));

							const errorEmbed: EmbedBuilder = this.client.createEmbed(errorText, null, "error");
							errorEmbed.setTitle(this.client.emotes.error + " Löschen von Nachricht durch Autodelete fehlgeschlagen");

							guild.logAction(errorEmbed, "guild");
						});
					}
				}).catch((e: any): void =>
				{

				});
			}
		}

		/* Autoreact */
		if (data.guild.settings.autoreact && data.guild.settings.autoreact.length > 0) {
			for (const autoreact of data.guild.settings.autoreact) {
				const channelId = autoreact.channel;
				const emoji = autoreact.emoji;
				if ((channelId !== message.channel.id && message.channel.type !== 11) || (message.channel.type === 11 && (message.channel.parentId !== channelId && message.channel.id !== channelId))) continue;
				message.react(emoji).catch((e: any): void =>
				{
					const errorText: string =
						this.client.emotes.channel + " Channel: " + message.channel + "\n" +
						this.client.emotes.reminder + " Emoji: " + emoji;

					const errorEmbed: EmbedBuilder = this.client.createEmbed(errorText, null, "error");
					errorEmbed.setTitle(this.client.emotes.error + " Reagieren auf Nachricht durch Autoreact fehlgeschlagen");

					guild.logAction(errorEmbed, "guild");
				});
			}
		}

		/* Leveling */
		if (message.author.bot) return;

		if (data.guild.settings.levels.enabled) {
			/* get xp amount */
			const minXp = data.guild.settings.levels.xp.min || 1;
			const maxXp = data.guild.settings.levels.xp.max || 30;

			let xp: number = this.client.utils.getRandomInt(minXp, maxXp);

			/* excluded roles and channels */
			if (data.guild.settings.levels.exclude) {
				for (let excludedRoleId of data.guild.settings.levels.exclude.roles) {
					if (message.member.roles.cache.get(excludedRoleId)) return;
				}
				for (let excludedChannelId of data.guild.settings.levels.exclude.channels) {
					if (message.channel.id === excludedChannelId) return;
				}
			}


			/* double xp roles */
			if (data.guild.settings.levels.doubleXP && data.guild.settings.levels.doubleXP.length > 0) {
				for (let doubleXP of data.guild.settings.levels.doubleXP) {
					if (message.member.roles.cache.get(doubleXP)) {
						xp = xp * 2;
					}
				}
			}

			// check if user leveled up
			if (!this.timeouts.has(message.author.id)) {
				const hasLeveledUp: boolean = await Levels.appendXp(message.author.id, message.guild.id, xp);
				const levelUser: any = await Levels.fetch(message.author.id, message.guild.id, true);

				if (hasLeveledUp) {
					const newLevel: number = Number(levelUser.level);
					/* Level roles */
					if (data.guild.settings.levels.roles && data.guild.settings.levels.roles.length > 0) {
						for (let levelRole of data.guild.settings.levels.roles) {
							const roleId: any = levelRole.role;
							const level: any = levelRole.level;
							if (Number(level) === newLevel || Number(level) < newLevel) {
								message.member.roles.add(roleId).catch((e: any): void =>
								{
									const errorText: string =
										this.client.emotes.strike + " Level: " + level + "\n" +
										this.client.emotes.ping + " Rolle: <@&" + roleId + ">";

									const errorEmbed: EmbedBuilder = this.client.createEmbed(errorText, null, "error");
									errorEmbed.setTitle(this.client.emotes.error + " Vergeben von Levelrolle fehlgeschlagen");

									guild.logAction(errorEmbed, "guild");
								});
							}
						}
					}

					/* send level up message */
					function parseMessage(str: string): string
					{
						return str
							.replaceAll(/{level}/g, String(newLevel))
							.replaceAll(/{user}/g, message.author)
							.replaceAll(/{user:username}/g, message.author.username)
							// bis discord.js es supported, undefined
							.replaceAll(/{user:displayname}/g, "undefined")
							.replaceAll(/{user:id}/g, message.author.id)
							.replaceAll(/{server:name}/g, message.guild.name)
							.replaceAll(/{server:id}/g, message.guild.id)
							.replaceAll(/{server:membercount}/g, message.guild.memberCount)
					}

					const parsedMessage: string = parseMessage(data.guild.settings.levels.message);

					const channel: any = message.guild.channels.cache.get(data.guild.settings.levels.channel) || message.channel;
					if (!channel) return;

					channel.send({ content: parsedMessage }).catch((e: any): void =>
					{
						const errorText: string =
							this.client.emotes.channel + " Channel: " + channel;

						const errorEmbed: EmbedBuilder = this.client.createEmbed(errorText, null, "error");
						errorEmbed.setTitle(this.client.emotes.error + " Senden von Level-Up-Nachricht fehlgeschlagen");

						guild.logAction(errorEmbed, "guild")
					});

				}
				this.timeouts.add(message.author.id);
				setTimeout((): void => this.timeouts.delete(message.author.id), 15000);
			}
		}
	}
}