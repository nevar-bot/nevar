import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, AttachmentBuilder } from "discord.js";
import { RankCardBuilder, Font } from "canvacord";
import fs from "fs";

export default class RankCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "rank",
			description: "Take a look at your level card",
			localizedDescriptions: {
				de: "Sieh dir deine Levelkarte an",
			},
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addUserOption((option: any) =>
					option
						.setName("member")
						.setNameLocalization("de", "mitglied")
						.setDescription("Select a member")
						.setDescriptionLocalization("de", "Wähle ein Mitglied")
						.setRequired(false),
				),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
		await this.showRank();
	}

	private async showRank(): Promise<any> {
		if (!this.data.guild.settings.levels.enabled) {
			return this.interaction.followUp({
				content: this.client.emotes.error + " " + this.translate("errors:levelsystemIsNotEnabled"),
			});
		}

		const user: any = this.interaction.options.getUser("member") || this.interaction.user;

		const userData: any = {
			user: user,
			level: await this.client.levels.fetch(user.id, this.interaction.guild!.id, true),
		};

		const importedFont: Buffer = fs.readFileSync("./assets/Roboto-Black.ttf");
		new Font(importedFont, "RobotoBlack");

		const rankCard: RankCardBuilder = new RankCardBuilder()
			.setDisplayName(userData.user.displayName)
			.setUsername("@" + userData.user.username)
			.setCurrentXP(userData.level.cleanXp || 0)
			.setRequiredXP(userData.level.cleanNextLevelXp || 0)
			.setBackground("https://nevar.eu/img/banner_background_1920x1078.webp")
			.setAvatar(userData.user.displayAvatarURL())
			.setTextStyles({ rank: this.getBasicTranslation("rank"), xp: this.getBasicTranslation("xp"), level: this.getBasicTranslation("level") })
			.setStyles({
				progressbar: {
					thumb: { style: { backgroundColor: "#5773c9", borderRadius: "0%" } },
					track: { style: { backgroundColor: "#ffffff", borderRadius: "0%" } },
				},
				username: { name: { style: { fontSize: "35px" } }, handle: { style: { fontSize: "23px" } } },
				statistics: { container: { style: { fontSize: "20px" } } },
			})
			.setRank(userData.level.position || 100)
			.setFonts({
				username: { name: "RobotoBlack", handle: "RobotoBlack" },
				progress: {
					rank: { text: "RobotoBlack", value: "RobotoBlack" },
					level: { text: "RobotoBlack", value: "RobotoBlack" },
					xp: { text: "RobotoBlack", value: "RobotoBlack" },
				},
			})
			.setLevel(userData.level.level || 0);

		const rankCardBuffer: string | Buffer = await rankCard.build({ format: "webp" });

		if (userData.level) {
			const attachment: AttachmentBuilder = new AttachmentBuilder(rankCardBuffer, {
				name: "level-" + userData.user.id + ".webp",
			});
			return this.interaction.followUp({ files: [attachment] });
		} else {
			return this.interaction.followUp({
				content: this.client.emotes.error + " " + this.translate("errors:userGainedNoXp", { user: userData.user.toString() }),
			});
		}
	}
}
