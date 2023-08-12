import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, AttachmentBuilder } from "discord.js";
import * as canvacord from "canvacord";

export default class RankCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "rank",
			description: "Sendet deine Levelcard",
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addUserOption((option: any) =>
					option.setName("mitglied").setDescription("Wähle ein Mitglied, dessen Levelcard du sehen möchtest").setRequired(false)
				)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		await this.showRank();
	}

	private async showRank(): Promise<void> {
		const user: any = this.interaction.options.getUser("mitglied") || this.interaction.user;

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
			.setLevel(userData.level.level || 0, "LEVEL")
			.setLevelColor("#5773c9")
			.setRank(userData.level.position || 100, "RANG")

			// Progress bar
			.setProgressBar("#5773c9", "COLOR", true)
			.setProgressBarTrack("#ffffff")

			// XP
			.setCurrentXP(userData.level.cleanXp)
			.setRequiredXP(userData.level.cleanNextLevelXp);

		rank.build().then((data: any): void => {
			const attachment: AttachmentBuilder = new AttachmentBuilder(data, {
				name: "level-" + userData.user.id + ".png"
			});
			return this.interaction.followUp({ files: [attachment] });
		});
	}
}
