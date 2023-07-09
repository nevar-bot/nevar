import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default class RemoveWarnCommand extends BaseCommand
{
	public constructor(client: BaseClient)
	{
		super(client, {
			name: "remove-warn",
			description: "Entfernt eine Verwarnung eines Mitglieds",
			memberPermissions: ["KickMembers"],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addUserOption((option: any) => option
						.setName("mitglied")
						.setDescription("Wähle ein Mitglied")
						.setRequired(true)
					)
					.addIntegerOption((option: any) => option
						.setName("nummer")
						.setDescription("Gib die Nummer der Verwarnung an")
						.setRequired(true)
						.setMinValue(1)
					)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void>
	{
		this.interaction = interaction;
		await this.removeWarn(interaction.options.getUser("mitglied"), interaction.options.getInteger("nummer"));
	}

	private async removeWarn(user: any, num: number): Promise<void>
	{
		const member = await this.interaction.guild.resolveMember(user.id);
		if (!member) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Du musst ein Mitglied angeben.", "error", "error");
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		if (user.id === this.interaction.user.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Du kannst nicht eine Verwarnung von dir entfernen.", "error", "error");
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		const targetData: any = await this.client.findOrCreateMember(member.user.id, this.interaction.guild.id);

		if (!targetData.warnings.list[num - 1]) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Du musst eine gültige Nummer angeben.", "error", "error");
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		targetData.warnings.list = targetData.warnings.list.filter((warn: any): boolean => warn !== targetData.warnings.list[num - 1]);
		targetData.markModified("warnings");
		await targetData.save();

		const logText: string =
			"### " + this.client.emotes.delete + " Verwarnung von " + member.user.username + " entfernt\n\n" +
			this.client.emotes.user + " Moderator: " + this.interaction.user.username + "\n" +
			this.client.emotes.text + " Warn-Nr.: " + num;
		const logEmbed: EmbedBuilder = this.client.createEmbed(logText, null, "normal");
		logEmbed.setThumbnail(member.user.displayAvatarURL());
		await this.interaction.guild.logAction(logEmbed, "moderation");


		const successEmbed: EmbedBuilder = this.client.createEmbed("Die {0}. Verwarnung von {1} wurde entfernt.", "success", "success", num, member.user.username);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}
}