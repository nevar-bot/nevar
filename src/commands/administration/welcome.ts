import BaseCommand from "@structures/BaseCommand.js";
import BaseClient from "@structures/BaseClient.js";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";
import path from "path";

export default class WelcomeCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "welcome",
			description: "Welcome new members who join your server automatically",
			localizedDescriptions: {
				de: "Begrüße neue Mitglieder die deinen Server betreten automatisch",
			},
			memberPermissions: ["ManageGuild"],
			cooldown: 2 * 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("status")
							.setDescription("Activate or deactivate the welcome message")
							.setDescriptionLocalization("de", "Aktiviere oder deaktiviere die Willkommensnachricht")
							.addStringOption((option: any) =>
								option
									.setName("status")
									.setDescription("Select a status")
									.setDescriptionLocalization("de", "Wähle einen Status")
									.setRequired(true)
									.addChoices({
											name: "on",
											name_localizations: { de: "an" },
											value: "true",
										},
										{
											name: "off",
											name_localizations: { de: "aus" },
											value: "false",
										},
									),
							),
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("test")
							.setDescription("Test the welcome message")
							.setDescriptionLocalization("de", "Teste die Willkommensnachricht")
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("channel")
							.setNameLocalization("de", "kanal")
							.setDescription("Set the channel of the welcome message")
							.setDescriptionLocalization("de", "Lege den Kanal der Willkommensnachricht fest.")
							.addChannelOption((option: any) =>
								option
									.setName("channel")
									.setNameLocalization("de", "kanal")
									.setRequired(true)
									.setDescription("Select one of the following channels")
									.setDescriptionLocalization("de", "Wähle einen der folgenden Kanäle")
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
							),
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("type")
							.setNameLocalization("de", "typ")
							.setDescription("Decide whether the welcome message is sent as an embed or text")
							.setDescriptionLocalization("de", "Entscheide, ob die Willkommensnachricht als Embed oder Text gesendet wird")
							.addStringOption((option: any) =>
								option
									.setName("type")
									.setNameLocalization("de", "typ")
									.setDescription("Select a type")
									.setDescriptionLocalization("de", "Wähle einen Typ")
									.setRequired(true)
									.addChoices({
											name: "embed",
											value: "embed",
										},
										{
											name: "text",
											value: "text",
										},
									),
							),
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("message")
							.setNameLocalization("de", "nachricht")
							.setDescription("Set the welcome message (for variables see /welcome variables)")
							.setDescriptionLocalization("de", "Setze die Willkommensnachricht (Variablen siehe /welcome variablen)")
							.addStringOption((option: any) =>
								option
									.setName("message")
									.setNameLocalization("de", "nachricht")
									.setDescription("Enter the welcome message")
									.setDescriptionLocalization("de", "Gib die Willkommensnachricht ein")
									.setRequired(true),
							),
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("variables")
							.setNameLocalization("de", "variablen")
							.setDescription("View the available variables for the welcome message")
							.setDescriptionLocalization("de", "Sieh die verfügbaren Variablen für die Willkommensnachricht an")
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("color")
							.setNameLocalization("de", "farbe")
							.setDescription("Set the colour of the embed in hex format")
							.setDescriptionLocalization("de", "Setze die Farbe des Embeds im Hex-Format")
							.addStringOption((option: any) =>
								option
									.setName("color")
									.setNameLocalization("de", "farbe")
									.setDescription("Enter the colour in hex format")
									.setDescriptionLocalization("de", "Gib die Farbe im Hex-Format ein")
									.setRequired(true),
							),
					)
					.addSubcommand((subcommand: any) =>
						subcommand
							.setName("thumbnail")
							.setDescription("Decide whether the user's profile picture is displayed in the embed")
							.setDescriptionLocalization("de", "Entscheide, ob das Profilbild des Nutzers im Embed angezeigt wird")
							.addStringOption((option: any) =>
								option
									.setName("status")
									.setDescription("Select a status")
									.setDescriptionLocalization("de", "Wähle einen Status")
									.setRequired(true)
									.addChoices({
											name: "on",
											name_localizations: { de: "an" },
											value: "true",
										},
										{
											name: "off",
											name_localizations: { de: "aus" },
											value: "false",
										},
									),
							),
					),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;

		const subcommand: string = interaction.options.getSubcommand();

		switch (subcommand) {
			case "status":
				await this.setStatus(interaction.options.getString("status"));
				break;
			case "test":
				await this.testMessage();
				break;
			case "channel":
				await this.setChannel(interaction.options.getChannel("channel"));
				break;
			case "type":
				await this.setType(interaction.options.getString("type"));
				break;
			case "message":
				await this.setMessage(interaction.options.getString("message"));
				break;
			case "color":
				await this.setColor(interaction.options.getString("color"));
				break;
			case "thumbnail":
				await this.setThumbnail(interaction.options.getString("status"));
				break;
			case "variables":
				await this.showVariables();
				break;
		}
	}

	private async setStatus(status: any): Promise<any> {
		if (this.data.guild.settings.welcome.enabled === JSON.parse(status)) {
			const statusString: string = JSON.parse(status)
				? this.translate("errors:welcomeMessageIsAlreadyEnabled")
				: this.translate("errors:welcomeMessageIsAlreadyDisabled");
			const isAlreadyEmbed: EmbedBuilder = this.client.createEmbed(
				statusString,
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [isAlreadyEmbed] });
		}

		this.data.guild.settings.welcome.enabled = JSON.parse(status);
		this.data.guild.markModified("settings.welcome.enabled");
		await this.data.guild.save();

		const statusString: string = JSON.parse(status)
			? this.translate("welcomeMessageEnabled")
			: this.translate("welcomeMessageDisabled");

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			statusString,
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async testMessage(): Promise<any> {
		if (!this.data.guild.settings.welcome.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:welcomeMessageIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}
		if (
			!this.data.guild.settings.welcome.channel ||
			!this.client.channels.cache.get(this.data.guild.settings.welcome.channel)
		) {
			const noChannelEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("test:errors:noWelcomeChannelSet"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [noChannelEmbed] });
		}
		if (!this.data.guild.settings.welcome.message) {
			const noMessageEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("test:errors:noWelcomeMessageSet"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [noMessageEmbed] });
		}
		if (!this.data.guild.settings.welcome.type) {
			const noTypeEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("test:errors:noWelcomeTypeSet"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [noTypeEmbed] });
		}

		const member: any = this.interaction.member;
		const self = this;
		function parseMessage(str: string): string {
			return str
				.replaceAll(/%user.name/g, member.user.username)
				.replaceAll(/%user.displayName/g, member.displayName)
				.replaceAll(/%user.id/g, member.user.id)
				.replaceAll(/%user/g, member)
				.replaceAll(/%server.id/g, self.interaction.guild!.id)
				.replaceAll(/%server.memberCount/g, self.interaction.guild!.memberCount.toString())
				.replaceAll(/%server/g, self.interaction.guild!.name)
				.replaceAll(/%inviter.name/g, member.user.username)
				.replaceAll(/%inviter.displayName/g, member.displayName)
				.replaceAll(/%inviter.id/g, member.user.id)
				.replaceAll(/%inviter.invites/g, String(1))
				.replaceAll(/%inviter/g, member)
				.replaceAll(/%newline/g, "\n");
		}

		const channel: any = this.client.channels.cache.get(this.data.guild.settings.welcome.channel);
		const message: string = parseMessage(this.data.guild.settings.welcome.message);

		if (this.data.guild.settings.welcome.type === "embed") {
			const previewEmbed: EmbedBuilder = new EmbedBuilder()
				.setAuthor({
					name: this.client.user!.username,
					iconURL: this.client.user!.displayAvatarURL(),
				})
				.setDescription(message)
				.setColor(this.data.guild.settings.welcome.color || this.client.config.embeds["DEFAULT_COLOR"])
				.setFooter({ text: this.client.config.embeds["FOOTER_TEXT"] });

			if (this.data.guild.settings.welcome.thumbnail) {
				previewEmbed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }));
			}

			await channel.send({ embeds: [previewEmbed] }).catch((e: any): void => {});
		} else if (this.data.guild.settings.welcome.type === "text") {
			await channel.send({ content: message }).catch((e: any): void => {});
		}

		const testExecutedEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("test:testExecuted"),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [testExecutedEmbed] });
	}

	private async setChannel(channel: any): Promise<any> {
		if (!this.data.guild.settings.welcome.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:welcomeMessageIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		this.data.guild.settings.welcome.channel = channel.id;
		this.data.guild.markModified("settings.welcome.channel");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("channel:welcomeChannelSet", { channel: channel.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setType(type: any): Promise<any> {
		if (!this.data.guild.settings.welcome.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:welcomeMessageIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		if (this.data.guild.settings.welcome.type === type) {
			const statusString: string = type === "embed"
				? this.translate("type:errors:welcomeTypeIsAlreadyEmbed")
				: this.translate("type:errors:welcomeTypeIsAlreadyText");
			const isAlreadyEmbed: EmbedBuilder = this.client.createEmbed(
				statusString,
				"error",
				"error"
			);
			return this.interaction.followUp({ embeds: [isAlreadyEmbed] });
		}

		this.data.guild.settings.welcome.type = type;
		this.data.guild.markModified("settings.welcome.type");
		await this.data.guild.save();

		const statusString: string = type === "embed"
			? this.translate("type:welcomeTypeSetToEmbed") :
			this.translate("type:welcomeTypeSetToText");
		const successEmbed: EmbedBuilder = this.client.createEmbed(
			statusString,
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setMessage(message: string): Promise<any> {
		if (!this.data.guild.settings.welcome.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:welcomeMessageIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		this.data.guild.settings.welcome.message = message;
		this.data.guild.markModified("settings.welcome.message");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("message:welcomeMessageSet"), "success", "success");
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	async showVariables(): Promise<any> {
		const variables: any = this.translate("variables:list", { e: this.client.emotes });
		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			10,
			variables,
			this.translate("variables:title"),
			this.translate("variables:noWelcomeVariables"),
		);
	}

	private async setThumbnail(status: any): Promise<any> {
		if (!this.data.guild.settings.welcome.profilePicture) {
			this.data.guild.settings.welcome.profilePicture = true;
			this.data.guild.markModified("settings.welcome.profilePicture");
		}

		if (!this.data.guild.settings.welcome.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:welcomeMessageIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		if (this.data.guild.settings.welcome.type === "text") {
			const embedNotEnabled: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:welcomeTypeHasToBeEmbed"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [embedNotEnabled] });
		}

		if (this.data.guild.settings.welcome.profilePicture === JSON.parse(status)) {
			const statusString: string = JSON.parse(status)
				? this.translate("thumbnail:errors:welcomeThumbnailIsAlreadyEnabled")
				: this.translate("thumbnail:errors:welcomeThumbnailIsAlreadyDisabled");
			const isAlreadyEmbed: EmbedBuilder = this.client.createEmbed(
				statusString,
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [isAlreadyEmbed] });
		}

		this.data.guild.settings.welcome.profilePicture = JSON.parse(status);
		this.data.guild.markModified("settings.welcome.profilePicture");
		await this.data.guild.save();

		const statusString: string = JSON.parse(status)
			? this.translate("thumbnail:welcomeThumbnailEnabled")
			: this.translate("thumbnail:welcomeThumbnailDisabled");
		const successEmbed: EmbedBuilder = this.client.createEmbed(
			statusString,
			"success",
			"success"
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setColor(color: any): Promise<any> {
		if (!this.data.guild.settings.welcome.color) {
			this.data.guild.settings.welcome.color = "#11abc1";
			this.data.guild.markModified("settings.welcome.color");
		}

		if (!this.data.guild.settings.welcome.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:welcomeMessageIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		if (this.data.guild.settings.welcome.type === "text") {
			const embedNotEnabled: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:welcomeTypeHasToBeEmbed"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [embedNotEnabled] });
		} else if (this.data.guild.settings.welcome.type === "embed") {
			if (!this.client.utils.stringIsHexColor(color)) {
				const invalidColorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("color:errors:welcomeEmbedColorHasToBeHex"),
					"error",
					"error",
				);
				return this.interaction.followUp({
					embeds: [invalidColorEmbed],
				});
			}
			this.data.guild.settings.welcome.color = color;
			this.data.guild.markModified("settings.welcome.color");
			await this.data.guild.save();

			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("color:welcomeEmbedColorSet", { color: color }),
				"success",
				"success",
				color,
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		}
	}
}
