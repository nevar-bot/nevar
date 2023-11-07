import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder, ChannelType } from "discord.js";
import ems from "enhanced-ms";
const ms: any = ems("de");

export default class AutodeleteCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "autodelete",
			description: "Manages the automatic deletion of messages on the server",
			localizedDescriptions: {
				de: "Verwaltet das automatische Löschen von Nachrichten auf dem Server"
			},
			memberPermissions: ["ManageGuild", "ManageMessages"],
			botPermissions: ["ManageMessages"],
			cooldown: 2 * 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName("action")
							.setNameLocalizations({
								de: "aktion"
							})
							.setDescription("Choose from the following actions")
							.setDescriptionLocalizations({
								de: "Wähle aus den folgenden Aktionen"
							})
							.setRequired(true)
							.addChoices(
								{
									name: "add",
									name_localizations: {
										de: "hinzufügen"
									},
									value: "add"
								},
								{
									name: "remove",
									name_localizations: {
										de: "entfernen"
									},
									value: "remove"
								},
								{
									name: "list",
									name_localizations: {
										de: "liste"
									},
									value: "list"
								}
							)
					)
					.addChannelOption((option: any) =>
						option
							.setName("channel")
							.setDescription(
								"Choose for which channel you want to perform the action"
							)
							.setDescriptionLocalizations({
								de: "Wähle, für welchen Channel du die Aktion ausführen möchtest"
							})
							.setRequired(false)
							.addChannelTypes(
								ChannelType.GuildText,
								ChannelType.GuildAnnouncement,
								ChannelType.GuildForum,
								ChannelType.PublicThread
							)
					)
					.addStringOption((option: any) =>
						option
							.setName("time")
							.setNameLocalizations({
								de: "zeit"
							})
							.setRequired(false)
							.setDescription("Enter after what time new messages should be deleted")
							.setDescriptionLocalizations({
								de: "Gib ein, nach welcher Zeit neue Nachrichten gelöscht werden sollen"
							})
					)
			}
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;

		const action: string = interaction.options.getString("action");
		switch (action) {
			case "add":
				await this.addAutodelete(
					interaction.options.getChannel("channel"),
					interaction.options.getString("time"),
					data
				);
				break;
			case "remove":
				await this.removeAutodelete(interaction.options.getChannel("channel"), data);
				break;
			case "list":
				await this.showList(data);
				break;
			default:
				const unexpectedErrorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("basics:unexpectedError"),
					"error",
					"error"
				);
				return this.interaction.followUp({
					embeds: [unexpectedErrorEmbed]
				});
		}
	}

	private async addAutodelete(channel: any, time: string, data: any): Promise<void> {
		/* Invalid options */
		if (!time || !ms(time) || !channel || !channel.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:missingChannelOrTime"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Already exists for this channel */
		if (data.guild.settings.autodelete.find((x: any): boolean => x?.channel === channel.id)) {
			const alreadyExistsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:alreadySetInChannel", { channel: channel.toString() }),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [alreadyExistsEmbed] });
		}

		const timeInMs: any = ms(time);
		const msInTime: any = ms(ms(time));

		/* Time is too short */
		if (timeInMs < 1000) {
			const tooShortEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:timeLessThanOneSecond"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [tooShortEmbed] });
		}

		/* Time is too long */
		if (timeInMs > 7 * 24 * 60 * 60 * 1000) {
			const tooLongEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:timeMoreThan1Week"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [tooLongEmbed] });
		}

		/* Add to database */
		data.guild.settings.autodelete.push({
			channel: channel.id,
			time: timeInMs
		});
		data.guild.markModified("settings.autodelete");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("set", { channel: channel.toString(), time: msInTime }),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async removeAutodelete(channel: any, data: any): Promise<void> {
		/* Invalid options */
		if (!channel || !channel.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("basics:errors:missingChannel", {}, true),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* No autodelete for this channel */
		if (!data.guild.settings.autodelete.find((x: any): boolean => x?.channel === channel.id)) {
			const doesntExistEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:notSetInChannel", { channel: channel.toString() }),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [doesntExistEmbed] });
		}

		/* Remove from database */
		data.guild.settings.autodelete = data.guild.settings.autodelete.filter(
			(x: any): boolean => x.channel !== channel.id
		);
		data.guild.markModified("settings.autodelete");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("removed", { channel: channel.toString() }),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async showList(data: any): Promise<void> {
		let response: any = data.guild.settings.autodelete;
		const autodeleteArray: any[] = [];

		for (const element of response) {
			if (typeof element !== "object") continue;
			const cachedChannel: any = this.interaction.guild.channels.cache.get(element.channel);
			if (cachedChannel)
				autodeleteArray.push(
					" " +
						this.translate("list:channel") +
						": " +
						cachedChannel.toString() +
						"\n" +
						" " +
						this.translate("list:time") +
						": " +
						ms(element.time) +
						"\n"
				);
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			5,
			autodeleteArray,
			"Autodelete",
			this.translate("list:empty"),
			"channel"
		);
	}
}
