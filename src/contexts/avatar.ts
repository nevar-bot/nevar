import { ApplicationCommandType, EmbedBuilder } from "discord.js";
import BaseContext from "@structures/BaseContext";
import BaseClient from "@structures/BaseClient";

export default class AvatarContext extends BaseContext {
	constructor(client: BaseClient) {
		super(client, {
			name: "avatar",
			type: ApplicationCommandType.User,
			cooldown: 3 * 1000,
		});
	}

	public async dispatch(interaction: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.showAvatar(interaction.targetUser);
	}

	private async showAvatar(user: any): Promise<any> {
		const x64: string = user.displayAvatarURL({
			extension: "png",
			size: 64,
		});
		const x128: string = user.displayAvatarURL({
			extension: "png",
			size: 128,
		});
		const x256: string = user.displayAvatarURL({
			extension: "png",
			size: 256,
		});
		const x512: string = user.displayAvatarURL({
			extension: "png",
			size: 512,
		});
		const x1024: string = user.displayAvatarURL({
			extension: "png",
			size: 1024,
		});
		const x2048: string = user.displayAvatarURL({
			extension: "png",
			size: 2048,
		});

		const avatarEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("links") +
				" [x64]({0}) • [x128]({1}) • [x256]({2}) • [x512]({3}) • [x1024]({4}) • [x2048]({5})",
			null,
			"normal",
			x64,
			x128,
			x256,
			x512,
			x1024,
			x2048,
		);
		avatarEmbed.setTitle(this.translate("title", { user: user.displayName }));
		avatarEmbed.setImage(x256);

		return this.interaction.followUp({ embeds: [avatarEmbed] });
	}
}
