import { NevarClient } from "@core/NevarClient";
import { AuditLogEvent, EmbedBuilder, PermissionsBitField } from "discord.js";
import pkg from "lodash";
const { isEqual } = pkg;

export default class {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async dispatch(oldRole: any, newRole: any): Promise<any> {
		/* Check if role or guild is null */
		if (!oldRole || !newRole || !newRole.guild) return;
		/* Destructure guild from role */
		const { guild } = newRole;
		/* Check if only rawPosition, guild and tags are different */
		if(isEqual({ ...oldRole, rawPosition: null, guild: null, tags: null }, { ...newRole, rawPosition: null, guild: null, tags: null })) return;

		/* Fetch audit logs to get moderator */
		const auditLogs: any = await guild.fetchAuditLogs({ type: AuditLogEvent["GuildRoleUpdate"], limit: 1 }).catch((): void => {});
		const moderator: any = auditLogs?.entries.first()?.executor;

		/* Create properties array */
		const properties: Array<string> = [];

		/* Push event properties to properties array */
		if(newRole) properties.push(this.client.emotes.ping + " " + guild.translate("basics:role") + ": " + newRole.toString());
		if(oldRole.name !== newRole.name) properties.push(this.client.emotes.edit + " " + guild.translate("basics:name") + ": " + oldRole.name + " **➜** " + newRole.name);
		if(moderator) properties.push(this.client.emotes.user + " " + guild.translate("basics:moderator") + ": " + moderator.toString());
		if(oldRole.color !== newRole.color) properties.push(this.client.emotes.magic + " " + guild.translate("events/role/GuildRoleUpdate:color") + ": " + oldRole.hexColor + " **➜** " + newRole.hexColor);
		if(oldRole.position !== newRole.position) properties.push(this.client.emotes.loading + " " + guild.translate("events/role/GuildRoleUpdate:position") + ": " + oldRole.position + " **➜** " + newRole.position);
		const oldPermissions: any = oldRole.permissions.bitfield;
		const newPermissions: any = newRole.permissions.bitfield;

		for (const [permission, value] of Object.entries(PermissionsBitField.Flags)) {
			const hasOldPermission: boolean = (oldPermissions & value) === value;
			const hasNewPermission: boolean = (newPermissions & value) === value;

			if (hasOldPermission && !hasNewPermission) {
				if(guild.translate("permissions:" + permission)) properties.push(this.client.emotes.error + " " + guild.translate("permissions:" + permission));
			} else if (!hasOldPermission && hasNewPermission) {
				if(guild.translate("permissions:" + permission)) properties.push(this.client.emotes.success + " " + guild.translate("permissions:" + permission));
			}
		}

		/* If there are no properties, return */
		if (properties.length < 1) return;

		/* Prepare message for log embed */
		const roleLogMessage: string =
			" ### " + this.client.emotes.events.event.update + " " + guild.translate("events/role/GuildRoleUpdate:updated")+ "\n\n" +
			properties.join("\n");

		/* Create embed */
		const roleLogEmbed: EmbedBuilder = this.client.createEmbed(roleLogMessage, null, "normal");
		roleLogEmbed.setThumbnail(moderator.displayAvatarURL() || guild.iconURL());

		/* Log action */
		await guild.logAction(roleLogEmbed, "role");
	}
}
