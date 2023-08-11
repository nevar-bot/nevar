import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";

export default class WelcomeCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "welcome",
			description: "Sets the welcome message",
			localizedDescriptions: {
				"de": "Stellt die Willkommensnachricht ein"
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
							.setDescription("Determines whether the welcome message is enabled or disabled")
							.setDescriptionLocalizations({
								"de": "Legt fest, ob die Willkommensnachricht aktiviert oder deaktiviert ist"
							})
							.addStringOption((option: any) =>
								option
									.setName("status")
									.setDescription("Choose a status")
									.setDescriptionLocalizations({
										"de": "Wähle einen Status"
									})
									.setRequired(true)
									.addChoices(
										{
											name: "on",
											name_localizations: {
												"de": "an"
											},
											value: "true"
										}, {
											name: "off",
											name_localizations: {
												"de": "aus"
											},
											value: "false"
										})
							)
					)
					.addSubcommand((subcommand: any) => subcommand
						.setName("test")
						.setDescription("Sends a test message")
						.setDescriptionLocalizations({
							"de": "Sendet eine Testnachricht"
						})

					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("channel")
							.setDescription("Defines in which channel the welcome message is sent")
							.setDescriptionLocalizations({
								"de": "Legt fest, in welchem Channel die Willkommensnachricht gesendet wird"
							})
							.addChannelOption((option: any) =>
								option
									.setName("channel")
									.setRequired(true)
									.setDescription("Choose a channel")
									.setDescriptionLocalizations({
										"de": "Wähle einen Channel"
									})
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("type")
							.setDescription("Whether the welcome message is sent as an embed or as text")
							.setDescriptionLocalizations({
								"de": "Ob die Willkommensnachricht als Embed oder als Text gesendet wird"
							})
							.addStringOption((option: any) =>
								option
									.setName("type")
									.setDescription("Choose a type")
									.setDescriptionLocalizations({
										"de": "Wähle einen Typ"
									})
									.setRequired(true)
									.addChoices({
										name: "embed",
										value: "embed"
									}, {
										name: "text",
										value: "text"
									})
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("message")
							.setDescription("Defines the welcome message (variables see /welcome variables)")
							.setDescriptionLocalizations({
								"de": "Definiert die Willkommensnachricht (Variablen siehe /welcome variables)"
							})
							.addStringOption((option: any) => option
								.setName("message")
								.setDescription("Enter the message")
								.setDescriptionLocalizations({
									"de": "Gib die Nachricht ein"
								})
								.setRequired(true)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("variables")
							.setDescription("Lists all variables that can be used in the welcome message")
							.setDescriptionLocalizations({
								"de": "Listet alle Variablen, die in der Willkommensnachricht verwendet werden können"
							})
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("color")
							.setDescription("The color of the embed (default: #5865F2)")
							.setDescriptionLocalizations({
								"de": "Die Farbe des Embeds (Standard: #5865F2)"
							})
							.addStringOption((option: any) =>
								option.setName("farbe")
									.setDescription("Enter a color in HEX format")
									.setDescriptionLocalizations({
										"de": "Gib eine Farbe im HEX-Format ein"
									})
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("thumbnail")
							.setDescription("Should the profile picture be displayed in the embed?")
							.setDescriptionLocalizations({
								"de": "Soll das Profilbild im Embed angezeigt werden?"
							})
							.addStringOption((option: any) =>
								option
									.setName("status")
									.setDescription("Choose a status")
									.setDescriptionLocalizations({
										"de": "Wähle einen Status"
									})
									.setRequired(true)
									.addChoices({
										name: "on",
										name_localizations: {
											"de": "an"
										},
										value: "true"
									}, {
										name: "off",
										name_localizations: {
											"de": "aus"
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

		const subcommand: string = interaction.options.getSubcommand();

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
		if (data.guild.settings.welcome.enabled === JSON.parse(status)) {
			const statusString: string = JSON.parse(status) ? this.translate("basics:enabled") : this.translate("basics:disabled");
			const isAlreadyEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/welcome:errors:alreadyStatus", { status: statusString }), "error", "error", statusString);
			return this.interaction.followUp({ embeds: [isAlreadyEmbed] });
		}

		data.guild.settings.welcome.enabled = JSON.parse(status);
		data.guild.markModified("settings.welcome.enabled");
		await data.guild.save();

		const statusString: string = JSON.parse(status) ? this.translate("basics:enabled") : this.translate("basics:disabled");
		const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/welcome:statusSet", { status: statusString }), "success", "success", statusString);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async sendPreview(data: any): Promise<void> {
		if (!data.guild.settings.welcome.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/welcome:errors:isDisabled"), "error", "error");
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}
		if (!data.guild.settings.welcome.channel || !this.client.channels.cache.get(data.guild.settings.welcome.channel)) {
			const noChannelEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/welcome:errors:noChannelSet"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [noChannelEmbed] });
		}
		if (!data.guild.settings.welcome.message) {
			const noMessageEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/welcome:errors:noMessageSet"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [noMessageEmbed] });
		}
		if (!data.guild.settings.welcome.type) {
			const noTypeEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/welcome:errors:noTypeSet"), "error", "error");
			return this.interaction.followUp({ embeds: [noTypeEmbed] });
		}

		const member = this.interaction.member;
		const self = this;
		function parseMessage(str: string): string {
			return str
				.replaceAll(/{user}/g, member)
				.replaceAll(/{user:username}/g, member.user.username)
				.replaceAll(/{user:displayname}/g, member.user.displayName)
				.replaceAll(/{user:id}/g, member.user.id)
				.replaceAll(/{server:name}/g, self.interaction.guild.name)
				.replaceAll(/{server:id}/g, self.interaction.guild.id)
				.replaceAll(/{server:membercount}/g, self.interaction.guild.memberCount)
				.replaceAll(/{inviter}/g, member)
				.replaceAll(/{inviter:username}/g, member.user.username)
				.replaceAll(/{inviter:displayname}/g, member.user.displayName)
				.replaceAll(/{inviter:id}/g, member.user.id)
				.replaceAll(/{inviter:invites}/g, String(1))
				.replaceAll(/{newline}/g, "\n");
		}

		const channel: any = this.client.channels.cache.get(data.guild.settings.welcome.channel);
		const message: string = parseMessage(data.guild.settings.welcome.message);

		if (data.guild.settings.welcome.type === "embed") {
			const previewEmbed: EmbedBuilder = new EmbedBuilder()
				.setAuthor({
					name: this.client.user!.username,
					iconURL: this.client.user!.displayAvatarURL()
				})
				.setDescription(message)
				.setColor(data.guild.settings.welcome.color || this.client.config.embeds["DEFAULT_COLOR"])
				.setFooter({ text: this.client.config.embeds["FOOTER_TEXT"] });

			if (data.guild.settings.welcome.thumbnail) {
				previewEmbed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }));
			}

			await channel.send({ embeds: [previewEmbed] }).catch((e: any): void => {});
		} else if (data.guild.settings.welcome.type === "text") {
			await channel.send({ content: message }).catch((e: any): void => {});
		}

		const testExecutedEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/welcome:testSent"), "success", "success");
		return this.interaction.followUp({ embeds: [testExecutedEmbed] });
	}

	private async setChannel(channel: any, data: any): Promise<void> {
		if (!data.guild.settings.welcome.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/welcome:errors:isDisabled"), "error", "error");
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		data.guild.settings.welcome.channel = channel.id;
		data.guild.markModified("settings.welcome.channel");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("administration/welcome:channelSet", { channel: channel.toString() }),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setType(type: any, data: any): Promise<void> {
		if (!data.guild.settings.welcome.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/welcome:errors:isDisabled"), "error", "error");
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		if (data.guild.settings.welcome.type === type) {
			const statusString: string = type === "embed" ? this.translate("administration/welcome:types:embed") : this.translate("administration/welcome:types:text");
			const isAlreadyEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/welcome:errors:sameType", { type: statusString }),
				"error",
				"error",
				statusString
			);
			return this.interaction.followUp({ embeds: [isAlreadyEmbed] });
		}

		data.guild.settings.welcome.type = type;
		data.guild.markModified("settings.welcome.type");
		await data.guild.save();

		const statusString: string = type === "embed" ? this.translate("administration/welcome:types:embed") : this.translate("administration/welcome:types:text");
		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("administration/welcome:typeSet", { type: statusString }),
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setMessage(message: string, data: any): Promise<void> {
		if (!data.guild.settings.welcome.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/welcome:errors:isDisabled"), "error", "error");
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		data.guild.settings.welcome.message = message;
		data.guild.markModified("settings.welcome.message");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/welcome:messageSet"), "success", "success");
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	async showVariables(): Promise<void> {
		const variables: string[] = this.translate("administration/welcome:variables:list")
		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			10,
			variables,
			this.translate("administration/welcome:variables:title"),
			this.translate("administration/welcome:variables:empty"),
			"shine"
		);
	}

	private async setThumbnail(status: any, data: any): Promise<void> {
		if (!data.guild.settings.welcome.profilePicture) {
			data.guild.settings.welcome.profilePicture = true;
			data.guild.markModified("settings.welcome.profilePicture");
		}

		if (!data.guild.settings.welcome.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/welcome:errors:isDisabled"), "error", "error");
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		if (data.guild.settings.welcome.type === "text") {
			const embedNotEnabled: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/welcome:errors:typeHasToBeEmbed"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [embedNotEnabled] });
		}

		if (data.guild.settings.welcome.profilePicture === JSON.parse(status)) {
			const statusString: string = JSON.parse(status) ? this.translate("basics:enabled") : this.translate("basics:disabled");
			const isAlreadyEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/welcome:errors:sameTypeThumbnail", { status: statusString }), "error", "error");
			return this.interaction.followUp({ embeds: [isAlreadyEmbed] });
		}

		data.guild.settings.welcome.profilePicture = JSON.parse(status);
		data.guild.markModified("settings.welcome.profilePicture");
		await data.guild.save();

		const statusString: string = JSON.parse(status) ? this.translate("basics:enabled") : this.translate("basics:disabled");
		const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/welcome:thumbnailSet", { status: statusString }), "success", "success", statusString);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setColor(color: any, data: any): Promise<void> {
		if (!data.guild.settings.welcome.color) {
			data.guild.settings.welcome.color = "#5865F2";
			data.guild.markModified("settings.welcome.color");
		}

		if (!data.guild.settings.welcome.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/welcome:errors:isDisabled"), "error", "error");
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		if (data.guild.settings.welcome.type === "text") {
			const embedNotEnabled: EmbedBuilder = this.client.createEmbed(
				this.translate("administration/welcome:errors:typeHasToBeEmbed"),
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [embedNotEnabled] });
		} else if (data.guild.settings.welcome.type === "embed") {
			if (!this.client.utils.stringIsHexColor(color)) {
				const invalidColorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("administration/welcome:errors:invalidColor"),
					"error",
					"error"
				);
				return this.interaction.followUp({
					embeds: [invalidColorEmbed]
				});
			}
			data.guild.settings.welcome.color = color;
			data.guild.markModified("settings.welcome.color");
			await data.guild.save();

			const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("administration/welcome:colorSet", { color: color}), "success", "success", color);
			return this.interaction.followUp({ embeds: [successEmbed] });
		}
	}
}
