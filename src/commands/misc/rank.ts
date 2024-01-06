import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, AttachmentBuilder } from "discord.js";
import { RankCardBuilder, Font } from "canvacord";
import fs from "fs";

export default class RankCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "rank",
			description: "Sends your level card",
			localizedDescriptions: {
				de: "Sendet deine Levelcard",
			},
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addUserOption((option: any) =>
					option
						.setName("member")
						.setNameLocalizations({
							de: "mitglied",
						})
						.setDescription("Select a member whose level card you would like to see")
						.setDescriptionLocalizations({
							de: "Wähle ein Mitglied, dessen Levelcard du sehen möchtest",
						})
						.setRequired(false),
				),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.showRank(data);
	}

	private async showRank(data: any): Promise<any> {
		if (!data.guild.settings.levels.enabled) {
			return this.interaction.followUp({
				content: this.client.emotes.error + " " + this.translate("errors:isDisabled"),
			});
		}

		const user: any = this.interaction.options.getUser("member") || this.interaction.user;

		const userData: any = {
			user: user,
			level: await this.client.levels.fetch(user.id, this.interaction.guild!.id, true),
		};

		const importedFont: Buffer = fs.readFileSync("./assets/Aguarita.ttf");
		new Font(importedFont, "Aguarita");

		const rankCard: RankCardBuilder = new RankCardBuilder()
			.setDisplayName(userData.user.displayName)
			.setUsername("@" + userData.user.username)
			.setCurrentXP(userData.level.cleanXp || 0)
			.setRequiredXP(userData.level.cleanNextLevelXp || 0)
			.setBackground("https://nevar.eu/img/banner_background_1920x1078.webp")
			.setAvatar(userData.user.displayAvatarURL())
			.setTextStyles({ rank: "Platz", xp: "XP", level: "Level" })
			.setStyles({
				progressbar: {
					thumb: { style: { backgroundColor: "#5773c9" } },
					track: { style: { backgroundColor: "#ffffff" } },
				},
				username: { name: { style: { fontSize: "35px" } }, handle: { style: { fontSize: "23px" } } },
				statistics: { container: { style: { fontSize: "20px" } } },
			})
			.setRank(userData.level.position || 100)
			.setFonts({
				username: { name: "Aguarita", handle: "Aguarita" },
				progress: {
					rank: { text: "Aguarita", value: "Aguarita" },
					level: { text: "Aguarita", value: "Aguarita" },
					xp: { text: "Aguarita", value: "Aguarita" },
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
				content: this.client.emotes.error + " " + this.translate("errors:noXp"),
			});
		}
	}
}
