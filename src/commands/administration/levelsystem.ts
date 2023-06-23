import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, ChannelType, EmbedBuilder } from "discord.js";

export default class LevelsystemCommand extends BaseCommand {
    public constructor(client: BaseClient) {
        super(client, {
            name: "levelsystem",
            description: "Verwaltet das Levelsystem des Servers",
            memberPermissions: ["ManageGuild"],
            cooldown: 2 * 1000,
            dirname: __dirname,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addSubcommand((subcommand: any) => subcommand
                            .setName("status")
                            .setDescription("Legt fest, ob das Levelsystem aktiviert oder deaktiviert ist")
                            .addStringOption((option: any) => option
                                .setName("status")
                                .setRequired(true)
                                .setDescription("Wähle einen Status")
                                .addChoices(
                                    { name: "an", value: "true"},
                                    { name: "aus", value: "false"}
                                )
                            )
                        )
                        .addSubcommand((subcommand: any) => subcommand
                            .setName("channel")
                            .setDescription("Bestimmt in welchem Channel Level-Up Nachrichten gesendet werden")
                            .addChannelOption((option: any) => option
                                .setName("channel")
                                .setDescription("Wähle einen Channel (wenn jeweils aktueller Channel gewünscht, leer lassen)")
                                .setRequired(false)
                                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
                            )
                        )
                        .addSubcommand((subcommand: any) => subcommand
                            .setName("nachricht")
                            .setDescription("Setzt die Level-Up Nachricht")
                            .addStringOption((option: any) => option
                                .setName("nachricht")
                                .setDescription("Lege die Nachricht fest")
                                .setRequired(true)
                            )
                        )
                        .addSubcommand((subcommand: any) => subcommand
                            .setName("rollen")
                            .setDescription("Legt Rollen fest, die bei Erreichen eines bestimmten Levels vergeben werden")
                            .addStringOption((option: any) => option
                                .setName("aktion")
                                .setDescription("Wähle eine Aktion")
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
                            .addIntegerOption((option: any) => option
                                .setName("level")
                                .setDescription("Bei welchem Level die Rolle vergeben wird")
                                .setRequired(false)
                                .setMinValue(1)
                                .setMaxValue(1000)
                            )
                        )
                        .addSubcommand((subcommand: any) => subcommand
                            .setName("doppelxp")
                            .setDescription("Bestimmt, welche Rollen doppeltes XP bekommen")
                            .addStringOption((option: any) => option
                                .setName("aktion")
                                .setDescription("Wähle eine Aktion")
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
                        )
                        .addSubcommand((subcommand: any) => subcommand
                            .setName("xp")
                            .setDescription("Definiere die minimale und maximale Anzahl an XP, die pro Nachricht vergeben werden können")
                            .addIntegerOption((option: any) => option
                                .setName("min")
                                .setDescription("Wähle die minimale Anzahl an XP")
                                .setRequired(true)
                                .setMinValue(1)
                                .setMaxValue(500)
                            )
                            .addIntegerOption((option: any) => option
                                .setName("max")
                                .setDescription("Wähle die maximale Anzahl an XP")
                                .setRequired(true)
                                .setMinValue(1)
                                .setMaxValue(500)
                            )
                        )
                        .addSubcommand((subcommand: any) => subcommand
                            .setName("variablen")
                            .setDescription("Listet alle Variablen, die in der Level-Up Nachricht verwendet werden können")
                        )
                        .addSubcommand((subcommand: any) => subcommand
                            .setName("test")
                            .setDescription("Testet die Level-Up Nachricht")
                        )
                        .addSubcommand((subcommand: any) => subcommand
                            .setName("exclude")
                            .setDescription("Fügt einen Channel oder eine Rolle zur Blacklist hinzu")
                            .addStringOption((option: any) => option
                                .setName("aktion")
                                .setDescription("Wähle eine Aktion")
                                .setRequired(true)
                                .addChoices(
                                    { name: "hinzufügen", value: "add" },
                                    { name: "entfernen", value: "remove" },
                                    { name: "liste", value: "list" }
                                )
                            )
                            .addChannelOption((option: any) => option
                                .setName("channel")
                                .setDescription("Wähle einen Channel")
                                .setRequired(false)
                                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
                            )
                            .addRoleOption((option: any) => option
                                .setName("rolle")
                                .setDescription("Wähle eine Rolle")
                                .setRequired(false)
                            )
                        )
            }
        });
    }

    private interaction: any;

    public async dispatch(interaction: any, data: any): Promise<void> {
        this.interaction = interaction;

        const subcommand = interaction.options.getSubcommand();

        switch(subcommand){
            case "status":
                await this.setStatus(interaction.options.getString("status"), data);
                break;
            case "channel":
                await this.setChannel(interaction.options.getChannel("channel"), data);
                break;
            case "nachricht":
                await this.setMessage(interaction.options.getString("nachricht"), data);
                break;
            case "rollen":
                const levelroleAction = interaction.options.getString("aktion");
                switch(levelroleAction){
                    case "add":
                        await this.addRole(interaction.options.getRole("rolle"), interaction.options.getInteger("level"), data);
                        break;
                    case "remove":
                        await this.removeRole(interaction.options.getRole("rolle"), data);
                        break;
                    case "list":
                        await this.listRoles(data);
                        break;
                }
                break;
            case "doppelxp":
                const doubleXpAction = interaction.options.getString("aktion");
                switch(doubleXpAction){
                    case "add":
                        await this.addDoubleXp(interaction.options.getRole("rolle"), data);
                        break;
                    case "remove":
                        await this.removeDoubleXp(interaction.options.getRole("rolle"), data);
                        break;
                    case "list":
                        await this.listDoubleXp(data);
                        break;
                }
                break;
            case "xp":
                await this.setXp(interaction.options.getInteger("min"), interaction.options.getInteger("max"), data);
                break;
            case "variablen":
                await this.listVariables();
                break;
            case "test":
                await this.sendPreview(data);
                break;
            case "exclude":
                const excludeAction = interaction.options.getString("aktion");
                switch(excludeAction){
                    case "add":
                        await this.addExclude(interaction.options.getChannel("channel"), interaction.options.getRole("rolle"), data);
                        break;
                    case "remove":
                        await this.removeExclude(interaction.options.getChannel("channel"), interaction.options.getRole("rolle"), data);
                        break;
                    case "list":
                        await this.listExcluded(data);
                        break;
                }
        }
    }

    private async setStatus(status: any, data: any): Promise<void>{
        /* Status is already set */
        if(data.guild.settings.levels.enabled === JSON.parse(status)){
            const text: string = JSON.parse(status) ? "aktiviert" : "deaktiviert";
            const infoEmbed: EmbedBuilder = this.client.createEmbed("Das Levelsystem ist bereits {0}.", "error", "error", text);
            return this.interaction.followUp({ embeds: [infoEmbed] });
        }

        /* Save to database */
        data.guild.settings.levels.enabled = JSON.parse(status);
        data.guild.markModified("settings.levels.enabled");
        await data.guild.save();
        const text: string = JSON.parse(status) ? "aktiviert" : "deaktiviert";
        const successEmbed: EmbedBuilder = this.client.createEmbed("Das Levelsystem wurde {0}.", "success", "success", text);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    private async setChannel(channel: any, data: any): Promise<void> {
        /* Levelsystem is disabled */
        if(!data.guild.settings.levels.enabled){
            const errorEmbed: EmbedBuilder = this.client.createEmbed("Das Levelsystem ist deaktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        /* Save to database */
        data.guild.settings.levels.channel = channel ? channel.id : null;
        data.guild.markModified("settings.levels.channel");
        await data.guild.save();

        const text: string = channel ? "in " + channel.toString() : "im jeweils aktuellen Channel";
        const successEmbed: EmbedBuilder = this.client.createEmbed("Level-Up Nachrichten kommen absofort {0}.", "success", "success", text);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    private async setMessage(message: string, data: any): Promise<void> {
        /* Levelsystem is disabled */
        if(!data.guild.settings.levels.enabled){
            const errorEmbed: EmbedBuilder = this.client.createEmbed("Das Levelsystem ist deaktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        /* Message is too long */
        if(message.length > 2000){
            const errorEmbed: EmbedBuilder = this.client.createEmbed("Die Level-Nachricht darf maximal 2.000 Zeichen lang sein.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        /* Save to database */
        data.guild.settings.levels.message = message;
        data.guild.markModified("settings.levels.message");
        await data.guild.save();

        const successEmbed: EmbedBuilder = this.client.createEmbed("Die Level-Up Nachricht wurde geändert.", "success", "success");
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    private async addRole(role: any, level: any, data: any): Promise<void> {
        /* Levelsystem is disabled */
        if(!data.guild.settings.levels.enabled){
            const errorEmbed: EmbedBuilder = this.client.createEmbed("Das Levelsystem ist deaktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        /* Invalid options */
        if(!role || !role.id || !level){
            const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Du musst eine Rolle und ein Level eingeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        /* Role is already added */
        if(data.guild.settings.levels.roles.find((r: any): boolean => r.role === role.id)){
            const alreadyAddedEmbed: EmbedBuilder = this.client.createEmbed("Diese Rolle ist bereits als Levelrolle hinzugefügt.", "error", "error");
            return this.interaction.followUp({ embeds: [alreadyAddedEmbed] });
        }

        /* Role is @everyone */
        if(role.id === this.interaction.guild.roles.everyone.id){
            const everyoneEmbed: EmbedBuilder = this.client.createEmbed("Die @everyone Rolle kann nicht als eine Levelrolle hinzugefügt werden.", "error", "error");
            return this.interaction.followUp({ embeds: [everyoneEmbed] });
        }

        /* Role is managed */
        if(role.managed){
            const roleIsManagedEmbed: EmbedBuilder = this.client.createEmbed("Rollen welche durch eine Integration verwaltet werden, können nicht als Levelrolle hinzugefügt werden.", "error", "error");
            return this.interaction.followUp({ embeds: [roleIsManagedEmbed] });
        }

        /* Role is too high */
        if(this.interaction.guild.members.me.roles.highest.position <= role.position){
            const roleIsTooHighEmbed: EmbedBuilder = this.client.createEmbed("Da {0} eine höhere oder gleiche Position wie meine höchste Rolle ({1}) hat, kann sie nicht als Levelrolle hinzugefügt werden.", "error", "error", role, this.interaction.guild.members.me.roles.highest);
            return this.interaction.followUp({ embeds: [roleIsTooHighEmbed] });
        }

        /* Save to database */
        data.guild.settings.levels.roles.push({
            role: role.id,
            level: level
        });
        data.guild.markModified("settings.levels.roles");
        await data.guild.save();

        const successEmbed: EmbedBuilder = this.client.createEmbed("{0} wurde als Levelrolle hinzugefügt.", "success", "success", role);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    private async removeRole(role: any, data: any): Promise<void> {
        /* Levelsystem is disabled */
        if(!data.guild.settings.levels.enabled){
            const errorEmbed: EmbedBuilder = this.client.createEmbed("Das Levelsystem ist deaktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        /* Invalid options */
        if(!role || !role.id){
            const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Du musst eine Rolle eingeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        /* Role is not a level role */
        if(!data.guild.settings.levels.roles.find((r: any): boolean => r.role === role.id)){
            const isNoLevelroleEmbed: EmbedBuilder = this.client.createEmbed("{0} ist keine Levelrolle.", "error", "error", role);
            return this.interaction.followUp({ embeds: [isNoLevelroleEmbed] });
        }

        /* Save to database */
        data.guild.settings.levels.roles = data.guild.settings.levels.roles.filter((r: any): boolean => r.role !== role.id);
        data.guild.markModified("settings.levels.roles");
        await data.guild.save();

        const successEmbed: EmbedBuilder = this.client.createEmbed("{0} wurde als Levelrolle entfernt.", "success", "success", role);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    private async listRoles(data: any): Promise<void> {
        let response: any = data.guild.settings.levels.roles;
        const levelroles: any[] = [];

        for(let i: number = 0; i < response.length; i++){
            const cachedRole = this.interaction.guild.roles.cache.get(response[i].role);
            if(cachedRole) levelroles.push(" Rolle: " + cachedRole.toString() + "\n" + this.client.emotes.arrow + " Level: " + response[i].level);
        }

        await this.client.utils.sendPaginatedEmbed(this.interaction, 5, levelroles, "Levelrollen", "Es sind keine Levelrollen vorhanden", "ping");
    }

    private async addDoubleXp(role: any, data: any): Promise<void> {
        /* Levelsystem is disabled */
        if(!data.guild.settings.levels.enabled){
            const errorEmbed: EmbedBuilder = this.client.createEmbed("Das Levelsystem ist deaktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        /* Invalid options */
        if(!role || !role.id){
            const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Du musst eine Rolle eingeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        /* Role is already added */
        if(data.guild.settings.levels.doubleXP.includes(role.id)){
            const alreadyAddedEmbed: EmbedBuilder = this.client.createEmbed("Diese Rolle ist bereits als Doppel-XP Rolle hinzugefügt.", "error", "error");
            return this.interaction.followUp({ embeds: [alreadyAddedEmbed] });
        }

        /* Role is @everyone */
        if(role.id === this.interaction.guild.roles.everyone.id){
            const everyoneEmbed: EmbedBuilder = this.client.createEmbed("Die @everyone Rolle kann nicht als eine Doppel-XP Rolle hinzugefügt werden.", "error", "error");
            return this.interaction.followUp({ embeds: [everyoneEmbed] });
        }

        /* Role is managed */
        if(role.managed){
            const roleIsManagedEmbed: EmbedBuilder = this.client.createEmbed("Rollen welche durch eine Integration verwaltet werden, können nicht als Doppel-XP Rolle hinzugefügt werden.", "error", "error");
            return this.interaction.followUp({ embeds: [roleIsManagedEmbed] });
        }

        /* Save to database */
        data.guild.settings.levels.doubleXP.push(role.id);
        data.guild.markModified("settings.levels.doubleXP");
        await data.guild.save();

        const successEmbed: EmbedBuilder = this.client.createEmbed("{0} wurde als Doppel-XP Rolle hinzugefügt.", "success", "success", role);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    private async removeDoubleXp(role: any, data: any): Promise<void> {
        /* Levelsystem is disabled */
        if(!data.guild.settings.levels.enabled){
            const errorEmbed : EmbedBuilder = this.client.createEmbed("Das Levelsystem ist deaktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        /* Invalid options */
        if(!role || !role.id){
            const invalidOptionsEmbed: EmbedBuilder = this.client.createEmbed("Du musst eine Rolle eingeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        /* Role is not a double xp role */
        if(!data.guild.settings.levels.doubleXP.includes(role.id)){
            const isNoDoubleXPRoleEmbed: EmbedBuilder = this.client.createEmbed("{0} ist keine Doppel-XP Rolle.", "error", "error", role);
            return this.interaction.followUp({ embeds: [isNoDoubleXPRoleEmbed] });
        }

        /* Save to database */
        data.guild.settings.levels.doubleXP = data.guild.settings.levels.doubleXP.filter((r: any): boolean => r !== role.id);
        data.guild.markModified("settings.levels.doubleXP");
        await data.guild.save();

        const successEmbed: EmbedBuilder = this.client.createEmbed("{0} wurde als Doppel-XP Rolle entfernt.", "success", "success", role);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    private async listDoubleXp(data: any): Promise<void> {
        let response: any = data.guild.settings.levels.doubleXP;
        const doublexpRoles: any[] = [];

        for(let i: number = 0; i < response.length; i++){
            const cachedRole: any = this.interaction.guild.roles.cache.get(response[i]);
            if(cachedRole) doublexpRoles.push(cachedRole.toString());
        }

        await this.client.utils.sendPaginatedEmbed(this.interaction, 5, doublexpRoles, "Doppel-XP Rollen", "Es sind keine Doppel-XP Rollen vorhanden", "ping");
    }

    private async setXp(min: number, max: number, data: any): Promise<void> {
        /* Levelsystem is disabled */
        if(!data.guild.settings.levels.enabled){
            const errorEmbed: EmbedBuilder = this.client.createEmbed("Das Levelsystem ist deaktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        /* Min is higher than max */
        if(min > max){
            const errorEmbed: EmbedBuilder = this.client.createEmbed("Der Minimalwert darf den Maximalwert nicht überschreiten.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        /* Save to database */
        data.guild.settings.levels.xp = {
            min: min,
            max: max
        };
        data.guild.markModified("settings.levels.xp");
        await data.guild.save();

        const successEmbed: EmbedBuilder = this.client.createEmbed("Der Minimalwert wurde auf {0} und der Maximalwert auf {1} gesetzt.", "success", "success", min, max);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    private async listVariables(): Promise<void> {
        const variables: string[] = [
            "**{level}** - Zeigt das neue Level an",
            "**{user}** - Erwähnt das Mitglied",
            "**{user:username}** - Der Nutzername des Mitglieds",
            "**{user:displayname}** - Der Anzeigename des Mitglieds",
            "**{user:id}** - ID des Mitglieds",
            "**{server:name}** - Name des Servers",
            "**{server:id}** - ID des Servers",
            "**{server:membercount}** - Anzahl an Mitgliedern des Servers"
        ];
        await this.client.utils.sendPaginatedEmbed(this.interaction, 10, variables, "Verfügbare Variablen", "Es sind keine Variablen verfügbar", "shine");
    }

    private async sendPreview(data: any): Promise<void> {
        /* Levelsystem is disabled */
        if(!data.guild.settings.levels.enabled){
            const notEnabledEmbed: EmbedBuilder = this.client.createEmbed("Das Levelsystem ist deaktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [notEnabledEmbed] });
        }

        /* No message set */
        if(!data.guild.settings.levels.message){
            const noMessageEmbed: EmbedBuilder = this.client.createEmbed("Es wurde keine Nachricht für die Level-Up Nachricht festgelegt.", "error", "error");
            return this.interaction.followUp({ embeds: [noMessageEmbed] });
        }

        const member = this.interaction.member;
        const self = this;
        function parseMessage(str: string): string {
            return str
                .replaceAll(/{level}/g, String(1))
                .replaceAll(/{user}/g, member)
                .replaceAll(/{user:username}/g, member.user.username)
                .replaceAll(/{user:displayname}/g, member.user.displayName)
                .replaceAll(/{user:id}/g, member.user.id)
                .replaceAll(/{server:name}/g, self.interaction.guild.name)
                .replaceAll(/{server:id}/g, self.interaction.guild.id)
                .replaceAll(/{server:membercount}/g, self.interaction.guild.memberCount)
        }

        const channel: any = this.client.channels.cache.get(data.guild.settings.levels.channel) || this.interaction.channel;
        const message: string = parseMessage(data.guild.settings.levels.message);

        try {
            await channel.send({ content: message });
            const successEmbed: EmbedBuilder = this.client.createEmbed("Die Level-Up Nachricht wurde getestet.", "success", "success");
            return this.interaction.followUp({ embeds: [successEmbed] });
        }catch(e){
            const errorEmbed: EmbedBuilder = this.client.createEmbed("Die Level-Up Nachricht konnte nicht gesendet werden.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }
    }

    private async addExclude(channel: any, role: any, data: any): Promise<void> {
        if(!data.guild.settings.levels.exclude){
            data.guild.settings.levels.exclude = {
                channels: [],
                roles: []
            };
            data.guild.markModified("settings.levels.exclude");
            await data.guild.save();
        }

        /* Levelsystem is disabled */
        if(!data.guild.settings.levels.enabled){
            const errorEmbed: EmbedBuilder = this.client.createEmbed("Das Levelsystem ist deaktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        const toExclude = channel || role;
        /* No channel or role set */
        if(!toExclude || toExclude.constructor.name !== "TextChannel" && toExclude.constructor.name !== "Role"){
            const errorEmbed: EmbedBuilder = this.client.createEmbed("Bitte gib einen Channel oder eine Rolle an.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        if(toExclude.constructor.name === "TextChannel"){
            /* Channel is already on the blacklist */
            if(data.guild.settings.levels.exclude.channels.includes(toExclude.id)){
                const errorEmbed: EmbedBuilder = this.client.createEmbed("{0} ist bereits auf der Blacklist.", "error", "error", toExclude);
                return this.interaction.followUp({ embeds: [errorEmbed] });
            }

            /* Save to database */
            data.guild.settings.levels.exclude.channels.push(toExclude.id);
            data.guild.markModified("settings.levels.exclude.channels");
            await data.guild.save();
            const successEmbed: EmbedBuilder = this.client.createEmbed("{0} wurde zur Blacklist hinzugefügt.", "success", "success", toExclude);
            return this.interaction.followUp({ embeds: [successEmbed] });
        }else if(toExclude.constructor.name === "Role"){
            /* Role is already on the blacklist */
            if(data.guild.settings.levels.exclude.roles.includes(toExclude.id)){
                const errorEmbed: EmbedBuilder = this.client.createEmbed("{0} ist bereits auf der Blacklist.", "error", "error", toExclude);
                return this.interaction.followUp({ embeds: [errorEmbed] });
            }

            /* Role is @everyone */
            if(toExclude.id === this.interaction.guild.roles.everyone.id){
                const everyoneEmbed: EmbedBuilder = this.client.createEmbed("Die @everyone Rolle kann nicht auf die Blacklist gesetzt werden.", "error", "error");
                return this.interaction.followUp({ embeds: [everyoneEmbed] });
            }

            /* Role is managed */
            if(toExclude.managed){
                const roleIsManagedEmbed: EmbedBuilder = this.client.createEmbed("Rollen welche durch eine Integration verwaltet werden, können nicht auf die Blacklist gesetzt werden.", "error", "error");
                return this.interaction.followUp({ embeds: [roleIsManagedEmbed] });
            }

            /* Save to database */
            data.guild.settings.levels.exclude.roles.push(toExclude.id);
            data.guild.markModified("settings.levels.exclude.roles");
            await data.guild.save();
            const successEmbed: EmbedBuilder = this.client.createEmbed("{0} wurde zur Blacklist hinzugefügt.", "success", "success", toExclude);
            return this.interaction.followUp({ embeds: [successEmbed] });
        }
    }

    private async removeExclude(channel: any, role: any, data: any): Promise<void> {
        if(!data.guild.settings.levels.exclude){
            data.guild.settings.levels.exclude = {
                channels: [],
                roles: []
            };
            data.guild.markModified("settings.levels.exclude");
            await data.guild.save();
        }

        /* Levelsystem is disabled */
        if(!data.guild.settings.levels.enabled){
            const errorEmbed: EmbedBuilder = this.client.createEmbed("Das Levelsystem ist deaktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        const toExclude = channel || role;
        /* No channel or role set */
        if(!toExclude || toExclude.constructor.name !== "TextChannel" && toExclude.constructor.name !== "Role"){
            const errorEmbed: EmbedBuilder = this.client.createEmbed("Bitte gib einen Channel oder eine Rolle an.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        if(toExclude.constructor.name === "TextChannel"){
            /* Channel is not on the blacklist */
            if(!data.guild.settings.levels.exclude.channels.includes(toExclude.id)){
                const errorEmbed: EmbedBuilder = this.client.createEmbed("{0} ist nicht auf der Blacklist.", "error", "error", toExclude);
                return this.interaction.followUp({ embeds: [errorEmbed] });
            }

            /* Save to database */
            data.guild.settings.levels.exclude.channels = data.guild.settings.levels.exclude.channels.filter((c: any): boolean => c !== toExclude.id);
            data.guild.markModified("settings.levels.exclude.channels");
            await data.guild.save();
            const successEmbed: EmbedBuilder = this.client.createEmbed("{0} wurde von der Blacklist entfernt.", "success", "success", toExclude);
            return this.interaction.followUp({ embeds: [successEmbed] });
        }else if(toExclude.constructor.name === "Role"){
            /* Role is not on the blacklist */
            if(!data.guild.settings.levels.exclude.roles.includes(toExclude.id)){
                const errorEmbed = this.client.createEmbed("{0} ist nicht auf der Blacklist.", "error", "error", toExclude);
                return this.interaction.followUp({ embeds: [errorEmbed] });
            }

            /* Save to database */
            data.guild.settings.levels.exclude.roles = data.guild.settings.levels.exclude.roles.filter((r: any): boolean => r !== toExclude.id);
            data.guild.markModified("settings.levels.exclude.roles");
            await data.guild.save();
            const successEmbed: EmbedBuilder = this.client.createEmbed("{0} wurde von der Blacklist entfernt.", "success", "success", toExclude);
            return this.interaction.followUp({ embeds: [successEmbed] });
        }
    }

    private async listExcluded(data: any): Promise<void> {
        if(!data.guild.settings.levels.exclude){
            data.guild.settings.levels.exclude = {
                channels: [],
                roles: []
            };
            data.guild.markModified("settings.levels.exclude");
            await data.guild.save();
        }

        let response = data.guild.settings.levels.exclude;
        const excluded: any[] = [];

        for(let i: number = 0; i < response.roles.length; i++){
            const cachedRole = this.interaction.guild.roles.cache.get(response.roles[i]);
            if(cachedRole) excluded.push(this.client.emotes.ping + " " + cachedRole.toString());
        }

        for(let i: number = 0; i < response.channels.length; i++){
            const cachedChannel = this.interaction.guild.channels.cache.get(response.channels[i]);
            if(cachedChannel) excluded.push(this.client.emotes.channel + " " + cachedChannel.toString());
        }

        await this.client.utils.sendPaginatedEmbed(this.interaction, 5, excluded, "Level-Blacklist", "Es sind keine Rollen oder Channel auf der Blacklist vorhanden", null);
    }
}