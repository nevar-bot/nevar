import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default class KickCommand extends BaseCommand
{
	public constructor(client: BaseClient)
	{
		super(client, {
			name: "kick",
			description: "Kickt ein Mitglied vom Server",
			memberPermissions: ["KickMembers"],
			botPermissions: ["KickMembers"],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addUserOption((option: any) => option
						.setName("mitglied")
						.setDescription("Wähle ein Mitglied")
						.setRequired(true)
					)
					.addStringOption((option: any) => option
						.setName("grund")
						.setDescription("Gib ggf. einen Grund an")
						.setRequired(false)
					)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void>
	{
		this.interaction = interaction;
		await this.kick(interaction.options.getMember("mitglied"), interaction.options.getString("grund"));
	}

	private async kick(member: any, reason: string): Promise<void>
	{
		if (member.user.id === this.interaction.member.user.id) {
			const cantKickYourselfEmbed: EmbedBuilder = this.client.createEmbed("Du kannst dich nicht selber kicken.", "error", "error");
			return this.interaction.followUp({ embeds: [cantKickYourselfEmbed] });
		}
		if (member.user.id === this.client.user!.id) {
			const cantKickBotEmbed: EmbedBuilder = this.client.createEmbed("Ich kann mich nicht selber kicken.", "error", "error");
			return this.interaction.followUp({ embeds: [cantKickBotEmbed] });
		}
		if (!member.kickable) {
			const cantKickEmbed: EmbedBuilder = this.client.createEmbed("Ich kann {0} nicht kicken.", "error", "error", member.user.tag);
			return this.interaction.followUp({ embeds: [cantKickEmbed] });
		}
		if (member.roles.highest.position >= this.interaction.member.roles.highest.position) {
			const higherRoleEmbed: EmbedBuilder = this.client.createEmbed("Du kannst keine Mitglieder kicken, die eine höhere Rolle haben als du.", "error", "error");
			return this.interaction.followUp({ embeds: [higherRoleEmbed] });
		}
		if (!reason) reason = "Kein Grund angegeben";

		member.kick("Gekickt von " + this.interaction.member.user.tag + " - Grund: " + reason)
			.then(async (): Promise<void> =>
			{
				const privateText: string =
					" Du wurdest von " + this.interaction.guild.name + " gekickt.\n\n" +
					this.client.emotes.arrow + " Grund: " + reason + "\n" +
					this.client.emotes.arrow + " Moderator: " + this.interaction.member.user.tag;
				const privateEmbed: EmbedBuilder = this.client.createEmbed(privateText, "leave", "error");
				await member.send({ embeds: [privateEmbed] }).catch((): void => { });

				const logText: string =
					" **" + member.user.tag + " wurde gekickt**\n\n" +
					this.client.emotes.user + " Moderator: " + this.interaction.member.user.tag + "\n" +
					this.client.emotes.text + " Grund: " + reason;
				await this.interaction.guild.logAction(logText, "moderation", this.client.emotes.events.member.ban, "normal", member.user.displayAvatarURL({ dynamic: true }));

				const publicText: string =
					" " + member.user.tag + " wurde gekickt.\n\n" +
					this.client.emotes.arrow + " Grund: " + reason + "\n" +
					this.client.emotes.arrow + " Moderator: " + this.interaction.member.user.tag;
				const publicEmbed: EmbedBuilder = this.client.createEmbed(publicText, "leave", "error");
				return this.interaction.followUp({ embeds: [publicEmbed] });
			})
			.catch(async (): Promise<void> =>
			{
				const errorEmbed: EmbedBuilder = this.client.createEmbed("Ich konnte {0} nicht kicken.", "error", "error", member.user.tag);
				return this.interaction.followUp({ embeds: [errorEmbed] });
			});
	}
}