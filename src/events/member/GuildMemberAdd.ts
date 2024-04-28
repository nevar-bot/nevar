import { Collection, EmbedBuilder } from "discord.js";
import { NevarClient } from "@core/NevarClient";

export default class {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async dispatch(member: any): Promise<any> {
		/* Check if event or guild is null */
		if (!member || !member.id || !member.guild || !member.guild.available || member.pending) return;
		/* Destructure guild from member */
		const { guild } = member;

		/* Guild and member data */
		const guildData: any = await this.client.findOrCreateGuild(guild.id);
		const memberData: any = await this.client.findOrCreateMember(member.id, guild.id);

		/* Invite data */
		const [fetchedInvites, cachedInvites] = await Promise.all([
			guild.invites.fetch().catch((e: any): void => {}),
			this.client.invites.get(guild.id),
		]);

		const inviteData: any = {
			inviter: null,
			invite: null,
			totalInvites: 0,
		};

		/* Get used invite and inviter */
		if (fetchedInvites && cachedInvites) {
			inviteData.invite = fetchedInvites.find((i: any): boolean => i.uses > cachedInvites.get(i.code).uses);
			inviteData.inviter = await this.client.users.fetch(inviteData.invite?.inviterId).catch((): void => {});
			inviteData.totalInvites = [...fetchedInvites.values()]
				.filter((invite): boolean => invite?.inviterId === inviteData.inviter?.id)
				.reduce((total: any, invite: any): any => total + invite.uses, inviteData.totalInvites || 0);

			this.client.invites.set(
				guild.id,
				new Collection(fetchedInvites.map((invite: any): any => [invite.code, { uses: invite.uses, inviterId: invite.inviterId }])),
			);
		}

		/* Send log */
		const createdAt: string = this.client.utils.getDiscordTimestamp(member.user.createdTimestamp, "f");
		const createdDiff: string = this.client.utils.getDiscordTimestamp(member.user.createdTimestamp, "R");

		/* Create properties array */
		const properties: Array<string> = [];

		/* Push invite properties to properties array */
		if(member) properties.push(this.client.emotes.user + " " + guild.translate("basics:user") + ": " + member.toString());
		if(member.user.createdTimestamp) properties.push(this.client.emotes.calendar + " " + guild.translate("events/member/GuildMemberAdd:createdAt") + ": " + createdAt);
		if(member.user.createdTimestamp) properties.push(this.client.emotes.reminder + " " + guild.translate("events/member/GuildMemberAdd:createdAgo") + ": " + createdDiff);
		if(inviteData.inviter) properties.push(this.client.emotes.invite + " " + guild.translate("events/member/GuildMemberAdd:inviter") + ": " + inviteData.inviter.toString());

		if(properties.length > 0){
			/* Prepare message for log embed */
			const memberLogMessage: string =
				" ### " + this.client.emotes.events.member.unban + " " + guild.translate("events/member/GuildMemberAdd:joined")+ "\n\n" +
				properties.join("\n");

			/* Create embed */
			const memberLogEmbed: EmbedBuilder = this.client.createEmbed(memberLogMessage, null, "success");
			memberLogEmbed.setThumbnail(member.displayAvatarURL() || guild.iconURL());

			/* Log action */
			await guild.logAction(memberLogEmbed, "member");
		}

		/* Add auto roles */
		for (const roleId of guildData.settings.welcome.autoroles) {
			const role: any = guild.roles.cache.get(roleId) || (await guild.roles.fetch(roleId).catch((): void => {}));
			if (!role) continue;
			member.roles.add(role).catch((): void => {});
		}

		/* Send welcome message */
		if (guildData.settings?.welcome.enabled) {
			function parseMessage(str: string): string|null {
				if(!str) return null;
				return str
					.replaceAll(/%user.name/g, member.user.username)
					.replaceAll(/%user.displayName/g, member.user.displayName)
					.replaceAll(/%user.id/g, member.user.id)
					.replaceAll(/%user/g, member)
					.replaceAll(/%server.id/g, guild.id)
					.replaceAll(/%server.memberCount/g, guild.memberCount)
					.replaceAll(/%server/g, guild.name)
					.replaceAll(/%inviter.name/g, inviteData.inviter?.username || "N/A")
					.replaceAll(/%inviter.displayName/g, inviteData.inviter?.displayName || "N/A")
					.replaceAll(/%inviter.id/g, inviteData.inviter?.id || "N/A")
					.replaceAll(/%inviter.invites/g, inviteData.totalInvites || 0)
					.replaceAll(/%inviter/g, inviteData.inviter || "N/A")
					.replaceAll(/%newline/g, "\n");
			}

			const welcomeMessage: string|null = parseMessage(guildData.settings.welcome.message);
			const welcomeChannel: any =
				guild.channels.cache.get(guildData.settings.welcome.channel) ||
				(await guild.channels.fetch(guildData.settings.welcome.channel).catch((): void => {}));

			if (welcomeChannel) {
				if (guildData.settings.welcome.type === "embed") {
					const welcomeEmbed: EmbedBuilder = this.client.createEmbed(welcomeMessage, null, "normal");
					if(guildData.settings.welcome.profilePicture) welcomeEmbed.setThumbnail(member.user.displayAvatarURL());
					welcomeChannel.send({ embeds: [welcomeEmbed] }).catch((): void => {});
				} else if (guildData.settings.welcome.type === "text") {
					welcomeChannel.send({ content: welcomeMessage }).catch((): void => {});
				}
			}
		}

		/* Track invite stats */
		if (inviteData.inviter && inviteData.invite && memberData) {
			const inviterData: any = await this.client.findOrCreateMember(inviteData.inviter.id, guild.id);
			if (!inviterData?.invites) inviterData.invites = [];

			/* Check if invite is added to inviter data */
			if (inviterData.invites.find((i: any): boolean => i.code === inviteData.invite.code)) {
				inviterData.invites.find((i: any): boolean => i.code === inviteData.invite.code).uses++;
			} else {
				inviterData.invites.push({
					code: inviteData.invite.code,
					uses: inviteData.invite.uses,
					fake: 0,
					left: 0,
				});
			}

			/* Check for fake invites */
			if (!memberData.inviteUsed) memberData.inviteUsed = null;

			/* Member used invite more than once or used his own invite */
			if (memberData.inviteUsed === inviteData.invite.code || inviteData.inviter.id === member.user.id)
				inviterData.invites.find((i: any): boolean => i.code === inviteData.invite.code).fake++;
			if (memberData.inviteUsed === inviteData.invite.code)
				inviterData.invites.find((i: any): boolean => i.code === inviteData.invite.code).left--;

			/* Save used invite to member */
			memberData.inviteUsed = inviteData.invite.code;

			memberData.markModified("inviteUsed");
			await memberData.save();

			inviterData.markModified("invites");
			await inviterData.save();
		}
	}
}