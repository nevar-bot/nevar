import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default class ServericonCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "servericon",
			description: "Look at the icon of the server",
			localizedDescriptions: {
				de: "Sieh dir das Icon des Servers an",
			},
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder(),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.showServerIcon();
	}

	private async showServerIcon(): Promise<any> {
		const x64: any = this.interaction.guild!.iconURL({
			extension: "png",
			size: 64,
		});
		const x128: any = this.interaction.guild!.iconURL({
			extension: "png",
			size: 128,
		});
		const x256: any = this.interaction.guild!.iconURL({
			extension: "png",
			size: 256,
		});
		const x512: any = this.interaction.guild!.iconURL({
			extension: "png",
			size: 512,
		});
		const x1024: any = this.interaction.guild!.iconURL({
			extension: "png",
			size: 1024,
		});
		const x2048: any = this.interaction.guild!.iconURL({
			extension: "png",
			size: 2048,
		});

		const avatarEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("serverIconLinks") + ": " +
			"[x64]({0}) • [x128]({1}) • [x256]({2}) • [x512]({3}) • [x1024]({4}) • [x2048]({5})",
			null,
			"normal",
			x64,
			x128,
			x256,
			x512,
			x1024,
			x2048,
		);
		avatarEmbed.setTitle(this.translate("serverIcon", { guild: this.guild }))
		avatarEmbed.setImage(x256);

		return this.interaction.followUp({ embeds: [avatarEmbed] });
	}
}
