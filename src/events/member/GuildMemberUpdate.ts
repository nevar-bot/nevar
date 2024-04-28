import { EmbedBuilder } from "discord.js";
import { NevarClient } from "@core/NevarClient";

export default class {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async dispatch(oldMember: any, newMember: any): Promise<any> {
		if (oldMember.pending && !newMember.pending) this.client.emit("guildMemberAdd", newMember);
		if (!oldMember || !newMember || !newMember.guild || oldMember.partial) return;

		const { guild } = newMember;
		if (!guild.members.cache.find((m: any): boolean => m.id === oldMember.id)) return;


		/* Create properties array */
		const properties: Array<string> = [];

		if(newMember) properties.push(this.client.emotes.user + " " + guild.translate("basics:user") + ": " + newMember.toString());
		if(oldMember.displayName !== newMember.displayName) properties.push(this.client.emotes.edit + " " + guild.translate("events/member/GuildMemberUpdate:displayName") + ": " + oldMember.displayName + " **➜** " + newMember.displayName);

		newMember.roles.cache.forEach((role: any): void => {
			if (!oldMember.roles.cache.has(role.id)){
				properties.push(this.client.emotes.events.role.create + " " + role.toString() + " " + guild.translate("events/member/GuildMemberUpdate:added"));
			}

		});

		oldMember.roles.cache.forEach((role: any): void => {
			if (!newMember.roles.cache.has(role.id)){
				properties.push(this.client.emotes.events.role.delete + " " + role.toString() + " " + guild.translate("events/member/GuildMemberUpdate:removed"));
			}
		});

		if (properties.length < 1) return;

		/* Prepare message for log embed */
		const memberLogMessage: string =
			" ### " + this.client.emotes.events.member.update + " " + guild.translate("events/member/GuildMemberUpdate:updated")+ "\n\n" +
			properties.join("\n");

		/* Create embed */
		const memberLogEmbed: EmbedBuilder = this.client.createEmbed(memberLogMessage, null, "normal");
		memberLogEmbed.setThumbnail(newMember?.displayAvatarURL() || guild.iconURL());

		/* Log action */
		await guild.logAction(memberLogEmbed, "member");
	}
}
