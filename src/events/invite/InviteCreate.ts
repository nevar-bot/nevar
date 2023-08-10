import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, Collection, AuditLogEvent } from "discord.js";
import moment from "moment";

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(invite: any): Promise<any> {
		if (!invite || !invite.guild || !invite.inviter) return;
		const { guild, inviter } = invite;

		/* Update invite cache */
		if (this.client.invites.get(guild.id)) {
			this.client.invites.get(guild.id).set(invite.code, invite.uses);
		} else {
			this.client.invites.set(guild.id, new Collection().set(invite.code, invite.uses));
		}

		/* Add invite to user */
		const memberData: any = await this.client.findOrCreateMember(inviter.id, guild.id);
		if (!memberData.invites) memberData.invites = [];
		memberData.invites.push({
			code: invite.code,
			uses: invite.uses,
			fake: 0,
			left: 0
		});
		memberData.markModified("invites");
		await memberData.save();

		let inviteCreateText: string =
			this.client.emotes.link +
			" Link: " +
			invite.url +
			"\n" +
			this.client.emotes.reload +
			" Max. Verwendungen: " +
			(invite.maxUses === 0 ? "Unbegrenzt" : invite.maxUses) +
			"\n" +
			(invite.expiresTimestamp
				? this.client.emotes.reminder + " Ablaufdatum: **" + moment(invite.expiresTimestamp).format("DD.MM.YYYY HH:mm") + "**"
				: "");

		const auditLogs: any = await guild.fetchAuditLogs({ type: AuditLogEvent["InviteCreate"], limit: 1 }).catch((e: any): void => {});
		if (auditLogs) {
			const auditLogEntry: any = auditLogs.entries.first();
			if (auditLogEntry) {
				const moderator: any = auditLogEntry.executor;
				if (moderator)
					inviteCreateText +=
						"\n\n" + this.client.emotes.user + " Nutzer: " + "**" + moderator.displayName + "** (@" + moderator.username + ")";
			}
		}

		const inviteCreateEmbed: EmbedBuilder = this.client.createEmbed(inviteCreateText, null, "success");
		inviteCreateEmbed.setTitle(this.client.emotes.invite + " Einladung erstellt");
		inviteCreateEmbed.setThumbnail(guild.iconURL());

		await guild.logAction(inviteCreateEmbed, "guild");
	}
}
