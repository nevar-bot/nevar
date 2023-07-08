import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default class AvatarCommand extends BaseCommand
{
	public constructor(client: BaseClient)
	{
		super(client, {
			name: "avatar",
			description: "Sendet den Avatar eines Nutzers",
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data:
					new SlashCommandBuilder()
						.addUserOption(option => option
							.setName("mitglied")
							.setDescription("Wähle ein Mitglied")
							.setRequired(false)
						)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void>
	{
		this.interaction = interaction;
		await this.showAvatar(interaction.options.getUser("mitglied"));
	}

	private async showAvatar(user: any): Promise<any>
	{
		if (!user) user = this.interaction.user;

		const x64 = user.displayAvatarURL({ extension: "png", size: 64 });
		const x128 = user.displayAvatarURL({ extension: "png", size: 128 });
		const x256 = user.displayAvatarURL({ extension: "png", size: 256 });
		const x512 = user.displayAvatarURL({ extension: "png", size: 512 });
		const x1024 = user.displayAvatarURL({ extension: "png", size: 1024 });
		const x2048 = user.displayAvatarURL({ extension: "png", size: 2048 });

		const avatarEmbed = this.client.createEmbed("Links: [x64]({0}) • [x128]({1}) • [x256]({2}) • [x512]({3}) • [x1024]({4}) • [x2048]({5})", null, "normal", x64, x128, x256, x512, x1024, x2048);
		avatarEmbed.setTitle("Avatar von " + user.username);
		avatarEmbed.setImage(x256);

		return this.interaction.followUp({ embeds: [avatarEmbed] });
	}
}