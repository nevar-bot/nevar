import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default class Timeoutlist extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "timeoutlist",
			description: "Lists all timeouted members",
			localizedDescriptions: {
				de: "Listet alle getimeouteten Mitglieder",
			},
			memberPermissions: ["ManageRoles"],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder(),
			},
		});
	}

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.showTimeoutList();
	}

	private async showTimeoutList(): Promise<any> {
		const timeoutedMembers: any[] = [];

		const guildMembers: any = await this.interaction.guild!.members.fetch().catch((): void => {});
		if(!guildMembers){
			const cantFetchMembersEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:cantFetchMembers"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [cantFetchMembersEmbed] });
		}

		guildMembers.forEach((member: any): void => {
			if(member.communicationDisabledUntil){
				timeoutedMembers.push(member);
			}
		});

		if(!timeoutedMembers.length){
			const noTimeoutedMembersEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:noTimeoutedMembers"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [noTimeoutedMembersEmbed] });
		}

		const timeoutedUsersText: string[] = [];
		for(const timeoutedMember of timeoutedMembers){
			const timeoutedUntilText: string = this.client.utils.getDiscordTimestamp(timeoutedMember.communicationDisabledUntil, "F");
			const timeoutedUserText: string =
				this.client.emotes.timeout + " " + timeoutedMember.toString() + "\n" +
				this.client.emotes.arrow + " " + this.translate("until") + " " + timeoutedUntilText;
			timeoutedUsersText.push(timeoutedUserText);
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			5,
			timeoutedUsersText,
			this.translate("list:title"),
			this.translate("list:empty"),
		);
	}
}
