/** @format */

import BaseClient from '@structures/BaseClient';
import { AuditLogEvent, EmbedBuilder, PermissionsBitField } from 'discord.js';

export default class {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async dispatch(oldRole: any, newRole: any): Promise<any> {
		if (!oldRole || !newRole || !newRole.guild) return;
		const { guild } = newRole;

		const properties: any[] = [];
		if (oldRole.color !== newRole.color)
			properties.push(
				this.client.emotes.settings +
					' Farbe: ~~' +
					oldRole.hexColor +
					'~~ **' +
					newRole.hexColor +
					'**'
			);
		if (oldRole.name !== newRole.name)
			properties.push(
				this.client.emotes.edit +
					' Name: ~~' +
					oldRole.name +
					'~~ **' +
					newRole.name +
					'**'
			);

		const addedPermissions: any[] = [];
		const removedPermissions: any[] = [];

		const oldPermissions: any = oldRole.permissions.bitfield;
		const newPermissions: any = newRole.permissions.bitfield;

		for (const [permission, value] of Object.entries(
			PermissionsBitField.Flags
		)) {
			const hasOldPermission: boolean =
				(oldPermissions & value) === value;
			const hasNewPermission: boolean =
				(newPermissions & value) === value;

			if (hasOldPermission && !hasNewPermission) {
				if (this.client.permissions[permission])
					removedPermissions.push(
						this.client.permissions[permission]
					);
			} else if (!hasOldPermission && hasNewPermission) {
				if (this.client.permissions[permission])
					addedPermissions.push(this.client.permissions[permission]);
			}
		}

		let roleLogMessage: string =
			this.client.emotes.ping +
			' Rolle: ' +
			newRole.toString() +
			'\n' +
			properties.join('\n');

		if (addedPermissions.length > 0) {
			roleLogMessage +=
				'\n' +
				this.client.emotes.success +
				' ' +
				addedPermissions.join('\n' + this.client.emotes.success + ' ');
		}

		if (removedPermissions.length > 0) {
			roleLogMessage +=
				'\n' +
				this.client.emotes.error +
				' ' +
				removedPermissions.join('\n' + this.client.emotes.error + ' ');
		}

		const auditLogs: any = await guild
			.fetchAuditLogs({ type: AuditLogEvent['RoleUpdate'], limit: 1 })
			.catch((e: any): void => {});
		if (auditLogs) {
			const auditLogEntry: any = auditLogs.entries.first();
			if (auditLogEntry) {
				const moderator: any = auditLogEntry.executor;
				if (moderator)
					roleLogMessage +=
						'\n\n' +
						this.client.emotes.user +
						' Moderator: ' +
						moderator.toString();
			}
		}

		if (
			properties.length === 0 &&
			addedPermissions.length === 0 &&
			removedPermissions.length === 0
		)
			return;

		const roleLogEmbed: EmbedBuilder = this.client.createEmbed(
			roleLogMessage,
			null,
			'warning'
		);
		roleLogEmbed.setTitle(
			this.client.emotes.events.role.update + ' Rolle bearbeitet'
		);
		roleLogEmbed.setThumbnail(guild.iconURL());

		await guild.logAction(roleLogEmbed, 'role');
	}
}
