import BaseCommand from "@structures/BaseCommand.js";
import BaseClient from "@structures/BaseClient.js";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import path from "path";

export default class UnbanCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "unban",
			description: "Unbans a member",
			localizedDescriptions: {
				de: "Entbannt ein Mitglied",
			},
			memberPermissions: ["BanMembers"],
			cooldown: 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addStringOption((option: any) =>
					option
						.setName("user")
						.setNameLocalization("de", "nutzer")
						.setDescription("Enter the ID or name of the user")
						.setDescriptionLocalization("de", "Gib hier die ID oder den Namen des Nutzers an")
						.setRequired(true),
				),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
		await this.unban(interaction.options.getString("user"));
	}

	private async unban(user: any): Promise<any> {
		user = await this.client.resolveUser(user);
		if (!user || !user.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:userIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		const guildBans: any = await this.interaction.guild!.bans.fetch().catch((): void => {});
		if (!guildBans.some((u: any): boolean => u.user.id === user.id)) {
			const isNotBannedEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:userIsNotBanned", { user: user.username }),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [isNotBannedEmbed] });
		}

		try {
			await this.interaction.guild!.members.unban(user.id);
			const memberData = await this.client.findOrCreateMember(user.id, this.interaction.guild!.id);
			memberData.banned = {
				state: false,
				reason: null,
				moderator: {
					name: null,
					id: null,
				},
				duration: null,
				bannedAt: null,
				bannedUntil: null,
			};
			memberData.markModified("banned");
			await memberData.save();
			this.client.databaseCache.bannedUsers.delete(memberData.id + memberData.guildID);

			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("unbannedUser", { user: user.username }),
				"success",
				"success"
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		} catch (e) {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:unbanFailed", { user: user.username }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}
}
