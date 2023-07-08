import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder, ButtonBuilder } from "discord.js";

export default class DeletedataCommand extends BaseCommand
{
	constructor(client: BaseClient)
	{
		super(client, {
			name: "deletedata",
			description: "Löscht deine Daten aus unserer Datenbank",
			cooldown: 5000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) => option
						.setName("daten")
						.setDescription("Wähle, welche Daten wir löschen sollen")
						.setRequired(true)
						.addChoices(
							{
								name: "deine Nutzerdaten auf allen Servern",
								value: "user",
							},
							{
								name: "deine Mitgliedsdaten auf diesem Server",
								value: "member",
							},
							{
								name: "Daten dieses Servers",
								value: "guild",
							}
						)
					)
					.addStringOption((option: any) => option
						.setName("grund")
						.setDescription("Teile uns gerne deinen Grund mit, damit wir uns verbessern können")
						.setRequired(false)
					)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void>
	{
		this.interaction = interaction;
		await this.deleteData(interaction.member, interaction.options.getString("daten"), interaction.options.getString("grund"), data);
	}

	private async deleteData(member: any, type: any, reason: any, data: any): Promise<any>
	{
		if (type === "guild" && (await this.interaction.guild.fetchOwner()).user.id !== this.interaction.user.id) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed("Nur der Eigentümer dieses Servers kann die Serverdaten löschen", "error", "error");
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		const typeAffects: any = {
			"user": [
				"AFK-Daten",
				"Partner-Daten",
				"Bug-Hunter-Daten"
			],
			"member": [
				"Abstimmungs-Daten",
				"eingestellte Erinnerungen",
				"dein Level"
			],
			"guild": [
				"Log-Channel",
				"Join2Create",
				"Ideen-Channel",
				"alle Level-Einstellungen",
				"Willkommensnachricht",
				"Verabschiedungsnachricht",
				"Mute-Rolle",
				"Autodelete",
				"Autoreact",
				"Reactionroles",
				"AI-gestützte Chatmoderation",
				"AI-Chat"
			]
		}

		const types: any = {
			"user": "deine Nutzerdaten auf allen Servern",
			"member": "deine Mitgliedsdaten auf diesem Server",
			"guild": "die Daten dieses Servers"

		}

		const confirmationEmbed: EmbedBuilder = this.client.createEmbed("Bist du dir sicher, dass du **{0}** löschen möchtest? Folgende Daten sind davon betroffen:\n\n**{1}**", "warning", "warning", types[type], this.client.emotes.arrow + " " + typeAffects[type].join("\n" + this.client.emotes.arrow + " "));
		const buttonYes: ButtonBuilder = this.client.createButton("yes", "Ja", "Success", "success");
		const buttonNo: ButtonBuilder = this.client.createButton("no", "Nein", "Danger", "error");
		const buttonRow: any = this.client.createMessageComponentsRow(buttonYes, buttonNo);
		const confirmationMessage: any = await this.interaction.followUp({ embeds: [confirmationEmbed], fetchReply: true, components: [buttonRow] });

		const filter: any = (button: any): boolean => button.user.id === this.interaction.user.id;
		const collector: any = confirmationMessage.createMessageComponentCollector({ filter });

		collector.on("collect", async (button: any): Promise<any> =>
		{
			if (button.customId === "no") {
				const cancelEmbed: EmbedBuilder = this.client.createEmbed("Die Daten wurden **nicht** gelöscht.", "error", "error");
				await button.update({ embeds: [cancelEmbed], components: [] });
				return collector.stop();
			}

			if (type === "user") {
				const blockedOld = data.user.blocked;
				await this.client.deleteUser(this.interaction.user.id);
				// block user again, if he was blocked before
				if (blockedOld.state) {
					const newUserdata = await this.client.findOrCreateUser(this.interaction.user.id);
					newUserdata.blocked = blockedOld;
					newUserdata.markModified("blocked");
					await newUserdata.save();
				}
				const successEmbed: EmbedBuilder = this.client.createEmbed("Deine Nutzerdaten wurden erfolgreich gelöscht.", "success", "success");
				await button.update({ embeds: [successEmbed], components: [] });
				await collector.stop();
				return this.client.alert(this.interaction.user.tag + " hat seine Nutzerdaten gelöscht" + (reason ? " mit dem Grund: " + reason : "") + ".", "warning");
			}
			if (type === "member") {
				const warningsOld = data.member.warnings;
				const bannedOld = data.member.banned;
				const mutedOld = data.member.muted;

				await this.client.deleteMember(this.interaction.user.id, this.interaction.guild.id);
				// ban/mute/warn user again, if he was banned/muted/warned before
				if (bannedOld.state || mutedOld.state || warningsOld.length > 0) {
					const newMemberdata: any = await this.client.findOrCreateMember(this.interaction.user.id, this.interaction.guild.id);
					newMemberdata.banned = bannedOld;
					newMemberdata.muted = mutedOld;
					newMemberdata.warnings = warningsOld;
					newMemberdata.markModified("banned");
					newMemberdata.markModified("muted");
					newMemberdata.markModified("warnings");
					await newMemberdata.save();
				}

				const successEmbed: EmbedBuilder = this.client.createEmbed("Deine Mitgliedsdaten wurden erfolgreich gelöscht.", "success", "success");
				await button.update({ embeds: [successEmbed], components: [] });
				await collector.stop();
				return this.client.alert(this.interaction.user.tag + " hat seine Mitgliedsdaten auf " + this.interaction.guild.name + " gelöscht" + (reason ? " mit dem Grund: " + reason : ""), "warning");
			}
			if (type === "guild") {
				const blockedOld: any = data.guild.blocked;

				await this.client.deleteGuild(this.interaction.guild.id);

				// block guild again, if it was blocked before
				if (blockedOld.state) {
					const newGuilddata: any = await this.client.findOrCreateGuild(this.interaction.guild.id);
					newGuilddata.blocked = blockedOld;
					newGuilddata.markModified("blocked");
					await newGuilddata.save();
				}

				const successEmbed: EmbedBuilder = this.client.createEmbed("Die Serverdaten wurden erfolgreich gelöscht.", "success", "success");
				await button.update({ embeds: [successEmbed], components: [] });
				await collector.stop();
				return this.client.alert(this.interaction.user.tag + " hat die Serverdaten von " + this.interaction.guild.name + " gelöscht" + (reason ? " mit dem Grund: " + reason : ""), "warning");
			}
		});
	}
}