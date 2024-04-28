import { EmbedBuilder } from "discord.js";
import { NevarClient } from "@core/NevarClient";

export default class {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async dispatch(member: any): Promise<any> {
		/* Check if event or guild is null */
		if (!member || !member.id || !member.guild) return;
		/* Destructure guild from member */
		const { guild } = member;

		/* Guild and member data */
		const guildData = await this.client.findOrCreateGuild(guild.id);
		const memberData = await this.client.findOrCreateMember(member.id, guild.id);

		/* Update invite cache */
		if (memberData?.inviteUsed) {
			const invite: any = await guild.invites.fetch(memberData.inviteUsed).catch((e: any): void => {});
			if (invite) {
				const inviterData = await this.client.findOrCreateMember(invite.inviterId, guild.id);
				if (!inviterData.invites) inviterData.invites = [];
				inviterData.invites.find((i: any): boolean => i.code === invite.code).left++;
				inviterData.markModified("invites");
				await inviterData.save();
			}
		}

		/* Send log */
		const createdAt: string = this.client.utils.getDiscordTimestamp(member.user.createdTimestamp, "f");
		const createdDiff: string = this.client.utils.getDiscordTimestamp(member.user.createdTimestamp, "R");

		/* Create properties array */
		const properties: Array<string> = [];

		/* Push invite properties to properties array */
		if(member) properties.push(this.client.emotes.user + " " + guild.translate("basics:user") + ": " + member.toString());
		if(member.user.createdTimestamp) properties.push(this.client.emotes.calendar + " " + guild.translate("events/member/GuildMemberRemove:createdAt") + ": " + createdAt);
		if(member.user.createdTimestamp) properties.push(this.client.emotes.reminder + " " + guild.translate("events/member/GuildMemberRemove:createdAgo") + ": " + createdDiff);

		if(properties.length > 0){
			/* Prepare message for log embed */
			const memberLogMessage: string =
				" ### " + this.client.emotes.events.member.ban + " " + guild.translate("events/member/GuildMemberRemove:left")+ "\n\n" +
				properties.join("\n");

			/* Create embed */
			const memberLogEmbed: EmbedBuilder = this.client.createEmbed(memberLogMessage, null, "error");
			memberLogEmbed.setThumbnail(member.displayAvatarURL() || guild.iconURL());

			/* Log action */
			await guild.logAction(memberLogEmbed, "member");
		}

		/* Send farewell message */
		if (guildData.settings?.farewell.enabled) {
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
					.replaceAll(/%newline/g, "\n");
			}

			const farewellMessage: string|null = parseMessage(guildData.settings.farewell.message);
			const farewellChannel: any =
				guild.channels.cache.get(guildData.settings.farewell.channel) ||
				(await guild.channels.fetch(guildData.settings.farewell.channel).catch((): void => {}));

			if (guildData.settings.farewell.type === "embed") {
				const farewellEmbed: EmbedBuilder = this.client.createEmbed(farewellMessage, null, "normal");
				farewellEmbed.setColor(guildData.settings.farewell.color || this.client.config.embeds["DEFAULT_COLOR"]);
				if (guildData.settings.farewell?.profilePicture)
					farewellEmbed.setThumbnail(member.user.displayAvatarURL());
				return farewellChannel?.send({ embeds: [farewellEmbed] }).catch((): void => {});
			} else if (guildData.settings.welcome.type === "text") {
				return farewellChannel.send({ content: farewellMessage }).catch((): void => {});
			}
		}
	}
}
