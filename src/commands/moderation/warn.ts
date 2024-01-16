import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default class WarnCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "warn",
			description: "Warns a member",
			localizedDescriptions: {
				de: "Verwarnt ein Mitglied",
			},
			memberPermissions: ["KickMembers"],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addUserOption((option: any) =>
						option
							.setName("member")
							.setNameLocalizations({
								de: "mitglied",
							})
							.setDescription("Choose a member to warn")
							.setDescriptionLocalizations({
								de: "Wähle ein Mitglied, welches du verwarnen möchtest"
							})
							.setRequired(true),
					)
					.addStringOption((option: any) =>
						option
							.setName("reason")
							.setNameLocalizations({
								de: "grund",
							})
							.setDescription("Give a reason if you want to")
							.setDescriptionLocalizations({
								de: "Gib ggf. einen Grund an"
							})
							.setRequired(false),
					),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.warnMember(interaction.options.getMember("member"), interaction.options.getString("reason"));
	}

	private async warnMember(member: any, reason: string): Promise<any> {
		if (!reason) reason = "Kein Grund angegeben";
		if (!member) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("basics:errors:missingMember", {}, true),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}
		if (member.user.id === this.client.user!.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:cantWarnMe"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}
		if (member.user.id === this.client.user!.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:cantWarnYourself"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}
		if (member.roles.highest.position >= this.interaction.member!.roles.highest.position) {
			const higherRoleEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:cantWarnHigher"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [higherRoleEmbed] });
		}

		const victimData: any = await this.client.findOrCreateMember(member.user.id, this.interaction.guild!.id);

		victimData.warnings.count++;
		victimData.warnings.list.push({
			date: Date.now(),
			moderator: this.interaction.member!.user.username,
			reason: reason,
		});
		victimData.markModified("warnings");
		await victimData.save();

		const privateText: string =
			"### " + this.client.emotes.ban + " " +
			this.translate("privateMessage:title", { guild: this.interaction.guild!.name }) + "\n\n" +
			this.client.emotes.arrow + " " +
			this.translate("moderator") + ": " +
			this.interaction.member!.toString() + "\n" +
			this.client.emotes.arrow + " " +
			this.translate("reason") + ": " + reason;

		const privateEmbed: EmbedBuilder = this.client.createEmbed(privateText, "ban", "warning");
		await member.user.send({ embeds: [privateEmbed] }).catch((): void => {});

		const logText: string =
			"### " + this.client.emotes.ban + " " +
			this.translate("logMessage:title", { user: member.toString() }) + "\n\n" +
			this.client.emotes.user + " " +
			this.translate("moderator") + ": " +
			this.interaction.member!.toString() + "\n" +
			this.client.emotes.text + " " +
			this.translate("reason") + ": " + reason;
		const logEmbed: EmbedBuilder = this.client.createEmbed(logText, null, "normal");
		logEmbed.setThumbnail(member.user.displayAvatarURL());
		await this.interaction.guild!.logAction(logEmbed, "moderation");

		const publicText: string =
			"### " + this.client.emotes.ban + " " +
			this.translate("publicMessage:title", { user: member.toString() }) + "\n\n" +
			this.client.emotes.arrow + " " +
			this.translate("moderator") + ": " +
			this.interaction.member!.toString() + "\n" +
			this.client.emotes.arrow + " " +
			this.translate("reason") + ": " + reason;
		const publicEmbed: EmbedBuilder = this.client.createEmbed(publicText, null, "success");
		return this.interaction.followUp({ embeds: [publicEmbed] });
	}
}
