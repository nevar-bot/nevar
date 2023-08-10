import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";

export default class GoodbyeCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "goodbye",
			description: "Stellt die Verabschiedungsnachricht ein",
			localizedDescriptions: {
				"en-US": "Sets the farewell message",
				"en-GB": "Sets the farewell message"
			},
			memberPermissions: ["ManageGuild"],
			cooldown: 2 * 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("status")
							.setDescription("Legt fest, ob die Verabschiedungsnachricht aktiviert oder deaktiviert ist")
							.setDescriptionLocalizations({
								"en-US": "Defines whether the goodbye message is enabled or disabled",
								"en-GB": "Defines whether the goodbye message is enabled or disabled"
							})
							.addStringOption((option: any) =>
								option
									.setName("status")
									.setDescription("Wähle einen Status")
									.setDescriptionLocalizations({
										"en-US": "Choose a status",
										"en-GB": "Choose a status"
									})
									.setRequired(true)
									.addChoices(
										{
											name: "an",
											name_localizations: {
												"en-US": "on",
												"en-GB": "on"
											},
											value: "true"
										},
										{
											name: "aus",
											name_localizations: {
												"en-US": "off",
												"en-GB": "off"
											},
											value: "false"
										})
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("test")
							.setDescription("Sendet eine Testnachricht")
							.setDescriptionLocalizations({
								"en-US": "Sends a test message",
								"en-GB": "Sends a test message"
							})
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("channel")
							.setDescription("Legt fest, in welchem Channel die Verabschiedungsnachricht gesendet wird")
							.setDescriptionLocalizations({
								"en-US": "Defines in which channel the goodbye message is sent",
								"en-GB": "Defines in which channel the goodbye message is sent"
							})
							.addChannelOption((option: any) =>
								option
									.setName("channel")
									.setRequired(true)
									.setDescription("Wähle einen Channel")
									.setDescriptionLocalizations({
										"en-US": "Choose a channel",
										"en-GB": "Choose a channel"
									})
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("type")
							.setDescription("Ob die Verabschiedungsnachricht als Embed oder als Text gesendet wird")
							.setDescriptionLocalizations({
								"en-US": "Whether the goodbye message is sent as an embed or as text",
								"en-GB": "Whether the goodbye message is sent as an embed or as text"
							})
							.addStringOption((option: any) =>
								option
									.setName("type")
									.setDescription("Wähle einen Typ")
									.setDescriptionLocalizations({
										"en-US": "Choose a type",
										"en-GB": "Choose a type"
									})
									.setRequired(true)
									.addChoices({ name: "embed", value: "embed" }, { name: "text", value: "text" })
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("message")
							.setDescription("Definiert die Verabschiedungsnachricht (Variablen siehe /goodbye variables)")
							.setDescriptionLocalizations({
								"en-US": "Defines the goodbye message (for variables see /goodbye variables)",
								"en-GB": "Defines the goodbye message (for variables see /goodbye variables)"
							})
							.addStringOption((option: any) =>
								option
									.setName("message")
									.setDescription("Gib die Nachricht ein")
									.setDescriptionLocalizations({
										"en-US": "Enter the message",
										"en-GB": "Enter the message"
									})
									.setRequired(true))
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("variables")
							.setDescription("Listet alle Variablen, die in der Verabschiedungsnachricht verwendet werden können")
							.setDescriptionLocalizations({
								"en-US": "Lists all variables that can be used in the goodbye message",
								"en-GB": "Lists all variables that can be used in the goodbye message"
							})
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("color")
							.setDescription("Die Farbe des Embeds (Standard: #5865F2)")
							.setDescriptionLocalizations({
								"en-US": "The color of the embed (default: #5865F2)",
								"en-GB": "The color of the embed (default: #5865F2)"
							})
							.addStringOption((option: any) =>
								option
									.setName("color")
									.setDescription("Gib eine Farbe im HEX-Format ein")
									.setDescriptionLocalizations({
										"en-US": "Enter a color in HEX format",
										"en-GB": "Enter a color in HEX format"
									})
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("thumbnail")
							.setDescription("Soll das Profilbild im Embed angezeigt werden?")
							.setDescriptionLocalizations({
								"en-US": "Should the profile picture be displayed in the embed?",
								"en-GB": "Should the profile picture be displayed in the embed?"
							})
							.addStringOption((option: any) =>
								option
									.setName("status")
									.setDescription("Wähle einen Status")
									.setDescriptionLocalizations({
										"en-US": "Choose a status",
										"en-GB": "Choose a status"
									})
									.setRequired(true)
									.addChoices(
										{
											name: "an",
											name_localizations: {
												"en-US": "on",
												"en-GB": "on"
											},
											value: "true"
										},
										{
											name: "aus",
											name_localizations: {
												"en-US": "off",
												"en-GB": "off"
											},
											value: "false"
										})
							)
					)
			}
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;

		const subcommand: any = interaction.options.getSubcommand();

		switch (subcommand) {
			case "status":
				await this.setStatus(interaction.options.getString("status"), data);
				break;
			case "test":
				await this.sendPreview(data);
				break;
			case "channel":
				await this.setChannel(interaction.options.getChannel("channel"), data);
				break;
			case "type":
				await this.setType(interaction.options.getString("type"), data);
				break;
			case "message":
				await this.setMessage(interaction.options.getString("message"), data);
				break;
			case "color":
				await this.setColor(interaction.options.getString("color"), data);
				break;
			case "thumbnail":
				await this.setThumbnail(interaction.options.getString("status"), data);
				break;
			case "variables":
				await this.showVariables();
				break;
		}
	}

	private async setStatus(status: any, data: any): Promise<void> {
		if (data.guild.settings.farewell.enabled === JSON.parse(status)) {
			const statusString: string = JSON.parse(status) ? this.translate("basics:enabled") : this.translate("basics:disabled");
			const isAlreadyEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/goodbye:errors:alreadyStatus", { status: statusString }),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [isAlreadyEmbed] });
		}

		data.guild.settings.farewell.enabled = JSON.parse(status);
		data.guild.markModified("settings.farewell.enabled");
		await data.guild.save();

		const statusString: string = JSON.parse(status) ? this.translate("basics:enabled") : this.translate("basics:disabled");
		const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/goodbye:statusSet", { status: statusString }), "success", "success");
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async sendPreview(data: any): Promise<void> {
		if (!data.guild.settings.farewell.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/goodbye:errors:isDisabled"), "error", "error");
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}
		if (!data.guild.settings.farewell.channel || !this.client.channels.cache.get(data.guild.settings.farewell.channel)) {
			const noChannelEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/goodbye:errors:noChannelSet"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [noChannelEmbed] });
		}
		if (!data.guild.settings.farewell.message) {
			const noMessageEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/goodbye:errors:noMessageSet"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [noMessageEmbed] });
		}
		if (!data.guild.settings.farewell.type) {
			const noTypeEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/goodbye:errors:noTypeSet"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [noTypeEmbed] });
		}

		const member: any = this.interaction.member;
		const self: any = this;
		function parseMessage(str: string): string {
			return str
				.replaceAll(/{user}/g, member)
				.replaceAll(/{user:username}/g, member.user.username)
				.replaceAll(/{user:displayname}/g, member.user.displayName)
				.replaceAll(/{user:id}/g, member.user.id)
				.replaceAll(/{server:name}/g, self.interaction.guild.name)
				.replaceAll(/{server:id}/g, self.interaction.guild.id)
				.replaceAll(/{server:membercount}/g, self.interaction.guild.memberCount)
				.replaceAll(/{newline}/g, "\n");
		}

		const channel: any = this.client.channels.cache.get(data.guild.settings.farewell.channel);
		const message: string = parseMessage(data.guild.settings.farewell.message);

		if (data.guild.settings.farewell.type === "embed") {
			const previewEmbed: EmbedBuilder = new EmbedBuilder()
				.setAuthor({
					name: this.client.user!.username,
					iconURL: this.client.user!.displayAvatarURL()
				})
				.setDescription(message)
				.setColor(data.guild.settings.farewell.color || this.client.config.embeds["DEFAULT_COLOR"])
				.setFooter({ text: this.client.config.embeds["FOOTER_TEXT"] });

			if (data.guild.settings.farewell.thumbnail) {
				previewEmbed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }));
			}

			await channel.send({ embeds: [previewEmbed] }).catch((e: any): void => {});
		} else if (data.guild.settings.farewell.type === "text") {
			await channel.send({ content: message }).catch((e: any): void => {});
		}

		const testExecutedEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/goodbye:testSent"), "success", "success");
		return this.interaction.followUp({ embeds: [testExecutedEmbed] });
	}

	private async setChannel(channel: any, data: any): Promise<void> {
		if (!data.guild.settings.farewell.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/goodbye:errors:isDisabled"), "error", "error");
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		data.guild.settings.farewell.channel = channel.id;
		data.guild.markModified("settings.farewell.channel");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("administration/goodbye:channelSet", { channel: channel.toString() }),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setType(type: any, data: any): Promise<any> {
		if (!data.guild.settings.farewell.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/goodbye:errors:isDisabled"), "error", "error");
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		if (data.guild.settings.farewell.type === type) {
			const statusString: string = type === "embed" ? this.translate("administration/goodbye:types:embed") : this.translate("administration/goodbye:types:text");
			const isAlreadyEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/goodbye:errors:sameType", { type: statusString }),
				"error",
				"error",
				statusString
			);
			return this.interaction.followUp({ embeds: [isAlreadyEmbed] });
		}

		data.guild.settings.farewell.type = type;
		data.guild.markModified("settings.farewell.type");
		await data.guild.save();

		const statusString: string = type === "embed" ? this.translate("administration/goodbye:types:embed") : this.translate("administration/goodbye:types:text");
		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("administration/goodbye:typeSet", { type: statusString }),
			"success",
			"success",
			statusString
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setMessage(message: string, data: any): Promise<void> {
		if (!data.guild.settings.farewell.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/goodbye:errors:isDisabled"), "error", "error");
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		data.guild.settings.farewell.message = message;
		data.guild.markModified("settings.farewell.message");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/goodbye:messageSet"), "success", "success");
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async showVariables(): Promise<void> {
		const variables: string[] = this.translate("administration/goodbye:variables:list")
		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			10,
			variables,
			this.translate("administration/goodbye:variables:title"),
			this.translate("administration/goodbye:variables:empty"),
			"shine"
		);
	}

	private async setColor(color: any, data: any): Promise<void> {
		if (!data.guild.settings.farewell.color) {
			data.guild.settings.farewell.color = "#5865F2";
			data.guild.markModified("settings.farewell.color");
		}

		if (!data.guild.settings.farewell.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/goodbye:errors:isDisabled"), "error", "error");
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		if (data.guild.settings.farewell.type === "text") {
			const embedNotEnabled: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/goodbye:errors:typeHasToBeEmbed"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [embedNotEnabled] });
		} else if (data.guild.settings.farewell.type === "embed") {
			if (!this.client.utils.stringIsHexColor(color)) {
				const invalidColorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("administration/goodbye:errors:invalidColor"),
					"error",
					"error"
				);
				return this.interaction.followUp({
					embeds: [invalidColorEmbed]
				});
			}

			data.guild.settings.farewell.color = color;
			data.guild.markModified("settings.farewell.color");
			await data.guild.save();

			const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/goodbye:colorSet", { color: color}), "success", "success");
			return this.interaction.followUp({ embeds: [successEmbed] });
		}
	}

	private async setThumbnail(status: any, data: any): Promise<void> {
		if (!data.guild.settings.farewell.thumbnail) {
			data.guild.settings.farewell.thumbnail = true;
			data.guild.markModified("settings.farewell.thumbnail");
		}

		if (!data.guild.settings.farewell.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/goodbye:errors:isDisabled"), "error", "error");
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		if (data.guild.settings.farewell.type === "text") {
			const embedNotEnabled: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/goodbye:errors:typeHasToBeEmbed"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [embedNotEnabled] });
		}

		if (data.guild.settings.farewell.thumbnail === JSON.parse(status)) {
			const statusString: string = JSON.parse(status) ? this.translate("basics:enabled") : this.translate("basics:disabled");
			const isAlreadyEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/goodbye:errors:sameTypeThumbnail", { status: statusString }), "error", "error");
			return this.interaction.followUp({ embeds: [isAlreadyEmbed] });
		}

		data.guild.settings.farewell.thumbnail = JSON.parse(status);
		data.guild.markModified("settings.farewell.thumbnail");
		await data.guild.save();

		const statusString: string = JSON.parse(status) ? this.translate("basics:enabled") : this.translate("basics:disabled");
		const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/goodbye:thumbnailSet", { status: statusString }), "success", "success");
		return this.interaction.followUp({ embeds: [successEmbed] });
	}
}
