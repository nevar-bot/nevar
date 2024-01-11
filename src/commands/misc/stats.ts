import BaseClient from "@structures/BaseClient";
import BaseCommand from "@structures/BaseCommand";
import moment from "moment";
import fs from "fs";
import mongoose from "mongoose";
import { SlashCommandBuilder, EmbedBuilder } from "@discordjs/builders";

export default class StatsCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "stats",
			description: "Displays general statistics about the bot",
			localizedDescriptions: {
				de: "Zeigt allgemeine Statistiken über den Bot an",
			},
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder(),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.sendStats();
	}

	private async sendStats(): Promise<any> {
		const staffData: any = await (await mongoose.connection.db.collection("users"))
			.find({ "staff.state": true })
			.toArray();
		const head_staffs: any[] = [];
		const staffs: any[] = [];

		for (const ownerId of this.client.config.general["OWNER_IDS"]) {
			const headStaff: any = await this.client.users.fetch(ownerId).catch((): void => {});
			head_staffs.push("**" + headStaff.displayName + "** (@" + headStaff.username + ")");
		}

		for (const userdata of staffData) {
			const user: any = await this.client.users.fetch(userdata.id).catch(() => {});
			if (userdata.staff.role === "head-staff") {
				if (!head_staffs.includes("**" + user.displayName + "** (@" + user.username + ")"))
					head_staffs.push("**" + user.displayName + "** (@" + user.username + ")");
			} else if (userdata.staff.role === "staff") {
				if (
					!head_staffs.includes("**" + user.displayName + "** (@" + user.username + ")") &&
					!staffs.includes("**" + user.displayName + "** (@" + user.username + ")")
				)
					staffs.push("**" + user.displayName + "** (@" + user.username + ")");
			}
		}

		const uptime: string = this.client.utils.getDiscordTimestamp(Date.now() - (this.client.uptime as number), "R");
		const serverCount: number = this.client.guilds.cache.size;
		const voteCount =
			JSON.parse(fs.readFileSync("./assets/votes.json").toString())[moment().format("MMMM").toLowerCase()] || 0;
		const userCount: number = this.client.guilds.cache.reduce(
			(sum: number, guild: any) => sum + (guild.available ? guild.memberCount : 0),
			0,
		);
		const channelCount: number = this.client.channels.cache.size;
		const commandCount: number = this.client.commands.filter(
			(cmd) => !cmd.conf.ownerOnly && !cmd.conf.staffOnly,
		).size;
		const executedCommands: number = (await (await mongoose.connection.db.collection("logs").find({})).toArray())
			.length;

		const executedCommandsThisYear: number = (await (await mongoose.connection.db.collection("logs").find({})).toArray()).filter((log: any) => {
			return moment(log.date).format("YYYY") === moment().format("YYYY")
		}).length;

		const executedCommandsThisMonth: number = (await (await mongoose.connection.db.collection("logs").find({})).toArray()).filter((log: any) => {
			return moment(log.date).format("MMMM") === moment().format("MMMM")
		}).length;

		const executedCommandsThisWeek: number = (await (await mongoose.connection.db.collection("logs").find({})).toArray()).filter((log: any) => {
			return moment(log.date).format("WW") === moment().format("WW") && moment(log.date).format("MMMM") === moment().format("MMMM")
		}).length;

		const executedCommandsToday: number = (await (await mongoose.connection.db.collection("logs").find({})).toArray()).filter((log: any) => {
			return moment(log.date).format("DD") === moment().format("DD") && moment(log.date).format("MMMM") === moment().format("MMMM")
		}).length;


		const packageJson: any = require("../../../package.json");
		const botVersion: any = packageJson.version;
		const nodeVer: string = process.version.replace("v", "");
		const djsV: string = require("discord.js").version;
		const tsV: string = require("typescript").version;
		const date: Date = new Date(Date.now());



		const text: string =
			"### " +
			this.client.emotes.flags.Staff + " " +
			this.translate("staffs") + "\n" +
			this.client.emotes.verified_server +
			" " +
			head_staffs.join("\n" + this.client.emotes.verified_server + " ") +
			"\n" +
			this.client.emotes.verified_server +
			" " +
			staffs.join("\n" + this.client.emotes.verified_server + " ") +
			"\n\n" +
			"### " +
			this.client.emotes.logo.icon + " " +
			this.translate("statistics") + "\n" +
			this.client.emotes.discord + " " +
			this.translate("servers") + ": **" +
			this.client.format(serverCount) +
			"**\n" +
			this.client.emotes.users + " " +
			this.translate("users") + ": ** " +
			this.client.format(userCount) +
			"**\n" +
			this.client.emotes.channel + " " +
			this.translate("channels") + ": **" +
			this.client.format(channelCount) +
			"**\n" +
			this.client.emotes.reminder + " " +
			this.translate("uptime") + ": **" +
			uptime +
			"**\n" +
			this.client.emotes.latency.good + " " +
			this.translate("ping") + ": **" +
			this.client.ws.ping + "ms" +
			"**\n" +
			this.client.emotes.topgg + " " +
			this.translate("votes") + ": **" +
			this.client.format(voteCount) +
			"**\n\n" +
			"### " +
			this.client.emotes.slashcommand + " " +
			this.translate("commands") + "\n" +
			this.client.emotes.magic + " " +
			this.translate("commandsAvailable") + ": **" +
			commandCount +
			"**\n" +
			this.client.emotes.growth_up + " " +
			this.translate("commandsExecuted") + ": **" +
			this.client.format(executedCommands) +
			"**\n" +
			this.client.emotes.calendar + " " +
			this.translate("commandsExecutedThisYear") + ": **" +
			this.client.format(executedCommandsThisYear) +
			"**\n" +
			this.client.emotes.calendar + " " +
			this.translate("commandsExecutedThisMonth") + ": **" +
			this.client.format(executedCommandsThisMonth) +
			"**\n" +
			this.client.emotes.calendar + " " +
			this.translate("commandsExecutedThisWeek") + ": **" +
			this.client.format(executedCommandsThisWeek) +
			"**\n" +
			this.client.emotes.calendar + " " +
			this.translate("commandsExecutedToday") + ": **" +
			this.client.format(executedCommandsToday) +
			"**\n\n" +
			"### " +
			this.client.emotes.code + " " +
			this.translate("versions") + "\n" +
			this.client.emotes.logo.icon + " " +
			this.client.user!.username + ": **" +
			botVersion +
			"**\n" +
			this.client.emotes.discordjs + " " +
			"Discord.js: **" +
			djsV +
			"**\n" +
			this.client.emotes.javascript + " " +
			"NodeJS: **" +
			nodeVer +
			"**\n" +
			this.client.emotes.typescript + " " +
			"TypeScript: **" +
			tsV +
			"**";

		const statsEmbed: EmbedBuilder = this.client.createEmbed(text, null, "normal");
		statsEmbed.setThumbnail(this.client.user!.displayAvatarURL());
		statsEmbed.setTitle("Statistiken zu " + this.client.user!.username);

		return this.interaction.followUp({ embeds: [statsEmbed] });
	}
}
