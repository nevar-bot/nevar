import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default class UnbanCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "unban",
			description: "Entbannt ein Mitglied",
			memberPermissions: ["BanMembers"],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addStringOption((option: any) =>
					option
						.setName("nutzer")
						.setDescription("Gib hier die ID des/r Nutzers/-in an")
						.setRequired(true)
				)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		await this.unban(interaction.options.getString("nutzer"));
	}

	private async unban(user: any): Promise<void> {
		user = await this.client.resolveUser(user);
		if (!user || !user.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				"Du musst eine ID angeben.",
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		const guildBans: any = await this.interaction.guild.bans.fetch();
		if (!guildBans.some((u: any): boolean => u.user.id === user.id)) {
			const isNotBannedEmbed: EmbedBuilder = this.client.createEmbed(
				"{0} ist nicht gebannt.",
				"error",
				"error",
				user.username
			);
			return this.interaction.followUp({ embeds: [isNotBannedEmbed] });
		}

		try {
			await this.interaction.guild.members.unban(user.id);
			const memberData = await this.client.findOrCreateMember(
				user.id,
				this.interaction.guild.id
			);
			memberData.banned = {
				state: false,
				reason: null,
				moderator: {
					name: null,
					id: null
				},
				duration: null,
				bannedAt: null,
				bannedUntil: null
			};
			memberData.markModified("banned");
			await memberData.save();
			this.client.databaseCache.bannedUsers.delete(memberData.id + memberData.guildID);

			const successEmbed: EmbedBuilder = this.client.createEmbed(
				"{0} wurde entbannt.",
				"success",
				"success",
				user.username
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} catch (e) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				"Ich konnte {0} nicht entbannen.",
				"error",
				"error",
				user.username
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}
}
