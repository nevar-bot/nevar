import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";
import { SlashCommandBuilder } from "discord.js";
import path from "path";

export default class MyinvitesCommand extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "myinvites",
			description: "See a list of your own invitations",
			localizedDescriptions: {
				de: "Sieh eine Liste deiner eigenen Einladungen",
			},
			cooldown: 3 * 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder(),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
		await this.showInvites();
	}

	private async showInvites(): Promise<any> {
		const memberData: any = this.data.member;
		const guildInvites: any = await this.interaction.guild!.invites.fetch().catch((): void => {});

		const memberInvites: any = guildInvites.filter((i: any): boolean => i.inviterId === memberData.id);
		for (const invite of memberInvites.values()) {
			if (!this.client.invites.get(this.interaction.guild!.id).has(invite.code))
				this.client.invites
					.get(this.interaction.guild!.id)
					.set(invite.code, { uses: invite.uses, inviterId: invite.inviterId });
			if (!memberData.invites) memberData.invites = [];
			if (!memberData.invites.find((i: any): boolean => i.code === invite.code))
				memberData.invites.push({
					code: invite.code,
					uses: invite.uses,
					fake: 0,
				});
			memberData.invites.find((i: any): boolean => i.code === invite.code).uses = invite.uses;
		}
		memberData.invites = memberData.invites.filter((i: any): boolean => guildInvites.has(i.code));
		memberData.markModified("invites");
		await memberData.save();
		const invites = memberData.invites;
		const invitesData: any[] = [];
		for (const invite of invites) {
			invitesData.push(
				"### " +
					this.client.emotes.link +
					" discord.gg/" +
					invite.code +
					"\n" +
					this.client.emotes.users +
					" " +
					this.translate("inviteUsages") +
					": **" +
					invite.uses +
					"**\n" +
					this.client.emotes.leave +
					" " +
					this.translate("guildLeft") +
					": **" +
					(invite.left || 0) +
					"**\n" +
					this.client.emotes.error +
					" " +
					this.translate("joinsFaked") +
					": **" +
					(invite.fake || 0) +
					"**\n",
			);
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			3,
			invitesData,
			this.translate("list:title"),
			this.translate("list:noInviteLinksCreated"),
		);
	}
}
