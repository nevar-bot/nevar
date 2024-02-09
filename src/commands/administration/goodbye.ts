import BaseCommand from "@structures/BaseCommand.js";
import BaseClient from "@structures/BaseClient.js";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";
import path from "path";

export default class GoodbyeCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "goodbye",
			description: "Say goodbye to members who leave the server",
			localizedDescriptions: {
				de: "Verabschiedet Mitglieder, welche den Server verlassen",
			},
			memberPermissions: ["ManageGuild"],
			cooldown: 2 * 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addSubcommand((subcommand: any) => subcommand
						.setName("status")
						.setDescription("Enable or disable the farewell message")
						.setDescriptionLocalization("de", "Aktiviere oder deaktivierte die Verabschiedungsnachricht")
						.addStringOption((option: any) => option
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
									}),
							),
					)
					.addSubcommand((subcommand: any) => subcommand
						.setName("test")
						.setDescription("Test the farewell message")
						.setDescriptionLocalization("de", "Teste die Verabschiedungsnachricht")
					)
					.addSubcommand((subcommand: any) => subcommand
						.setName("channel")
						.setNameLocalization("de", "kanal")
						.setDescription("Set the channel for the farewell message")
						.setDescriptionLocalization("de", "Setze den Kanal für die Verabschiedungsnachricht")
						.addChannelOption((option: any) => option
								.setName("channel")
								.setNameLocalization("de", "kanal")
								.setRequired(true)
								.setDescription("Select one of the above channels")
								.setDescriptionLocalization("de", "Wähle einen der genannten Kanäle")
								.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
						)
					)
					.addSubcommand((subcommand: any) => subcommand
						.setName("type")
						.setNameLocalization("de", "typ")
						.setDescription("Decide whether the farewell message is sent as an embed or text")
						.setDescriptionLocalization("de", "Entscheide, ob die Verabschiedungsnachricht als Embed oder Text gesendet wird")
						.addStringOption((option: any) => option
								.setName("type")
								.setNameLocalization("de", "typ")
								.setDescription("Choose one of the types mentioned")
								.setDescriptionLocalization("de", "Wähle einen der genannten Typen")
								.setRequired(true)
								.addChoices({ name: "embed", value: "embed" }, { name: "text", value: "text" }),
						),
					)
					.addSubcommand((subcommand: any) => subcommand
						.setName("message")
						.setNameLocalization("de", "nachricht")
						.setDescription("Set the goodbye message (see variables via /goodbye variables)")
						.setDescriptionLocalization("de", "Setze die Verabschiedungsnachricht (Variablen siehe /goodbye variablen)")
						.addStringOption((option: any) => option
								.setName("message")
								.setNameLocalization("de", "nachricht")
								.setDescription("Set the farewell message")
								.setDescriptionLocalization("de", "Lege die Verabschiedungsnachricht fest")
								.setRequired(true),
						),
					)
					.addSubcommand((subcommand: any) => subcommand
						.setName("variables")
						.setNameLocalization("de", "variablen")
						.setDescription("View the available variables for the farewell message")
						.setDescriptionLocalization("de", "Sieh die verfügbaren Variablen für die Verabschiedungsnachricht an")
					)
					.addSubcommand((subcommand: any) => subcommand
						.setName("color")
						.setNameLocalization("de", "farbe")
						.setDescription("Set the colour of the embed in hex format")
						.setDescriptionLocalization("de", "Setze die Farbe des Embeds im Hex-Format")
						.addStringOption((option: any) => option
								.setName("color")
								.setNameLocalization("de", "farbe")
								.setDescription("Enter the colour in hex format")
								.setDescriptionLocalization("de", "Gib die Farbe im Hex-Format ein")
								.setRequired(true),
						),
					)
					.addSubcommand((subcommand: any) => subcommand
						.setName("thumbnail")
						.setDescription("Decide whether the user's profile picture is displayed in the embed")
						.setDescriptionLocalization("de", "Entscheide, ob das Profilbild des Nutzers im Embed angezeigt wird")
						.addStringOption((option: any) => option
								.setName("status")
								.setDescription("Select a status")
								.setDescriptionLocalization("de", "Wähle einen Status")
								.setRequired(true)
								.addChoices({
										name: "yes",
										name_localizations: { de: "ja" },
										value: "true",
									},
									{
										name: "no",
										name_localizations: { de: "nein" },
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

		const subcommand: any = interaction.options.getSubcommand();

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
		if (this.data.guild.settings.farewell.enabled === JSON.parse(status)) {
			const statusText: string = JSON.parse(status)
				? this.translate("status:errors:farewellIsAlreadyEnabled")
				: this.translate("status:errors:farewellIsAlreadyDisabled");

			const isAlreadyEmbed: EmbedBuilder = this.client.createEmbed(statusText, "error", "error",);
			return this.interaction.followUp({ embeds: [isAlreadyEmbed] });
		}

		this.data.guild.settings.farewell.enabled = JSON.parse(status);
		this.data.guild.markModified("settings.farewell.enabled");
		await this.data.guild.save();

		const statusText: string = JSON.parse(status)
			? this.translate("status:farewellEnabled")
			: this.translate("status:farewellDisabled");

		const successEmbed: EmbedBuilder = this.client.createEmbed(statusText, "success", "success",);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async testMessage(): Promise<any> {
		if (!this.data.guild.settings.farewell.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:farewellIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}
		if (
			!this.data.guild.settings.farewell.channel ||
			!this.client.channels.cache.get(this.data.guild.settings.farewell.channel)
		) {
			const noChannelEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("test:errors:noFarewellChannelSet"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [noChannelEmbed] });
		}
		if (!this.data.guild.settings.farewell.message) {
			const noMessageEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("test:errors:noFarewellMessageSet"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [noMessageEmbed] });
		}
		if (!this.data.guild.settings.farewell.type) {
			const noTypeEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("test:errors:noFarewellTypeSet"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [noTypeEmbed] });
		}

		const member: any = this.interaction.member;
		const self: any = this;
		function parseMessage(str: string): string {
			return str
				.replaceAll(/%user.name/g, member.user.username)
				.replaceAll(/%user.displayName/g, member.displayName)
				.replaceAll(/%user.id/g, member.user.id)
				.replaceAll(/%user/g, member)

				.replaceAll(/%server.id/g, self.interaction.guild.id)
				.replaceAll(/%server.memberCount/g, self.interaction.guild.memberCount)
				.replaceAll(/%server/g, self.interaction.guild.name)

				.replaceAll(/%newline/g, "\n");
		}

		const channel: any = this.client.channels.cache.get(this.data.guild.settings.farewell.channel);
		const message: string = parseMessage(this.data.guild.settings.farewell.message);

		if (this.data.guild.settings.farewell.type === "embed") {
			const previewEmbed: EmbedBuilder = new EmbedBuilder()
				.setAuthor({
					name: this.client.user!.username,
					iconURL: this.client.user!.displayAvatarURL(),
				})
				.setDescription(message)
				.setColor(this.data.guild.settings.farewell.color || this.client.config.embeds["DEFAULT_COLOR"])
				.setFooter({ text: this.client.config.embeds["FOOTER_TEXT"] });

			if (this.data.guild.settings.farewell.thumbnail) {
				previewEmbed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }));
			}

			await channel.send({ embeds: [previewEmbed] }).catch((e: any): void => {});
		} else if (this.data.guild.settings.farewell.type === "text") {
			await channel.send({ content: message }).catch((e: any): void => {});
		}

		const testExecutedEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("test:farewellTestExecuted"),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [testExecutedEmbed] });
	}

	private async setChannel(channel: any): Promise<any> {
		if (!this.data.guild.settings.farewell.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:farewellIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		this.data.guild.settings.farewell.channel = channel.id;
		this.data.guild.markModified("settings.farewell.channel");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(
			this.translate("channel:farewellChannelSet", { channel: channel.toString() }),
			"success",
			"success",
		);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setType(type: any): Promise<any> {
		if (!this.data.guild.settings.farewell.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:farewellIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		if (this.data.guild.settings.farewell.type === type) {
			const statusString: string = type === "embed"
				? this.translate("type:errors:farewellTypeIsAlreadyEmbed")
				: this.translate("type:errors:farewellTypeIsAlreadyText");

			const isAlreadyEmbed: EmbedBuilder = this.client.createEmbed(statusString, "error", "error",);
			return this.interaction.followUp({ embeds: [isAlreadyEmbed] });
		}

		this.data.guild.settings.farewell.type = type;
		this.data.guild.markModified("settings.farewell.type");
		await this.data.guild.save();

		const statusString: string = type === "embed"
			? this.translate("type:farewellTypeSetToEmbed")
			: this.translate("type:farewellTypeSetToText");
		const successEmbed: EmbedBuilder = this.client.createEmbed(statusString, "success", "success",);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setMessage(message: string): Promise<any> {
		if (!this.data.guild.settings.farewell.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:farewellIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		this.data.guild.settings.farewell.message = message;
		this.data.guild.markModified("settings.farewell.message");
		await this.data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed(this.translate("message:farewellMessageSet"), "success", "success");
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async showVariables(): Promise<any> {
		const variables: any = this.translate("variables:farewellVariablesList", { e: this.client.emotes });
		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			10,
			variables,
			this.translate("variables:list:title"),
			this.translate("variables:list:noFarewellVariables"),
		);
	}

	private async setThumbnail(status: any): Promise<any> {
		if (!this.data.guild.settings.farewell.thumbnail) {
			this.data.guild.settings.farewell.thumbnail = true;
			this.data.guild.markModified("settings.farewell.thumbnail");
		}

		if (!this.data.guild.settings.farewell.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:farewellIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		if (this.data.guild.settings.farewell.type === "text") {
			const embedNotEnabled: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:farewellTypeHasToBeEmbed"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [embedNotEnabled] });
		}

		if (this.data.guild.settings.farewell.thumbnail === JSON.parse(status)) {
			const statusString: string = JSON.parse(status)
				? this.translate("thumbnail:errors:farewellThumbnailIsAlreadyEnabled")
				: this.translate("thumbnail:errors:farewellThumbnailIsAlreadyDisabled");

			const isAlreadyEmbed: EmbedBuilder = this.client.createEmbed(statusString, "error", "error",);
			return this.interaction.followUp({ embeds: [isAlreadyEmbed] });
		}

		this.data.guild.settings.farewell.thumbnail = JSON.parse(status);
		this.data.guild.markModified("settings.farewell.thumbnail");
		await this.data.guild.save();

		const statusString: string = JSON.parse(status)
			? this.translate("thumbnail:farewellThumbnailEnabled")
			: this.translate("thumbnail:farewellThumbnailDisabled")
		;
		const successEmbed: EmbedBuilder = this.client.createEmbed(statusString, "success", "success",);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async setColor(color: any): Promise<any> {
		if (!this.data.guild.settings.farewell.color) {
			this.data.guild.settings.farewell.color = "#11abc1";
			this.data.guild.markModified("settings.farewell.color");
		}

		if (!this.data.guild.settings.farewell.enabled) {
			const notEnabledEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:farewellIsNotEnabled"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [notEnabledEmbed] });
		}

		if (this.data.guild.settings.farewell.type === "text") {
			const embedNotEnabled: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:farewellTypeHasToBeEmbed"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [embedNotEnabled] });
		} else if (this.data.guild.settings.farewell.type === "embed") {
			if (!this.client.utils.stringIsHexColor(color)) {
				const invalidColorEmbed: EmbedBuilder = this.client.createEmbed(
					this.translate("color:errors:farewellEmbedColorHasToBeHex"),
					"error",
					"error",
				);
				return this.interaction.followUp({
					embeds: [invalidColorEmbed],
				});
			}

			this.data.guild.settings.farewell.color = color;
			this.data.guild.markModified("settings.farewell.color");
			await this.data.guild.save();

			const successEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("color:farewellEmbedColorSet", { color: color }),
				"success",
				"success",
			);
			return this.interaction.followUp({ embeds: [successEmbed] });
		}
	}
}
