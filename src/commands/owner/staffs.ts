import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";
import mongoose from "mongoose";

export default class StaffsCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "staffs",
			description: "Verwaltet die Staffs des Bots",
			ownerOnly: true,
			dirname: __dirname,
			slashCommand: {
				addCommand: false,
				data: null
			}
		});
	}

	private message: any;

	public async dispatch(message: any, args: any[], data: any): Promise<void> {
		this.message = message;
		if (!args[0]) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				"Du musst zwischen folgenden Aktionen wählen: add, remove, list",
				"error",
				"error"
			);
			return message.reply({ embeds: [invalidOptionsEmbed] });
		}
		switch (args[0]) {
			case "add":
				args.shift();
				await this.addStaff(args);
				break;
			case "remove":
				args.shift();
				await this.removeStaff(args);
				break;
			case "list":
				await this.listStaffs();
				break;
			default:
				const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
					"Du musst zwischen folgenden Aktionen wählen: add, remove, list",
					"error",
					"error"
				);
				return message.reply({ embeds: [invalidOptionsEmbed] });
		}
	}

	private async addStaff(args: any[]): Promise<void> {
		const member: any = await this.message.guild.resolveMember(args[0]);
		if (!member) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				"Du musst ein Mitglied angeben.",
				"error",
				"error"
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}
		if (!args[1]) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				"Du musst einen Staff-Typ angeben.",
				"error",
				"error"
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}
		if (!["head-staff", "staff"].includes(args[1].toLowerCase())) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				'Du musst entweder "staff" oder "head-staff" als Staff-Typ angeben.',
				"error",
				"error"
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		const userdata: any = await this.client.findOrCreateUser(member.user.id);
		userdata.staff = {
			state: true,
			role: args[1].toLowerCase()
		};
		userdata.markModified("staff");
		await userdata.save();

		const string: string = args[1].toLowerCase() === "head-staff" ? "Head-Staff" : "Staff";
		const successEmbed: EmbedBuilder = this.client.createEmbed(
			"{0} wurde als {1} hinzugefügt.",
			"success",
			"success",
			member.user.username,
			string
		);
		return this.message.reply({ embeds: [successEmbed] });
	}

	private async removeStaff(args: any[]): Promise<void> {
		const member = await this.message.guild.resolveMember(args[0]);
		if (!member) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				"Du musst ein Mitglied angeben.",
				"error",
				"error"
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		const userdata: any = await this.client.findOrCreateUser(member.user.id);
		if (!userdata.staff.state) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				"Dieses Mitglied ist kein Staff.",
				"error",
				"error"
			);
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		userdata.staff = {
			state: false,
			role: null
		};
		userdata.markModified("staff");
		await userdata.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			"{0} wurde als Staff entfernt.",
			"success",
			"success",
			member.user.username
		);
		return this.message.reply({ embeds: [successEmbed] });
	}

	private async listStaffs(): Promise<void> {
		const staffsdata: any = await (await mongoose.connection.db.collection("users"))
			.find({ "staff.state": true })
			.toArray();
		let staffs: any[] = [];
		for (const userdata of staffsdata) {
			const user: any = await this.client.users.fetch(userdata.id).catch(() => {});
			const role: string = userdata.staff.role === "head-staff" ? "Head-Staff" : "Staff";
			staffs.push(user.username + " (" + role + ")");
		}
		if (staffs.length === 0) staffs = ["Keine Staffs vorhanden"];

		const embed: EmbedBuilder = this.client.createEmbed(
			"Folgend sind alle Bot-Staffs aufgelistet:\n\n{0} {1}",
			"arrow",
			"normal",
			this.client.emotes.shine2,
			staffs.join("\n" + this.client.emotes.shine2 + " ")
		);

		return this.message.reply({ embeds: [embed] });
	}
}
