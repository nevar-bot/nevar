import { NevarClient } from "@core/NevarClient";
import { EmbedBuilder, Collection, AuditLogEvent } from "discord.js";
import moment from "moment";

export default class {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async dispatch(invite: any): Promise<any> {
		/* Check if event or guild is null */
		if (!invite || !invite.guild || !invite.inviter) return;
		/* Destructure guild from event */
		const { guild, inviter } = invite;

		/* Create properties array */
		const properties: Array<string> = [];

		/* Push invite properties to properties array */
		if(invite.url) properties.push(this.client.emotes.link + " " + guild.translate("events/invite/InviteCreate:link") + ": " + invite.url);
		if(invite.inviter) properties.push(this.client.emotes.user + " " + guild.translate("basics:moderator") + ": " + invite.inviter.toString());
		if(invite.channel) properties.push(this.client.emotes.channel + " " + guild.translate("basics:channel") + ": " + invite.channel.toString());
		if(invite.maxUses) properties.push(this.client.emotes.reload + " " + guild.translate("events/invite/InviteCreate:maxUses") + ": " + (invite.maxUses === 0 ? guild.translate("events/invite/InviteCreate:unlimited") : invite.maxUses));
		if(invite.expiresTimestamp) properties.push(this.client.emotes.reminder + " " + guild.translate("events/invite/InviteCreate:expires") + ": " + this.client.utils.getDiscordTimestamp(invite.expiresTimestamp, "R"));

		if(properties.length > 0){
			/* Prepare message for log embed */
			const inviteLogMessage: string =
				" ### " + this.client.emotes.invite + " " + guild.translate("events/invite/InviteCreate:created")+ "\n\n" +
				properties.join("\n");

			/* Create embed */
			const inviteLogEmbed: EmbedBuilder = this.client.createEmbed(inviteLogMessage, null, "success");
			inviteLogEmbed.setThumbnail(invite.inviter.displayAvatarURL() || guild.iconURL());

			/* Log action */
			await guild.logAction(inviteLogEmbed, "guild");
		}

		/* Update invite cache */
		if (this.client.invites.get(guild.id)) {
			this.client.invites.get(guild.id).set(invite.code, { uses: invite.uses, inviterId: invite.inviterId });
		} else {
			this.client.invites.set(guild.id, new Collection().set(invite.code, { uses: invite.uses, inviterId: invite.inviterId }));
		}

		/* Add invite to user */
		const memberData: any = await this.client.findOrCreateMember(inviter.id, guild.id);
		if (!memberData) return;
		if (!memberData.invites) memberData.invites = [];
		memberData.invites.push({
			code: invite.code,
			uses: invite.uses,
			fake: 0,
			left: 0,
		});
		memberData.markModified("invites");
		await memberData.save();
	}
}
