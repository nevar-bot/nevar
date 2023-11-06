import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder } from "discord.js";

export default class MyinvitesCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "myinvites",
			description: "Shows statistics about your invitations",
			localizedDescriptions: {
				de: "Zeigt Statistiken zu deinen Einladungen"
			},
			cooldown: 3 * 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
			}
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.showInvites(data.member);
	}

	private async showInvites(memberData: any): Promise<void> {
		const guildInvites: any = await this.interaction.guild.invites.fetch().catch((): void => {});

		const memberInvites: any = guildInvites.filter((i: any): boolean => i.inviterId === memberData.id);
		for (let invite of memberInvites.values()) {
			if (!this.client.invites.get(this.interaction.guild.id).has(invite.code))
				this.client.invites.get(this.interaction.guild.id).set(invite.code, { uses: invite.uses, inviterId: invite.inviterId });
			if (!memberData.invites) memberData.invites = [];
			if (!memberData.invites.find((i: any): boolean => i.code === invite.code))
				memberData.invites.push({
					code: invite.code,
					uses: invite.uses,
					fake: 0
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
					this.translate("usages") +
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
					this.translate("fake") +
					": **" +
					(invite.fake || 0) +
					"**\n"
			);
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			3,
			invitesData,
			this.translate("yourInvites"),
			this.translate("noInvites"),
			null
		);
	}
}
