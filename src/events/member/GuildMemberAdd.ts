import moment from "moment";
import { Collection, EmbedBuilder } from "discord.js";
import BaseClient from "@structures/BaseClient";

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(member: any): Promise<any> {
		if (!member || !member.id || !member.guild || member.pending) return;

		const { guild } = member;
		if (!guild.available) return;

		/* Guild and member data */
		const guildData: any = await this.client.findOrCreateGuild(guild.id);
		const memberData: any = await this.client.findOrCreateMember(member.id, guild.id);

		/* Invite data */
		const [fetchedInvites, cachedInvites] = await Promise.all([
			guild.invites.fetch().catch((e: any): void => {}),
			this.client.invites.get(guild.id)
		]);

		const inviteData: any = {
			inviter: null,
			invite: null,
			totalInvites: 0
		};

		/* Get used invite and inviter */
		if (fetchedInvites && cachedInvites) {
			inviteData.invite = fetchedInvites.find((i: any): boolean => i.uses > cachedInvites.get(i.code));
			inviteData.inviter = await this.client.users.fetch(inviteData.invite?.inviterId).catch((e: any): void => {});
			inviteData.totalInvites = [...fetchedInvites.values()]
				.filter((invite): boolean => invite?.inviterId === inviteData.inviter?.id)
				.reduce((total: any, invite: any): any => total + invite.uses, inviteData.totalInvites || 0);

			this.client.invites.set(guild.id, new Collection(fetchedInvites.map((invite: any): any => [invite.code, invite.uses])));
		}

		/* Send log */
		const createdAt: string = this.client.utils.getDiscordTimestamp(member.user.createdTimestamp, "f");
		const createdDiff: string = this.client.utils.getDiscordTimestamp(member.user.createdTimestamp, "R");

		const memberJoinText: string =
			this.client.emotes.edit +
			" Anzeigename: " +
			member.user.displayName +
			"\n" +
			this.client.emotes.user +
			" Nutzername: " +
			member.user.username +
			"\n" +
			this.client.emotes.id +
			" ID: " +
			member.id +
			"\n" +
			this.client.emotes.calendar +
			" Erstellt am: " +
			createdAt +
			"\n" +
			this.client.emotes.reminder +
			" Erstellt vor: " +
			createdDiff +
			"\n" +
			(inviteData.inviter
				? this.client.emotes.invite + " Eingeladen von: " + inviteData.inviter.displayName + " (@" + inviteData.inviter.username + ")"
				: "");

		const memberJoinEmbed: EmbedBuilder = this.client.createEmbed(memberJoinText, null, "success");
		memberJoinEmbed.setTitle(this.client.emotes.events.member.unban + " Mitglied hat den Server betreten");
		memberJoinEmbed.setThumbnail(member.user.displayAvatarURL());

		await guild.logAction(memberJoinEmbed, "member");

		/* Check member mute state */
		if (memberData?.muted?.state) {
			member.roles.add(guildData.settings.muterole).catch((e: any): void => {
				const errorText: string = this.client.emotes.user + " Mitglied: " + member.user.displayName + " (@" + member.user.username + ")";

				const errorEmbed: EmbedBuilder = this.client.createEmbed(errorText, null, "error");
				errorEmbed.setTitle(this.client.emotes.error + " Automatischer Mute fehlgeschlagen");
				errorEmbed.setThumbnail(member.user.displayAvatarURL());

				guild.logAction(errorEmbed, "moderation");
			});
		}

		/* Add auto roles */
		for (const roleId of guildData.settings.welcome.autoroles) {
			const role: any = guild.roles.cache.get(roleId) || (await guild.roles.fetch(roleId).catch((e: any): void => {}));
			if (!role) continue;

			member.roles.add(role, "Autorolle").catch((e: any): void => {
				const errorText: string =
					this.client.emotes.user +
					" Mitglied: " +
					member.user.displayName +
					" (@" +
					member.user.username +
					")" +
					"\n" +
					this.client.emotes.arrow +
					" Rolle: " +
					role.name;

				const errorEmbed: EmbedBuilder = this.client.createEmbed(errorText, null, "error");
				errorEmbed.setTitle(this.client.emotes.error + " Hinzufügen von Autorolle fehlgeschlagen");
				errorEmbed.setThumbnail(member.user.displayAvatarURL());

				guild.logAction(errorEmbed, "guild");
			});
		}

		/* Send welcome message */
		if (guildData.settings?.welcome.enabled) {
			function parseMessage(str: string): string {
				return str
					.replaceAll(/{user}/g, member)
					.replaceAll(/{user:username}/g, member.user.username)
					.replaceAll(/{user:displayname}/g, member.user.displayName)
					.replaceAll(/{user:id}/g, member.user.id)
					.replaceAll(/{server:name}/g, guild.name)
					.replaceAll(/{server:id}/g, guild.id)
					.replaceAll(/{server:membercount}/g, guild.memberCount)
					.replaceAll(/{inviter}/g, inviteData.inviter || "Unbekannt")
					.replaceAll(/{inviter:username}/g, inviteData.inviter?.username || "Unbekannt")
					.replaceAll(/{inviter:displayname}/g, inviteData.inviter?.displayName || "Unbekannt")
					.replaceAll(/{inviter:id}/g, inviteData.inviter?.id || "000000000000000000")
					.replaceAll(/{inviter:invites}/g, inviteData.totalInvites || 0)
					.replaceAll(/{newline}/g, "\n");
			}

			const welcomeMessage: string = parseMessage(guildData.settings.welcome.message);
			const welcomeChannel: any =
				guild.channels.cache.get(guildData.settings.welcome.channel) ||
				(await guild.channels.fetch(guildData.settings.welcome.channel).catch((e: any): void => {
					const errorText: string =
						this.client.emotes.user +
						" Mitglied: " +
						member.user.displayName +
						" (@" +
						member.user.username +
						")" +
						"\n" +
						this.client.emotes.arrow +
						" Kanal: " +
						guildData.settings.welcome.channel;

					const errorEmbed: EmbedBuilder = this.client.createEmbed(errorText, null, "error");
					errorEmbed.setTitle(this.client.emotes.error + " Willkommensnachricht fehlgeschlagen");
					errorEmbed.setThumbnail(member.user.displayAvatarURL());

					guild.logAction(errorEmbed, "guild");
				}));

			if (welcomeChannel) {
				if (guildData.settings.welcome.type === "embed") {
					const welcomeEmbed: EmbedBuilder = this.client.createEmbed(welcomeMessage, null, "normal");
					welcomeEmbed.setThumbnail(member.user.displayAvatarURL());
					welcomeChannel.send({ embeds: [welcomeEmbed] }).catch((e: any): void => {
						const errorText: string =
							this.client.emotes.user +
							" Mitglied: " +
							member.user.displayName +
							" (@" +
							member.user.username +
							")" +
							"\n" +
							this.client.emotes.arrow +
							" Kanal: " +
							welcomeChannel.toString();

						const errorEmbed: EmbedBuilder = this.client.createEmbed(errorText, null, "error");
						errorEmbed.setTitle(this.client.emotes.error + " Willkommensnachricht fehlgeschlagen");
						errorEmbed.setThumbnail(member.user.displayAvatarURL());

						guild.logAction(errorEmbed, "guild");
					});
				} else if (guildData.settings.welcome.type === "text") {
					welcomeChannel.send({ content: welcomeMessage }).catch((e: any): void => {
						const errorText: string =
							this.client.emotes.user +
							" Mitglied: " +
							member.user.displayName +
							" (@" +
							member.user.username +
							")" +
							"\n" +
							this.client.emotes.arrow +
							" Kanal: " +
							welcomeChannel.toString();

						const errorEmbed: EmbedBuilder = this.client.createEmbed(errorText, null, "error");
						errorEmbed.setTitle(this.client.emotes.error + " Willkommensnachricht fehlgeschlagen");
						errorEmbed.setThumbnail(member.user.displayAvatarURL());

						guild.logAction(errorEmbed, "guild");
					});
				}
			}

			/* Track invite stats */
			if (inviteData.inviter && inviteData.invite && memberData) {
				const inviterData: any = await this.client.findOrCreateMember(inviteData.inviter.id, guild.id);
				if (!inviterData.invites) inviterData.invites = [];
				if (inviterData.invites.find((i: any): boolean => i.code === inviteData.invite.code)) {
					inviterData.invites.find((i: any): boolean => i.code === inviteData.invite.code).uses++;
				} else {
					inviterData.invites.push({
						code: inviteData.invite.code,
						uses: inviteData.invite.uses,
						fake: 0,
						left: 0
					});
				}

				if (inviteData.inviter.id === member.user.id) inviterData.invites.find((i: any): boolean => i.code === inviteData.invite.code).fake++;
				if (!memberData.inviteUsed) memberData.inviteUsed = null;
				if (memberData.inviteUsed === inviteData.invite.code)
					inviterData.invites.find((i: any): boolean => i.code === inviteData.invite.code).fake++;
				if (memberData.inviteUsed === inviteData.invite.code)
					inviterData.invites.find((i: any): boolean => i.code === inviteData.invite.code).left--;
				memberData.inviteUsed = inviteData.invite.code;

				memberData.markModified("inviteUsed");
				await memberData.save();

				inviterData.markModified("invites");
				await inviterData.save();
			}
		}
	}
}
