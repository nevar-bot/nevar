import BaseClient from "@structures/BaseClient";
import
{
	ActionRowBuilder,
	AnyComponentBuilder,
	ButtonBuilder,
	EmbedBuilder
} from "discord.js";

export default class
{
	private client: BaseClient;

	public constructor(client: BaseClient)
	{
		this.client = client;
	}

	public async dispatch(interaction: any, data: any, guild: any, suggestion: any, image: any = null): Promise<any>
	{
		/* Send suggestion to suggestion channel */
		const suggestionVoteEmbed: EmbedBuilder = this.client.createEmbed(suggestion, "arrow", "normal");
		suggestionVoteEmbed.setTitle("Idee von " + interaction.member.user.username);
		suggestionVoteEmbed.setThumbnail(interaction.member.user.displayAvatarURL({ dynamic: true }));
		suggestionVoteEmbed.setImage(image);
		suggestionVoteEmbed.setFooter({ text: "👍 0 • 👎 0" });

		const userId: any = interaction.member.user.id;
		const buttonYes: ButtonBuilder = this.client.createButton("suggestion_" + userId + "_yes", null, "Secondary", "success");
		const buttonNo: ButtonBuilder = this.client.createButton("suggestion_" + userId + "_no", null, "Secondary", "error");
		const voteButtonComponentsRow: ActionRowBuilder<AnyComponentBuilder> = this.client.createMessageComponentsRow(buttonYes, buttonNo);

		const suggestionChannel: any = guild.channels.cache.get(data.guild.settings.suggestions.channel);
		if (!suggestionChannel) return;
		const suggestionVoteEmbedMessage: any = await suggestionChannel.send({ embeds: [suggestionVoteEmbed], components: [voteButtonComponentsRow] }).catch((e: any): void => { });

		/* Send suggestion to review channel */
		const reviewChannel: any = guild.channels.cache.get(data.guild.settings.suggestions.review_channel);
		if (!reviewChannel) return;

		const reviewEmbed: EmbedBuilder = this.client.createEmbed(suggestion, "arrow", "normal");
		reviewEmbed.setTitle("Idee von " + interaction.member.user.username);
		reviewEmbed.setThumbnail(interaction.member.user.displayAvatarURL({ dynamic: true }));

		const buttonAccept: ButtonBuilder = this.client.createButton("review_suggestion_" + suggestionVoteEmbedMessage.id + "_" + suggestionChannel.id + "_accept", "Annehmen", "Success", "success");
		const buttonDecline: ButtonBuilder = this.client.createButton("review_suggestion_" + suggestionVoteEmbedMessage.id + "_" + suggestionChannel.id + "_decline", "Ablehnen", "Danger", "error");
		const reviewButtonComponentsRow: ActionRowBuilder<AnyComponentBuilder> = this.client.createMessageComponentsRow(buttonAccept, buttonDecline);

		await reviewChannel.send({ embeds: [reviewEmbed], components: [reviewButtonComponentsRow] }).catch(() => { });
	}
}