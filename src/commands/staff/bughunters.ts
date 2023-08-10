import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";
import mongoose from "mongoose";

export default class BughuntersCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "bughunters",
			description: "Verwaltet die Bughunter des Bots",
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
				await this.addBughunter(args);
				break;
			case "remove":
				args.shift();
				await this.removeBughunter(args);
				break;
			case "list":
				await this.listBughunters();
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

	private async addBughunter(args: any[]): Promise<void> {
		const member: any = await this.message.guild.resolveMember(args[0]);
		if (!member) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Du musst ein Mitglied angeben.", "error", "error");
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		const userdata: any = await this.client.findOrCreateUser(member.user.id);
		userdata.bughunter = {
			state: true
		};
		userdata.markModified("bughunter");
		await userdata.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			"{0} wurde als Bug-Hunter hinzugefügt.",
			"success",
			"success",
			member.user.username
		);
		return this.message.reply({ embeds: [successEmbed] });
	}

	private async removeBughunter(args: any[]): Promise<void> {
		const member: any = await this.message.guild.resolveMember(args[0]);
		if (!member) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Du musst ein Mitglied angeben.", "error", "error");
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		const userdata: any = await this.client.findOrCreateUser(member.user.id);
		if (!userdata.bughunter.state) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Dieses Mitglied ist kein Bug-Hunter.", "error", "error");
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		userdata.bughunter = {
			state: false
		};
		userdata.markModified("bughunter");
		await userdata.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed("{0} wurde als Bughunter entfernt.", "success", "success", member.user.username);
		return this.message.reply({ embeds: [successEmbed] });
	}

	private async listBughunters(): Promise<void> {
		const bughuntersdata: any = await (await mongoose.connection.db.collection("users")).find({ "bughunter.state": true }).toArray();
		let bughunters: any[] = [];
		for (let userdata of bughuntersdata) {
			const user: any = await this.client.users.fetch(userdata.id).catch(() => {});
			bughunters.push(user.username);
		}
		if (bughunters.length === 0) bughunters = ["Keine Bug-Hunter vorhanden"];

		const embed: EmbedBuilder = this.client.createEmbed(
			"Folgend sind alle Bughunter aufgelistet:\n\n{0} {1}",
			"arrow",
			"normal",
			this.client.emotes.shine2,
			bughunters.join("\n" + this.client.emotes.shine2 + " ")
		);

		return this.message.reply({ embeds: [embed] });
	}
}
