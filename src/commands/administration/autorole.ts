import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default class AutoroleCommand extends BaseCommand {
    public constructor(client: BaseClient) {
        super(client, {
            name: "autorole",
            description: "Verwaltet die Rollen, welche neuen Mitgliedern automatisch gegeben werden",
            memberPermissions: ["ManageGuild"],
            botPermissions: ["ManageRoles"],
            cooldown: 1000,
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
                    .addRoleOption((option: any) => option
                        .setName("rolle")
                        .setDescription("Wähle eine Rolle")
                        .setRequired(false)
                    )
            }
        });
    }

    private interaction: any;

    public async dispatch(interaction: any, data: any): Promise<void> {
        this.interaction = interaction;

        const action: string = interaction.options.getString("aktion");
        switch(action){
            case "add":
                await this.addAutorole(interaction.options.getRole("rolle"), data);
                break;
            case "remove":
                await this.removeAutorole(interaction.options.getRole("rolle"), data);
                break;
            case "list":
                await this.showList(data);
                break;
            default:
                const unexpectedErrorEmbed: EmbedBuilder = this.client.createEmbed("Ein unerwarteter Fehler ist aufgetreten.", "error", "error");
                return this.interaction.followUp({ embeds: [unexpectedErrorEmbed] });
        }
    }

    private async addAutorole(role: any, data: any): Promise<void> {
        /* Invalid options */
        if(!role || !role.id){
            const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Du musst eine Rolle eingeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        /* Role is @everyone */
        if(role.id === this.interaction.guild.roles.everyone.id){
            const everyoneEmbed: EmbedBuilder = this.client.createEmbed("Die @everyone Rolle kann nicht als eine Autorolle hinzugefügt werden.", "error", "error");
            return this.interaction.followUp({ embeds: [everyoneEmbed] });
        }

        /* Role is managed */
        if(role.managed){
            const roleIsManagedEmbed: EmbedBuilder = this.client.createEmbed("Rollen welche durch eine Integration verwaltet werden, können nicht als Autorolle hinzugefügt werden.", "error", "error");
            return this.interaction.followUp({ embeds: [roleIsManagedEmbed] });
        }

        /* Role is higher than the bot's highest role */
        if(this.interaction.guild.members.me.roles.highest.position <= role.position){
            const roleIsTooHighEmbed: EmbedBuilder = this.client.createEmbed("Da {0} eine höhere oder gleiche Position wie meine höchste Rolle ({1}) hat, kann sie nicht als Autorolle hinzugefügt werden.", "error", "error", role, this.interaction.guild.members.me.roles.highest);
            return this.interaction.followUp({ embeds: [roleIsTooHighEmbed] });
        }

        /* Role is already an autorole */
        if(data.guild.settings.welcome.autoroles.includes(role.id)){
            const isAlreadyAutoroleEmbed: EmbedBuilder = this.client.createEmbed("{0} ist bereits eine Autorolle.", "error", "error", role);
            return this.interaction.followUp({ embeds: [isAlreadyAutoroleEmbed] });
        }

        /* Add to database */
        data.guild.settings.welcome.autoroles.push(role.id);
        data.guild.markModified("settings.welcome.autoroles");
        await data.guild.save();

        const successEmbed: EmbedBuilder = this.client.createEmbed("{0} wurde als Autorolle hinzugefügt.", "success", "success", role);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    private async removeAutorole(role: any, data: any): Promise<void> {
        /* Invalid options */
        if(!role || !role.id){
            const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Du musst eine Rolle angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        /* Role is not an autorole */
        if(!data.guild.settings.welcome.autoroles.includes(role.id)){
            const isNoAutoroleEmbed: EmbedBuilder = this.client.createEmbed("{0} ist keine Autorolle.", "error", "error", role);
            return this.interaction.followUp({ embeds: [isNoAutoroleEmbed] });
        }

        /* Remove from database */
        data.guild.settings.welcome.autoroles = data.guild.settings.welcome.autoroles.filter((r: any): boolean => r !== role.id);
        data.guild.markModified("settings.welcome.autoroles");
        await data.guild.save();

        const successEmbed: EmbedBuilder = this.client.createEmbed("{0} wurde als Autorolle entfernt.", "success", "success", role);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    private async showList(data: any): Promise<void>{
        let response: any = data.guild.settings.welcome.autoroles;
        const autorolesArray: any[] = [];

        for(let i: number = 0; i < response.length; i++){
            const cachedRole: any = this.interaction.guild.roles.cache.get(response[i]);
            if(cachedRole) autorolesArray.push(cachedRole.toString());
        }

        await this.client.utils.sendPaginatedEmbed(this.interaction, 5, autorolesArray, "Autorollen", "Es sind keine Autorollen vorhanden", "ping");
    }
}