import { NevarClient } from "@core/NevarClient";
import { EmbedBuilder, ChannelType, PermissionsBitField, ButtonBuilder } from "discord.js";

export default class {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async dispatch(guild: any): Promise<any> {
		/* Fetch guild */
		await guild.fetch().catch((e: any): void => {});
		/* Check if guild is null or not available */
		if (!guild || !guild.available || !guild.id) return;

		/* Add guild invites to invite cache */
		guild.invites.fetch()
			.then((invites: any): void => {
				this.client.invites.set(
					guild.id, new Map(invites.map((invite: any) => [invite.code, { uses: invite.uses, inviterId: invite.inviterId }])),
				);
			})
			.catch((e: any): void => {});

		/* Send welcome message */
		const firstChannel: any = guild.channels.cache.find(
			(c: any) =>
				(c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement) &&
				c.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.SendMessages),
		);

		const welcomeMessage: string =
			this.client.emotes.arrow + " " + guild.translate("events/guild/GuildCreate:commandsList") + "\n" +
			this.client.emotes.arrow + " " + guild.translate("events/guild/GuildCreate:helpfulLinks") + "\n\n" +
			this.client.emotes.arrow + " " + guild.translate("events/guild/GuildCreate:questionsOrProblems");


		const helpCommandId: any = (await this.client.application!.commands.fetch()).find((cmd: any): boolean => cmd.name === "help")?.id;
		const helpCommand: string = helpCommandId ? "</help:" + helpCommandId + ">" : "/help";
		const welcomeMessageEmbed: EmbedBuilder = this.client.createEmbed(welcomeMessage, null, "normal", helpCommand);
		welcomeMessageEmbed.setTitle(this.client.emotes.shine + " " + guild.translate("events/guild/GuildCreate:thanksForInviting"));
		welcomeMessageEmbed.setThumbnail(this.client.user!.displayAvatarURL());

		const buttonInvite: ButtonBuilder = this.client.createButton(
			null,
			guild.translate("events/guild/GuildCreate:buttons:invite"),
			"Link",
			this.client.emotes.logo.icon,
			false,
			this.client.createInvite(),
		);
		const buttonSupport: ButtonBuilder = this.client.createButton(
			null,
			guild.translate("events/guild/GuildCreate:buttons:support"),
			"Link",
			"discord",
			false,
			this.client.config.support["INVITE"],
		);
		const buttonWebsite: ButtonBuilder = this.client.createButton(
			null,
			guild.translate("events/guild/GuildCreate:buttons:web"),
			"Link",
			"globe",
			false,
			this.client.config.general["WEBSITE"],
		);
		const buttonVote: ButtonBuilder = this.client.createButton(
			null,
			guild.translate("events/guild/GuildCreate:buttons:vote"),
			"Link",
			"heart",
			false,
			"https://top.gg/bot/" + this.client.user!.id + "/vote",
		);
		const buttonDonate: ButtonBuilder = this.client.createButton(
			null,
			guild.translate("events/guild/GuildCreate:buttons:donate"),
			"Link",
			"gift",
			false,
			"https://prohosting24.de/cp/donate/nevar",
		);

		const buttonRow = this.client.createMessageComponentsRow(
			buttonInvite,
			buttonSupport,
			buttonWebsite,
			buttonVote,
			buttonDonate,
		);
		await firstChannel.send({ embeds: [welcomeMessageEmbed], components: [buttonRow] }).catch((e: any): void => {});
		await firstChannel.send({ content: this.client.config.support["INVITE"] }).catch((e: any): void => {});

		/* Support log message */
		const supportGuild: any = this.client.guilds.cache.get(this.client.config.support["ID"]);
		if (!supportGuild) return;

		const supportLogChannel: any = supportGuild.channels.cache.get(this.client.config.support["BOT_LOG"]);
		if (!supportLogChannel) return;

		const owner: any = await guild.fetchOwner().catch((e: any): void => {});
		const createdAt: string = this.client.utils.getDiscordTimestamp(guild.createdTimestamp, "f");
		const createdDiff: string = this.client.utils.getDiscordTimestamp(guild.createdTimestamp, "R");

		const supportGuildLogMessage: string =
			" ### " + this.client.emotes.discord + " " + supportGuild.translate("events/guild/GuildCreate:invited", { client: this.client.user!.username }) + "\n\n" +
			this.client.emotes.edit + " " + supportGuild.translate("basics:name") + ": ** " + guild.name + " **\n" +
			this.client.emotes.crown + " " + supportGuild.translate("events/guild/GuildCreate:owner") + ": ** " + owner.user.username + " **\n" +
			this.client.emotes.users + " " + supportGuild.translate("events/guild/GuildCreate:members") + ": ** " + guild.memberCount + " **\n" +
			this.client.emotes.calendar + " " + supportGuild.translate("events/guild/GuildCreate:createdAt") + ": ** " + createdAt + " **\n" +
			this.client.emotes.reminder + " " + supportGuild.translate("events/guild/GuildCreate:createdAgo") + ": ** " + createdDiff + " **";

		const supportGuildLogEmbed: EmbedBuilder = this.client.createEmbed(
			supportGuildLogMessage,
			null,
			"success",
		);
		supportGuildLogEmbed.setThumbnail(guild.iconURL({ dynamic: true, size: 512 }));

		await supportLogChannel.send({ embeds: [supportGuildLogEmbed] }).catch((e: any): void => {});
	}
}
