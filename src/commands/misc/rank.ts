import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, AttachmentBuilder } from "discord.js";
import * as canvacord from "canvacord";

export default class RankCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "rank",
			description: "Sends your level card",
			localizedDescriptions: {
				de: "Sendet deine Levelcard"
			},
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addUserOption((option: any) =>
					option
						.setName("member")
						.setNameLocalizations({
							de: "mitglied"
						})
						.setDescription("Select a member whose level card you would like to see")
						.setDescriptionLocalizations({
							de: "Wähle ein Mitglied, dessen Levelcard du sehen möchtest"
						})
						.setRequired(false)
				)
			}
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.showRank(data);
	}

	private async showRank(data: any): Promise<void> {
		if (!data.guild.settings.levels.enabled) {
			return this.interaction.followUp({
				content: this.client.emotes.error + " " + this.translate("errors:isDisabled")
			});
		}

		const user: any = this.interaction.options.getUser("member") || this.interaction.user;

		const userData: any = {
			user: user,
			level: await this.client.levels.fetch(user.id, this.interaction.guild.id, true)
		};

		const rank: any = new canvacord.Rank()
			// Avatar, status, username and displayname
			.setUsername(userData.user.displayName)
			.setDiscriminator(userData.user.username)
			.setAvatar(userData.user.displayAvatarURL({ format: "png", size: 512 }))
			.setStatus("online", false, false)
			.renderEmojis(true)

			// Rank and level
			.setLevel(userData.level.level || 0, this.translate("level"))
			.setLevelColor("#5773c9")
			.setRank(userData.level.position || 100, this.translate("rank"))

			// Progress bar
			.setProgressBar("#5773c9", "COLOR", true)
			.setProgressBarTrack("#ffffff")

			// XP
			.setCurrentXP(userData.level.cleanXp || 0)
			.setRequiredXP(userData.level.cleanNextLevelXp || 0);

		rank.build().then((data: any): void => {
			if (userData.level) {
				const attachment: AttachmentBuilder = new AttachmentBuilder(data, {
					name: "level-" + userData.user.id + ".png"
				});
				return this.interaction.followUp({ files: [attachment] });
			} else {
				return this.interaction.followUp({
					content: this.client.emotes.error + " " + this.translate("errors:noXp")
				});
			}
		});
	}
}
