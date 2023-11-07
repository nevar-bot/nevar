import BaseClient from "@structures/BaseClient";
import { EmbedBuilder } from "discord.js";

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(interaction: any, customId: any, data: any, guild: any): Promise<any> {
		const channelId = customId[1];
		const messageId = customId[2];
		const action = customId[3];

		if (action === "delete") {
			const channel: any = await guild.channels.fetch(channelId).catch((e: any): void => {});
			if (!channel) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					"Die Nachricht konnte nicht gelöscht werden.",
					"error",
					"error"
				);
				return interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true
				});
			}
			const message: any = await channel.messages
				.fetch(messageId)
				.catch((e: any): void => {});
			if (!message) {
				const errorEmbed: EmbedBuilder = this.client.createEmbed(
					"Die Nachricht konnte nicht gelöscht werden.",
					"error",
					"error"
				);
				return interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true
				});
			}
			await message.delete();

			const successEmbed: EmbedBuilder = this.client.createEmbed(
				"Die Nachricht wurde gelöscht.",
				"success",
				"success"
			);
			await interaction.reply({
				embeds: [successEmbed],
				ephemeral: true
			});

			const thread = await interaction.message
				.startThread({
					name: "Nachricht von " + message.author.username
				})
				.catch((): void => {});

			if (thread)
				thread.send({
					content:
						"Die Nachricht wurde von " + interaction.member.toString() + " gelöscht."
				});
		}
	}
}
