import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default class AvatarCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "avatar",
			description: "Sends the avatar of a user",
			localizedDescriptions: {
				de: "Sendet den Avatar eines/r Nutzers/-in"
			},
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addUserOption((option) =>
					option
						.setName("member")
						.setDescription("Choose a member")
						.setDescriptionLocalizations({
							de: "Wähle ein Mitglied"
						})
						.setRequired(false)
				)
			}
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.showAvatar(interaction.options.getUser("member"));
	}

	private async showAvatar(user: any): Promise<any> {
		if (!user) user = this.interaction.user;

		const x64 = user.displayAvatarURL({ extension: "png", size: 64 });
		const x128 = user.displayAvatarURL({ extension: "png", size: 128 });
		const x256 = user.displayAvatarURL({ extension: "png", size: 256 });
		const x512 = user.displayAvatarURL({ extension: "png", size: 512 });
		const x1024 = user.displayAvatarURL({ extension: "png", size: 1024 });
		const x2048 = user.displayAvatarURL({ extension: "png", size: 2048 });

		const avatarEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("links") + " [x64]({0}) • [x128]({1}) • [x256]({2}) • [x512]({3}) • [x1024]({4}) • [x2048]({5})",
			null,
			"normal",
			x64,
			x128,
			x256,
			x512,
			x1024,
			x2048
		);
		avatarEmbed.setTitle(this.translate("title", { user: user.displayName }));
		avatarEmbed.setImage(x256);

		return this.interaction.followUp({ embeds: [avatarEmbed] });
	}
}
