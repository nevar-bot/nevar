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
			description: "Zeigt allgemeine Statistiken über den Bot an",
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
		await this.sendStats();
	}

	private async sendStats(): Promise<void> {
		const staffsdata: any = await (await mongoose.connection.db.collection("users")).find({ "staff.state": true }).toArray();
		const head_staffs: any[] = [];
		const staffs: any[] = [];

		for (let ownerId of this.client.config.general["OWNER_IDS"]) {
			const headStaff: any = await this.client.users.fetch(ownerId).catch((): void => {});
			head_staffs.push("**" + headStaff.displayName + "** (@" + headStaff.username + ")");
		}

		for (let userdata of staffsdata) {
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

		//const uptime: any = this.client.utils.getRelativeTime(Date.now() - (this.client.uptime as number));
		const uptime: string = this.client.utils.getDiscordTimestamp(Date.now() - (this.client.uptime as number), "R");
		const serverCount: number = this.client.guilds.cache.size;
		const voteCount = JSON.parse(fs.readFileSync("./assets/votes.json").toString())[moment().format("MMMM").toLowerCase()] || 0;
		const userCount: number = this.client.guilds.cache.reduce((sum: number, guild: any) => sum + (guild.available ? guild.memberCount : 0), 0);
		const channelCount: number = this.client.channels.cache.size;
		const commandCount: number = this.client.commands.filter((cmd) => !cmd.conf.ownerOnly && !cmd.conf.staffOnly).size;
		const executedCommands: number = (await (await mongoose.connection.db.collection("logs").find({})).toArray()).length;
		const packageJson: any = require("@root/package.json");
		const botVersion: any = packageJson.version;
		const nodeVer: string = process.version.replace("v", "");
		const djsV: string = require("discord.js").version;
		const date: Date = new Date(Date.now());
		let month: string = date.toLocaleString("de-DE", { month: "long" });
		month = month.charAt(0).toUpperCase() + month.slice(1);

		const text: string =
			"### " +
			this.client.emotes.users +
			" Staffs:\n" +
			this.client.emotes.shine +
			" " +
			head_staffs.join("\n" + this.client.emotes.shine + " ") +
			"\n" +
			this.client.emotes.shine2 +
			" " +
			staffs.join("\n" + this.client.emotes.shine2 + " ") +
			"\n\n" +
			"### " +
			this.client.emotes.rocket +
			" Statistiken:\n" +
			this.client.emotes.discord +
			" Server: **" +
			this.client.format(serverCount) +
			"**\n" +
			this.client.emotes.users +
			" Nutzer/-innen: **" +
			this.client.format(userCount) +
			"**\n" +
			this.client.emotes.channel +
			" Channel: **" +
			this.client.format(channelCount) +
			"**\n\n" +
			this.client.emotes.reminder +
			" Uptime: **" +
			uptime +
			"**\n" +
			this.client.emotes.shine +
			" Votes im " +
			month +
			": **" +
			this.client.format(voteCount) +
			"**\n\n" +
			this.client.emotes.slashcommand +
			" Befehle: **" +
			commandCount +
			"**\n" +
			this.client.emotes.loading +
			" Befehle ausgeführt: **" +
			this.client.format(executedCommands) +
			"**\n\n" +
			"### " +
			this.client.emotes.label +
			" Versionen:\n" +
			this.client.emotes.code +
			" Bot-Version: **" +
			botVersion +
			"**\n" +
			this.client.emotes.discordjs +
			" Discord.js-Version: **" +
			djsV +
			"**\n" +
			this.client.emotes.javascript +
			" NodeJS-Version: **" +
			nodeVer +
			"**";

		const statsEmbed: EmbedBuilder = this.client.createEmbed(text, null, "normal");
		statsEmbed.setThumbnail(this.client.user!.displayAvatarURL());
		statsEmbed.setTitle("Statistiken zu " + this.client.user!.username);

		return this.interaction.followUp({ embeds: [statsEmbed] });
	}
}
