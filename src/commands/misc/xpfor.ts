import BaseCommand from "@structures/BaseCommand.js";
import BaseClient from "@structures/BaseClient.js";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import path from "path";


export default class XpForCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "xpfor",
			description: "Erfahre, wieviel XP du für ein bestimmtes Level benötigst",
			localizedDescriptions: {
				de: "Erfahre, wieviel XP du für ein bestimmtes Level benötigst",
			},
			cooldown: 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addIntegerOption((option: any) =>
					option
						.setName("level")
						.setDescription("Enter the level")
						.setDescriptionLocalization("de", "Gib das Level an")
						.setMinValue(1)
						.setRequired(true),
				),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
		await this.sendXpFor(interaction.options.getInteger("level"));
	}

	private async sendXpFor(level: number): Promise<any> {
		const minXp = this.data.guild.settings.levels.xp.min;
		const maxXp = this.data.guild.settings.levels.xp.max;
		const averageXp: number = Math.round((minXp + maxXp) / 2);
		const neededXp: string = this.client.format(this.client.levels.xpFor(level));

		const neededMessages: string = this.client.format(Math.round(this.client.levels.xpFor(level) / averageXp));

		const text: string =
			this.translate("neededXp", { level, neededXp, neededMessages });

		const xpForEmbed: EmbedBuilder = this.client.createEmbed(text, "arrow", "normal");
		return this.interaction.followUp({ embeds: [xpForEmbed] });
	}
}
