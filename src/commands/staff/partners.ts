import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";
const mongoose = require("mongoose");

export default class PartnersCommand extends BaseCommand
{
	public constructor(client: BaseClient)
	{
		super(client, {
			name: "partners",
			description: "Verwaltet die Partner des Bots",
			ownerOnly: true,
			dirname: __dirname,
			slashCommand: {
				addCommand: false,
				data: null
			}
		});
	}

	private message: any;

	public async dispatch(message: any, args: any[], data: any): Promise<void>
	{
		this.message = message;
		if (!args[0]) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Du musst zwischen folgenden Aktionen wählen: add, remove, list", "error", "error");
			return message.reply({ embeds: [invalidOptionsEmbed] });
		}
		switch (args[0]) {
			case "add":
				args.shift();
				await this.addPartner(args);
				break;
			case "remove":
				args.shift();
				await this.removePartner(args);
				break;
			case "list":
				await this.listPartners();
				break;
			default:
				const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Du musst zwischen folgenden Aktionen wählen: add, remove, list", "error", "error");
				return message.reply({ embeds: [invalidOptionsEmbed] });
		}
	}

	private async addPartner(args: any[]): Promise<void>
	{
		const member: any = await this.message.guild.resolveMember(args[0]);
		if (!member) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Du musst ein Mitglied angeben.", "error", "error");
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		const userdata: any = await this.client.findOrCreateUser(member.user.id);
		userdata.partner = {
			state: true,
		}
		userdata.markModified("partner");
		await userdata.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed("{0} wurde als Partner hinzugefügt.", "success", "success", member.user.tag);
		return this.message.reply({ embeds: [successEmbed] });
	}

	private async removePartner(args: any[]): Promise<void>
	{
		const member: any = await this.message.guild.resolveMember(args[0]);
		if (!member) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Du musst ein Mitglied angeben.", "error", "error");
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		const userdata: any = await this.client.findOrCreateUser(member.user.id);
		if (!userdata.partner.state) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Dieses Mitglied ist kein Partner.", "error", "error");
			return this.message.reply({ embeds: [invalidOptionsEmbed] });
		}

		userdata.partner = {
			state: false,
		}
		userdata.markModified("partner");
		await userdata.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed("{0} wurde als Partner entfernt.", "success", "success", member.user.tag);
		return this.message.reply({ embeds: [successEmbed] });
	}

	private async listPartners(): Promise<void>
	{
		const partnersdata: any[] = (await (await mongoose.connection.db.collection("users")).find({ "partner.state": true }).toArray())
		let partners: any[] = [];
		for (let userdata of partnersdata) {
			const user: any = await this.client.users.fetch(userdata.id).catch(() => { });
			partners.push(user.username);
		}
		if (partners.length === 0) partners = ["Keine Partner vorhanden"];

		const embed: EmbedBuilder = this.client.createEmbed("Folgend sind alle Bot-Partner aufgelistet:\n\n{0} {1}", "arrow", "normal", this.client.emotes.shine2, partners.join("\n" + this.client.emotes.shine2 + " "));

		return this.message.reply({ embeds: [embed] });
	}
}