import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } from "discord.js";
import axios from "axios";
import Jimp from "jimp";

export default class PrideCommand extends BaseCommand
{
	public constructor(client: BaseClient)
	{
		super(client, {
			name: "pride",
			description: "Sendet einen Avatar mit Pride-Filter",
			cooldown: 3 * 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addUserOption((option: any) => option
						.setName("nutzer")
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

		let user: any = interaction.member.user;
		if (interaction.options.getUser("nutzer")) user = interaction.options.getUser("nutzer");

		return await this.getPrideAvatar(user);
	}

	private async getPrideAvatar(user: any): Promise<void>
	{
		const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 4096, extension: "png" });

		const response: any = await axios.get(avatarUrl, { responseType: "arraybuffer", validateStatus: (status: number): boolean => true });
		const buffer: Buffer = Buffer.from(response.data, "binary");

		const image: Jimp = await Jimp.read(buffer);
		const width: number = image.getWidth();
		const height: number = image.getHeight();

		const rainbowColors: string[] = [
			'#FF0018', // Rot
			'#FFA52C', // Orange
			'#FFFF41', // Gelb
			'#008018', // Grün
			'#0000F9', // Blau
			'#86007D' // Violett
		];

		const step: number = width / rainbowColors.length;
		const rainbowImage: Jimp = new Jimp(width, height);

		for (let i: number = 0; i < rainbowColors.length; i++) {
			const color: string = rainbowColors[i];
			const start: number = Math.floor(i * step);
			const end: number = Math.floor((i + 1) * step);

			for (let x: number = start; x < end; x++) {
				for (let y: number = 0; y < height; y++) {
					const hexColor: number = Jimp.cssColorToHex(color);
					rainbowImage.setPixelColor(hexColor, x, y);
				}
			}
		}

		rainbowImage.opacity(0.3);
		image.composite(rainbowImage, 0, 0);

		const editedBuffer: Buffer = await image.getBufferAsync(Jimp.MIME_PNG);
		const attachment: AttachmentBuilder = new AttachmentBuilder(editedBuffer, { name: "pride.png" });

		const prideAvatarEmbed: EmbedBuilder = this.client.createEmbed("", "", "normal");
		prideAvatarEmbed.setTitle("Pride-Avatar von " + user.username);
		prideAvatarEmbed.setImage("attachment://pride.png");

		return this.interaction.followUp({ embeds: [prideAvatarEmbed], files: [attachment] });
	}
}