import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";
import moment from "moment";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import path from "path";

export default class WarnlistCommand extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "warnlist",
			description: "Lists all warnings for a member",
			localizedDescriptions: {
				de: "Listet alle Verwarnungen eines Mitgliedes auf",
			},
			memberPermissions: ["KickMembers"],
			cooldown: 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addUserOption((option: any) =>
					option
						.setName("member")
						.setNameLocalization("de", "mitglied")
						.setDescription("Choose a member")
						.setDescriptionLocalization("de", "Wähle ein Mitglied")
						.setRequired(true),
				),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
		await this.listWarnings(interaction.options.getMember("member"));
	}

	private async listWarnings(member: any): Promise<any> {
		if (!member) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:memberIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		const targetData: any = await this.client.findOrCreateMember(member.user.id, this.interaction.guild!.id);

		const warnList: any[] = [];
		const warnings: any[] = [...targetData.warnings.list];
		const warnCount: number = targetData.warnings.count;

		let indicator: number = 0;
		for (const warn of warnings) {
			indicator++;
			const text: string =
				"### " + this.client.emotes.ban + " " +
				this.translate("warning") + " " + indicator + "\n" +
				this.client.emotes.arrow + " " +
				this.getBasicTranslation("moderator") + ": " + warn.moderator + "\n" +
				this.client.emotes.arrow + " " +
				this.getBasicTranslation("reason") + ": " + warn.reason + "\n" +
				this.client.emotes.arrow + " " +
				this.translate("warnedAt") + ": " + this.client.utils.getDiscordTimestamp(warn.date, "F") + "\n";
			warnList.push(text);
		}

		await this.client.utils.sendPaginatedEmbed(
			this.interaction,
			5,
			warnList,
			this.translate("list:title", { user: member.toString() }),
			this.translate("list:noWarningsYet", {user: member.toString() }),
		);
	}
}
