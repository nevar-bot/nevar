import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { EmbedBuilder, SlashCommandBuilder, ChannelType } from "discord.js";
import ems from "enhanced-ms";
const ms: any = ems("de");

export default class AutodeleteCommand extends BaseCommand
{
	public constructor(client: BaseClient)
	{
		super(client, {
			name: "autodelete",
			description: "Verwaltet das automatische Löschen von Nachrichten auf dem Server",
			memberPermissions: ["ManageGuild", "ManageMessages"],
			botPermissions: ["ManageMessages"],
			cooldown: 2 * 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addStringOption((option: any) => option
						.setName("aktion")
						.setDescription("Wähle aus den folgenden Aktionen")
						.setRequired(true)
						.addChoices(
							{ name: "hinzufügen", value: "add" },
							{ name: "entfernen", value: "remove" },
							{ name: "liste", value: "list" }
						)
					)
					.addChannelOption((option: any) => option
						.setName("channel")
						.setDescription("Wähle, für welchen Channel du die Aktion ausführen möchtest")
						.setRequired(false)
						.addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews, ChannelType.GuildForum, ChannelType.GuildPublicThread)
					)
					.addStringOption((option: any) => option
						.setName("zeit")
						.setRequired(false)
						.setDescription("Gib ein, nach welcher Zeit neue Nachrichten gelöscht werden sollen")
					)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void>
	{
		this.interaction = interaction;

		const action: string = interaction.options.getString("aktion");
		switch (action) {
			case "add":
				await this.addAutodelete(interaction.options.getChannel("channel"), interaction.options.getString("zeit"), data);
				break;
			case "remove":
				await this.removeAutodelete(interaction.options.getChannel("channel"), data);
				break;
			case "list":
				await this.showList(data);
				break;
			default:
				const unexpectedErrorEmbed: EmbedBuilder = this.client.createEmbed("Ein unerwarteter Fehler ist aufgetreten.", "error", "error");
				return this.interaction.followUp({ embeds: [unexpectedErrorEmbed] });
		}
	}

	private async addAutodelete(channel: any, time: string, data: any): Promise<void>
	{
		/* Invalid options */
		if (!time || !ms(time) || !channel || !channel.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Du musst einen Channel und eine Zeit eingeben.", "error", "error");
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* Already exists for this channel */
		if (data.guild.settings.autodelete.find((x: any): boolean => x.channel === channel.id)) {
			const alreadyExistsEmbed: EmbedBuilder = this.client.createEmbed("Für {0} ist bereits ein Autodelete eingerichtet.", "error", "error", channel);
			return this.interaction.followUp({ embeds: [alreadyExistsEmbed] });
		}

		const timeInMs = ms(time);
		const msInTime = ms(ms(time));

		/* Time is too short */
		if (timeInMs < 1000) {
			const tooShortEmbed: EmbedBuilder = this.client.createEmbed("Die Zeit muss mindestens 1 Sekunde betragen.", "error", "error");
			return this.interaction.followUp({ embeds: [tooShortEmbed] });
		}

		/* Time is too long */
		if (timeInMs > 7 * 24 * 60 * 60 * 1000) {
			const tooLongEmbed: EmbedBuilder = this.client.createEmbed("Die Zeit darf höchstens 7 Tage betragen.", "error", "error");
			return this.interaction.followUp({ embeds: [tooLongEmbed] });
		}

		/* Add to database */
		data.guild.settings.autodelete.push({
			channel: channel.id,
			time: timeInMs
		});
		data.guild.markModified("settings.autodelete");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed("In {0} werden neue Nachrichten absofort automatisch nach {1} gelöscht.", "success", "success", channel, msInTime);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async removeAutodelete(channel: any, data: any): Promise<void>
	{
		/* Invalid options */
		if (!channel || !channel.id) {
			const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Du musst einen Channel eingeben.", "error", "error");
			return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
		}

		/* No autodelete for this channel */
		if (!data.guild.settings.autodelete.find((x: any): boolean => x.channel === channel.id)) {
			const doesntExistEmbed: EmbedBuilder = this.client.createEmbed("In {0} ist kein Autodelete eingerichtet.", "error", "error", channel);
			return this.interaction.followUp({ embeds: [doesntExistEmbed] });
		}

		/* Remove from database */
		data.guild.settings.autodelete = data.guild.settings.autodelete.filter((x: any): boolean => x.channel !== channel.id);
		data.guild.markModified("settings.autodelete");
		await data.guild.save();

		const successEmbed: EmbedBuilder = this.client.createEmbed("In {0} werden neue Nachrichten nicht mehr automatisch gelöscht.", "success", "success", channel);
		return this.interaction.followUp({ embeds: [successEmbed] });
	}

	private async showList(data: any): Promise<void>
	{
		let response: any = data.guild.settings.autodelete;
		const autodeleteArray: any[] = [];

		for (let i: number = 0; i < response.length; i++) {
			if (typeof response[i] !== "object") continue;
			const cachedChannel: any = this.interaction.guild.channels.cache.get(response[i].channel);
			if (cachedChannel) autodeleteArray.push(" Channel: " + cachedChannel.toString() + "\n" + this.client.emotes.reminder + " Zeit: " + ms(response[i].time) + "\n");
		}

		await this.client.utils.sendPaginatedEmbed(this.interaction, 5, autodeleteArray, "Autodelete", "Es ist kein Autodelete eingestellt", "channel");
	}

}
