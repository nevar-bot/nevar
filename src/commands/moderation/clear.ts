import BaseCommand from "@structures/BaseCommand.js";
import BaseClient from "@structures/BaseClient.js";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import path from "path";

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
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addIntegerOption((option: any) =>
						option
							.setName("number")
							.setNameLocalization("de", "anzahl")
							.setDescription("Select the number of messages you want to delete")
							.setDescriptionLocalization("de", "Wähle die Anzahl an Nachrichten, die du löschen möchtest")
							.setMinValue(1)
							.setMaxValue(99)
							.setRequired(true),
					)
					.addUserOption((option: any) =>
						option
							.setName("member")
							.setNameLocalization("de", "mitglied")
							.setDescription("Choose which user you want to delete messages from")
							.setDescriptionLocalization("de", "Wähle, von welchem Nutzer du die Nachrichten löschen möchtest")
							.setRequired(false),
					),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
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

		const confirmationString: string = user
			? this.translate("deletedMessagesFromUser", { count: messages.length, user: user.toString() })
			: this.translate("deletedMessages", { count: messages.length });

		const deletedEmbed: EmbedBuilder = this.client.createEmbed(
			confirmationString,
			"success",
			"success",
		);
		const embedSent: any = await this.interaction.followUp({
			embeds: [deletedEmbed],
		});

		const text: string =
			this.client.emotes.arrow + " " +
			this.getBasicTranslation("number") + ": " +
			messages.length +
			"\n" +
			this.client.emotes.channel + " " +
			this.getBasicTranslation("channel") + ": " +
			this.interaction.channel!.toString() +
			"\n" +
			this.client.emotes.user + " " +
			this.getBasicTranslation("moderator") + ": " +
			this.interaction.user.username;

		const logEmbed: EmbedBuilder = this.client.createEmbed(text, null, "normal");
		logEmbed.setTitle(this.client.emotes.delete + " " + this.translate("logTitle"));
		logEmbed.setThumbnail(this.interaction.user.displayAvatarURL());
		await this.interaction.guild!.logAction(logEmbed, "moderation");

		await this.client.wait(7000);
		embedSent.delete().catch((): void => {});
	}
}
