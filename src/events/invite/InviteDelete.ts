import BaseClient from "@structures/BaseClient";
import { AuditLogEvent, EmbedBuilder } from "discord.js";

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(invite: any): Promise<any> {
		if (!invite || !invite.guild) return;
		const { guild } = invite;

		/* Get invite from cache */
		const cachedInvite: any = this.client.invites.get(guild.id).get(invite.code);
		if (!cachedInvite) return;

		/* Remove invite from cache */
		this.client.invites.get(guild.id).delete(invite.code);

		/* Remove invite from user */
		const { inviterId } = cachedInvite;

		const memberData: any = await this.client.findOrCreateMember(inviterId, guild.id);
		if (!memberData) return;

		if (!memberData.invites) memberData.invites = [];
		memberData.invites = memberData.invites.filter((i: any): boolean => i.code !== invite.code);
		memberData.markModified("invites");
		await memberData.save();

		/* Send log */
		let inviteDeleteText: string = this.client.emotes.link + " Link: " + invite.url;

		const auditLogs: any = await guild.fetchAuditLogs({ type: AuditLogEvent["InviteDelete"], limit: 1 }).catch((e: any): void => {});
		if (auditLogs) {
			const auditLogEntry: any = auditLogs.entries.first();
			if (auditLogEntry) {
				const moderator: any = auditLogEntry.executor;
				if (moderator)
					inviteDeleteText +=
						"\n\n" + this.client.emotes.user + " Nutzer/-in: " + "**" + moderator.displayName + "** (@" + moderator.username + ")";
			}
		}

		const inviteDeleteEmbed: EmbedBuilder = this.client.createEmbed(inviteDeleteText, null, "error");
		inviteDeleteEmbed.setTitle(this.client.emotes.invite + " Einladung gelöscht");
		inviteDeleteEmbed.setThumbnail(guild.iconURL());

		await guild.logAction(inviteDeleteEmbed, "guild");
	}
}
