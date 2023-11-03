import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder, ButtonBuilder } from "discord.js";

export default class DeletedataCommand extends BaseCommand {
	constructor(client: BaseClient) {
		super(client, {
			name: "deletedata",
			description: "Deletes your data from our database",
			localizedDescriptions: {
				de: "Löscht deine Daten aus unserer Datenbank",
			},
			cooldown: 5000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option.setName("data")
							.setDescription("Choose which data we should delete")
							.setDescriptionLocalizations({
								de: "Wähle, welche Daten wir löschen sollen"
							})
							.setRequired(true)
							.addChoices(
							{
								name: "your user data on all servers",
								nameLocalizations: {
									de: "deine Nutzerdaten auf allen Servern"
								},
								value: "user"
							},
							{
								name: "your membership data on this server",
								nameLocalizations: {
									de: "deine Mitgliedsdaten auf diesem Server"
								},
								value: "member"
							},
							{
								name: "data of this server",
								nameLocalizations: {
									de: "Daten dieses Servers"
								},
								value: "guild"
							}
						)
					)
					.addStringOption((option: any) =>
						option.setName("reason")
							.setDescription("Please let us know your reason so that we can improve")
							.setDescriptionLocalizations({
								de: "Teile uns gerne deinen Grund mit, damit wir uns verbessern können"
							})
							.setRequired(false)
					)
			}
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.deleteData(interaction.member, interaction.options.getString("data"), interaction.options.getString("reason"), data);
	}

	private async deleteData(member: any, type: any, reason: any, data: any): Promise<any> {
		if (type === "guild" && (await this.interaction.guild.fetchOwner()).user.id !== this.interaction.user.id) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:ownerOnly"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}

		const typeAffects: any = {
			user: this.translate("affected:user"),
			member: this.translate("affected:member"),
			guild: this.translate("affected:guild")
		};

		const types: any = {
			user: this.translate("typeDescriptions:user"),
			member: this.translate("typeDescriptions:member"),
			guild: this.translate("typeDescriptions:guild")
		};

		const confirmationEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("confirmation", { type: types[type], affected: this.client.emotes.arrow + " " + typeAffects[type].join("\n" + this.client.emotes.arrow + " ") }),
			"warning",
			"warning"
		);
		const buttonYes: ButtonBuilder = this.client.createButton("yes", this.translate("basics:yes", {}, true), "Success", "success");
		const buttonNo: ButtonBuilder = this.client.createButton("no", this.translate("basics:no", {}, true), "Danger", "error");
		const buttonRow: any = this.client.createMessageComponentsRow(buttonYes, buttonNo);
		const confirmationMessage: any = await this.interaction.followUp({
			embeds: [confirmationEmbed],
			fetchReply: true,
			components: [buttonRow]
		});

		const filter: any = (button: any): boolean => button.user.id === this.interaction.user.id;
		const collector: any = confirmationMessage.createMessageComponentCollector({
			filter
		});

		collector.on("collect", async (button: any): Promise<any> => {
			if (button.customId === "no") {
				const cancelEmbed: EmbedBuilder = this.client.createEmbed(this.translate("noConfirmation"), "error", "error");
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
				const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("deleted:user"), "success", "success");
				await button.update({ embeds: [successEmbed], components: [] });
				await collector.stop();
				return this.client.alert(
					this.interaction.user.username + " hat seine Nutzerdaten gelöscht" + (reason ? " mit dem Grund: " + reason : "") + ".",
					"warning"
				);
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

				const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("deleted:member"), "success", "success");
				await button.update({ embeds: [successEmbed], components: [] });
				await collector.stop();
				return this.client.alert(
					this.interaction.user.username +
						" hat seine Mitgliedsdaten auf " +
						this.interaction.guild.name +
						" gelöscht" +
						(reason ? " mit dem Grund: " + reason : ""),
					"warning"
				);
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

				const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("deleted:guild"), "success", "success");
				await button.update({ embeds: [successEmbed], components: [] });
				await collector.stop();
				return this.client.alert(
					this.interaction.user.username +
						" hat die Serverdaten von " +
						this.interaction.guild.name +
						" gelöscht" +
						(reason ? " mit dem Grund: " + reason : ""),
					"warning"
				);
			}
		});
	}
}
