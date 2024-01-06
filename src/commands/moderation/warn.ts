import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default class WarnCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "warn",
			description: "Verwarnt ein Mitglied",
			memberPermissions: ["KickMembers"],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addUserOption((option: any) =>
						option
							.setName("mitglied")
							.setDescription("Wähle ein Mitglied, welches du verwarnen möchtest")
							.setRequired(true),
					)
					.addStringOption((option: any) =>
						option.setName("grund").setDescription("Gib ggf. einen Grund an").setRequired(false),
					),
			},
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		await this.warnMember(interaction.options.getUser("mitglied"), interaction.options.getString("grund"));
	}

	private async warnMember(user: any, reason: string): Promise<void> {
		if (!reason) reason = "Kein Grund angegeben";
		const member = await this.interaction.guild.resolveMember(user.id);
		if (!member) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				"Du musst ein Mitglied angeben.",
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}
		if (member.user.id === this.client.user!.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				"Ich kann mich nicht selber verwarnen.",
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}
		if (member.user.id === this.client.user!.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				"Du kannst dich nicht selber verwarnen.",
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}
		if (member.roles.highest.position >= this.interaction.member.roles.highest.position) {
			const higherRoleEmbed: EmbedBuilder = this.client.createEmbed(
				"Du kannst keine Mitglieder verwarnen, die eine höhere Rolle haben als du.",
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [higherRoleEmbed] });
		}

		const victimData: any = await this.client.findOrCreateMember(member.user.id, this.interaction.guild.id);

		victimData.warnings.count++;
		victimData.warnings.list.push({
			date: Date.now(),
			moderator: this.interaction.member.user.username,
			reason: reason,
		});
		victimData.markModified("warnings");
		await victimData.save();

		const privateText: string =
			"### " +
			this.client.emotes.ban +
			" Du wurdest auf " +
			this.interaction.guild.name +
			" verwarnt.\n\n" +
			this.client.emotes.arrow +
			" Moderator: " +
			this.interaction.member.user.username +
			"\n" +
			this.client.emotes.arrow +
			" Begründung: " +
			reason;
		const privateEmbed: EmbedBuilder = this.client.createEmbed(privateText, "ban", "warning");
		await member.user.send({ embeds: [privateEmbed] }).catch((): void => {});

		const logText: string =
			"### " +
			this.client.emotes.ban +
			" " +
			member.user.username +
			" wurde verwarnt\n\n" +
			this.client.emotes.user +
			" Moderator: " +
			this.interaction.user.username +
			"\n" +
			this.client.emotes.text +
			" Begründung: " +
			reason;
		const logEmbed: EmbedBuilder = this.client.createEmbed(logText, null, "normal");
		logEmbed.setThumbnail(member.user.displayAvatarURL());
		await this.interaction.guild.logAction(logEmbed, "moderation");

		const publicText: string =
			"### " +
			this.client.emotes.ban +
			" " +
			member.user.username +
			" wurde verwarnt.\n\n" +
			this.client.emotes.arrow +
			" Moderator: " +
			this.interaction.member.user.username +
			"\n" +
			this.client.emotes.arrow +
			" Begründung: " +
			reason;
		const publicEmbed: EmbedBuilder = this.client.createEmbed(publicText, null, "success");
		return this.interaction.followUp({ embeds: [publicEmbed] });
	}
}
