import BaseClient from "@structures/BaseClient.js";

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(interaction: any, customId: any, data: any, guild: any): Promise<any> {
		const giveaway: any = await this.client.giveawayManager.getGiveaway(interaction.message.id);
		if (!giveaway) return;
		if (giveaway.ended) return;

		if (giveaway.entrantIds.includes(interaction.user.id)) {
			await interaction.reply({
				content: "### " + this.client.emotes.tada + " Du nimmst absofort nicht mehr an dem Gewinnspiel teil!",
				ephemeral: true,
			});
			await this.client.giveawayManager.removeEntrant(interaction.message.id, interaction.user.id);
		} else {
			await interaction.reply({
				content: "### " + this.client.emotes.tada + " Du nimmst absofort an dem Gewinnspiel teil!",
				ephemeral: true,
			});
			await this.client.giveawayManager.addEntrant(interaction.message.id, interaction.user.id);
		}
	}
}
