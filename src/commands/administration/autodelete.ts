import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";
import { EmbedBuilder, SlashCommandBuilder, ChannelType } from "discord.js";
import ems from "enhanced-ms";
import path from "path";
const ms: any = ems("de");

export default class AutodeleteCommand extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "autodelete",
			description: "Delete new messages automatically after a certain time",
			localizedDescriptions: {
				de: "Lösche neue Nachrichten automatisch nach einer bestimmten Zeit",
			},
			memberPermissions: ["ManageGuild", "ManageMessages"],
			botPermissions: ["ManageMessages"],
			cooldown: 2 * 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) =>
						option
							.setName("action")
							.setNameLocalization("de", "aktion")
							.setDescription("Choose one of the above actions")
							.setDescriptionLocalization("de", "Wähle eine der genannten Aktionen")
							.setRequired(true)
							.addChoices(
								{
									name: "add",
									name_localizations: {
										de: "hinzufügen",
									},
									value: "add",
								},
								{
									name: "remove",
									name_localizations: {
										de: "entfernen",
									},
									value: "remove",
								},
								{
									name: "list",
									name_localizations: {
										de: "liste",
									},
									value: "list",
								},
							),
					)
					.addChannelOption((option: any) =>
						option
							.setName("channel")
							.setNameLocalization("de", "kanal")
							.setDescription("Select a channel")
							.setDescriptionLocalization("de", "Wähle einen Kanal")
							.setRequired(false)
							.addChannelTypes(
								ChannelType.GuildText,
								ChannelType.GuildAnnouncement,
								ChannelType.GuildForum,
								ChannelType.PublicThread,
							),
					)
					.addStringOption((option: any) =>
						option
							.setName("duration")
							.setNameLocalization("de", "dauer")
							.setRequired(false)
							.setDescription("Select the time after which new messages should be deleted")
							.setDescriptionLocalization("de", "Wähle, nach welcher Zeit neue Nachrichten gelöscht werden sollen")
					),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<any> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;

		const action: string = interaction.options.getString("action");
		switch (action) {
			case "add":
				await this.addAutodelete(
					interaction.options.getChannel("channel"),
					interaction.options.getString("duration")
				);
				break;
			case "remove":
				await this.removeAutodelete(interaction.options.getChannel("channel"));
				break;
			case "list":
				await this.showList();
				break;
		}
	}

	private async addAutodelete(channel: any, time: string): Promise<any> {
		/* Invalid options */
		if (!time || !ms(time) || !channel || !channel.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:channelOrTimeIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Already exists for this channel */
		if (this.data.guild.settings.autodelete.find((x: any): boolean => x?.channel === channel.id)) {
			const alreadyExistsEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:autodeleteAlreadyActiveInChannel", { channel: channel.toString() }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [alreadyExistsEmbed] });
		}

		const timeInMs: any = ms(time);
		const msInTime: any = ms(ms(time));

		/* Time is too short */
		if (timeInMs < 1000) {
			const tooShortEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:timeIsTooShort"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [tooShortEmbed] });
		}

		/* Time is too long */
		if (timeInMs > 7 * 24 * 60 * 60 * 1000) {
			const tooLongEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:timeIsTooLong"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [tooLongEmbed] });
		}

		/* Add to database */
		this.data.guild.settings.autodelete.push({
			channel: channel.id,
			time: timeInMs,
		});
		this.data.guild.markModified("settings.autodelete");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("autodeleteAdded", { channel: channel.toString(), time: msInTime }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async removeAutodelete(channel: any): Promise<any> {
		/* Invalid options */
		if (!channel || !channel.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:channelIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* No autodelete for this channel */
		if (!this.data.guild.settings.autodelete.find((x: any): boolean => x?.channel === channel.id)) {
			const doesntExistEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:autodeleteNotActiveInChannel", { channel: channel.toString() }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [doesntExistEmbed] });
		}

		/* Remove from database */
		this.data.guild.settings.autodelete = this.data.guild.settings.autodelete.filter(
			(x: any): boolean => x.channel !== channel.id,
		);
		this.data.guild.markModified("settings.autodelete");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("autodeleteRemoved", { channel: channel.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async showList(): Promise<void> {
		const response: any = this.data.guild.settings.autodelete;
		const autodeleteArray: any[] = [];

		for (const element of response) {
			if (typeof element !== "object") continue;
			const cachedChannel: any = this.interaction.guild!.channels.cache.get(element.channel);
			if (cachedChannel)
				autodeleteArray.push(
					this.client.emotes.channel + " **" +
					this.getBasicTranslation("channel") +
					":** " +
					cachedChannel.toString() +
					"\n" +
					" **" +
					this.client.emotes.delete + " " +
					this.getBasicTranslation("duration") +
					":** " +
					ms(element.time) +
					"\n",
				);
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			5,
			autodeleteArray,
			this.translate("list:title"),
			this.translate("list:noAutodeleteSet")
		);
	}
}
