import { NevarClient } from "@core/NevarClient";
import { AuditLogEvent, EmbedBuilder } from "discord.js";

export default class {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async dispatch(invite: any): Promise<any> {
		/* Check if event or guild is null */
		if (!invite || !invite.guild) return;
		/* Destructure guild from event */
		const { guild } = invite;

		/* Fetch audit logs to get moderator */
		const auditLogs: any = await guild.fetchAuditLogs({ type: AuditLogEvent["InviteDelete"], limit: 1 }).catch((): void => {});
		const moderator: any = auditLogs?.entries.first()?.executor;

		/* Create properties array */
		const properties: Array<string> = [];

		/* Push invite properties to properties array */
		if(invite.url) properties.push(this.client.emotes.link + " " + guild.translate("events/invite/InviteDelete:link") + ": " + invite.url);
		if(moderator) properties.push(this.client.emotes.user + " " + guild.translate("basics:moderator") + ": " + moderator.toString());
		if(invite.channel) properties.push(this.client.emotes.channel + " " + guild.translate("basics:channel") + ": " + invite.channel.toString());
		if(invite.maxUses) properties.push(this.client.emotes.reload + " " + guild.translate("events/invite/InviteDelete:maxUses") + ": " + (invite.maxUses === 0 ? guild.translate("events/invite/InviteDelete:unlimited") : invite.maxUses));

		if(properties.length > 0){
			/* Prepare message for log embed */
			const inviteLogMessage: string =
				" ### " + this.client.emotes.invite + " " + guild.translate("events/invite/InviteDelete:deleted")+ "\n\n" +
				properties.join("\n");

			/* Create embed */
			const inviteLogEmbed: EmbedBuilder = this.client.createEmbed(inviteLogMessage, null, "error");
			inviteLogEmbed.setThumbnail(moderator.displayAvatarURL() || guild.iconURL());

			/* Log action */
			await guild.logAction(inviteLogEmbed, "guild");
		}

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
	}
}
