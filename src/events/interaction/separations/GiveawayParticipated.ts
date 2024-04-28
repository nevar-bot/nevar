import { NevarClient } from "@core/NevarClient";

export default class {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async dispatch(interaction: any, customId: any, data: any, guild: any): Promise<any> {
		const giveaway: any = await this.client.giveawayManager.getGiveaway(interaction.message.id);
		if (!giveaway) return;
		if (giveaway.ended) return;

		if (giveaway.entrantIds.includes(interaction.user.id)) {
			await interaction.reply({
				content: "### " + this.client.emotes.tada + " " + guild.translate("events/interaction/InteractionCreate:giveawayParticipationRemoved"),
				ephemeral: true,
			});
			await this.client.giveawayManager.removeEntrant(interaction.message.id, interaction.user.id);
		} else {
			await interaction.reply({
				content: "### " + this.client.emotes.tada + " " + guild.translate("events/interaction/InteractionCreate:giveawayParticipationAdded"),
				ephemeral: true,
			});
			await this.client.giveawayManager.addEntrant(interaction.message.id, interaction.user.id);
		}
	}
}
