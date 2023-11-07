import {
	PermissionsBitField,
	REST,
	Routes,
	ContextMenuCommandBuilder,
	SlashCommandSubcommandBuilder
} from "discord.js";

async function registerInteractions(client: any): Promise<any> {
	client.logger.log("Start registering interactions...");

	const rest: REST = new REST({ version: "10" }).setToken(client.token);
	const interactions: Array<any> = [];

	/* Slash commands */
	for (const command of client.commands) {
		const commandData: any = command[1];
		if (!commandData || !commandData.slashCommand || !commandData.slashCommand.addCommand)
			continue;
		const slashData = commandData.slashCommand.data;
		if (!slashData) continue;

		await slashData.setName(commandData.help.name);
		await slashData.setDescription(commandData.help.description);
		for (const locale in commandData.help.localizedDescriptions) {
			if (commandData.help.localizedDescriptions.hasOwnProperty(locale)) {
				const description = commandData.help.localizedDescriptions[locale];
				slashData.setDescriptionLocalization(locale, description);
			}
		}

		if (commandData.conf.memberPermissions.length >= 1) {
			const PermissionsField: PermissionsBitField = new PermissionsBitField();
			for (const neededMemberPermission of commandData.conf.memberPermissions) {
				// @ts-ignore - Element implicitly has an 'any' type because expression of type 'any' can't be used to index type
				PermissionsField.add(PermissionsBitField.Flags[neededMemberPermission]);
			}
			slashData.setDefaultMemberPermissions(PermissionsField.bitfield);
		}

		interactions.push(slashData.toJSON());
	}

	/* Context menus  */
	for (const contextMenu of client.contextMenus) {
		const contextMenuData: any = contextMenu[1];
		if (!contextMenuData) continue;

		const contextData: ContextMenuCommandBuilder = new ContextMenuCommandBuilder()
			.setName(contextMenuData.help.name)
			.setType(contextMenuData.conf.type);

		if (contextMenuData.conf.memberPermissions.length >= 1) {
			const PermissionsField: PermissionsBitField = new PermissionsBitField();
			for (const neededMemberPermission of contextMenuData.conf.memberPermissions) {
				// @ts-ignore - Element implicitly has an 'any' type because expression of type 'any' can't be used to index type
				PermissionsField.add(PermissionsBitField.Flags[neededMemberPermission]);
			}
			contextData.setDefaultMemberPermissions(PermissionsField.bitfield);
		}

		interactions.push(contextData.toJSON());
	}

	const response: any = {
		success: false,
		interactionsRegistered: 0,
		callback: null
	};

	await rest
		.put(Routes.applicationCommands(client.user.id), { body: interactions })
		.then(async () => {
			response.success = true;
			response.interactionsRegistered = interactions.length;
			client.logger.success("Registered " + interactions.length + " interactions");
		})
		.catch(async (e: any) => {
			response.callback = e;
			client.logger.error("Error while registering interactions", e);
			client.alertException(
				e,
				null,
				null,
				"await <REST>.put(<Routes>.applicationCommands())"
			);
		});

	return response;
}

export default registerInteractions;
