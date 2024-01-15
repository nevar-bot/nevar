import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default class ClearCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "clear",
			description: "Deletes a certain number of messages, possibly from a specific user",
			localizedDescriptions: {
				de: "Löscht eine bestimmte Anzahl an Nachrichten, ggf. von einem/r bestimmten Nutzer/-in",
			},
			memberPermissions: ["ManageMessages"],
			botPermissions: ["ManageMessages"],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addIntegerOption((option: any) =>
						option
							.setName("number")
							.setNameLocalizations({
								de: "anzahl",
							})
							.setDescription("Specify how many messages you want to delete")
							.setDescriptionLocalizations({
								de: "Gib an, wieviele Nachrichten du löschen möchtest"
							})
							.setMinValue(1)
							.setMaxValue(99)
							.setRequired(true),
					)
					.addUserOption((option: any) =>
						option
							.setName("member")
							.setNameLocalizations({
								de: "mitglied"
							})
							.setDescription("Choose which user you want to delete messages from")
							.setDescriptionLocalizations({
								de: "Wähle, von welchem/r Nutzer/-in du Nachrichten löschen möchtest"
							})
							.setRequired(false),
					),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		await this.clearMessages(interaction.options.getInteger("number"), interaction.options.getUser("member"));
	}

	private async clearMessages(amount: number, user: any): Promise<void> {
		let messages: any[] = Array.from(
			(
				await this.interaction.channel!.messages.fetch({
					limit: amount + 1,
				})
			).values(),
		);

		if (user) {
			messages = messages.filter((m: any): boolean => m.author.id === user.id);
		}
		messages = messages.filter((m) => !m.pinned);

		if (messages[0].author.id === this.client.user!.id) messages.shift();

		this.interaction.channel!.bulkDelete(messages, true).catch((): void => {});

		const string: string = user ? this.translate("from") + " " + user.displayName : "";
		const deletedEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("cleared", { count: messages.length, user: string }),
			"success",
			"success",
		);
		const embedSent: any = await this.interaction.followUp({
			embeds: [deletedEmbed],
		});

		const text: string =
			this.client.emotes.arrow + " " +
			this.translate("count") + ": " +
			messages.length +
			"\n" +
			this.client.emotes.channel + " " +
			this.translate("channel") + ": " +
			this.interaction.channel!.toString() +
			"\n" +
			this.client.emotes.user + " " +
			this.translate("moderator") + ": " +
			this.interaction.user.username;

		const logEmbed: EmbedBuilder = this.client.createEmbed(text, null, "normal");
		logEmbed.setTitle(this.client.emotes.delete + " " + this.translate("title"));
		logEmbed.setThumbnail(this.interaction.user.displayAvatarURL());
		await this.interaction.guild!.logAction(logEmbed, "moderation");

		await this.client.wait(7000);
		embedSent.delete().catch((): void => {});
	}
}
