import { PermissionsBitField, REST, Routes, ContextMenuCommandBuilder } from "discord.js";
import { NevarClient } from "@core/NevarClient";

export class InteractionManager {
	private client: NevarClient;

	public constructor(client: NevarClient) {
		this.client = client;
	}

	public async register(): Promise<any> {
		this.client.logger.log("Trying to register interactions...");

		const rest: REST = new REST({ version: "10" }).setToken(this.client.config.general["BOT_TOKEN"]);
		const interactions: Array<any> = [];

		for (const [_, command] of this.client.commands) {
			const { slashCommand, help, conf } = command;
			if (!slashCommand || !slashCommand.addCommand) continue;

			const slashData = slashCommand.data;
			if (!slashData) continue;

			await slashData
				.setName(help.name)
				.setDescription(help.description)
				.setDescriptionLocalizations(help.localizedDescriptions);

			if (conf.memberPermissions.length >= 1) {
				const PermissionsField: PermissionsBitField = new PermissionsBitField();
				// @ts-ignore
				conf.memberPermissions.forEach((perm: any): any => PermissionsField.add(PermissionsBitField.Flags[perm]));
				slashData.setDefaultMemberPermissions(PermissionsField.bitfield);
			}

			interactions.push(slashData.toJSON());
		}

		for (const [, contextMenu] of this.client.contextMenus) {
			const { help, conf } = contextMenu;
			if (!contextMenu) continue;

			const contextData: ContextMenuCommandBuilder = new ContextMenuCommandBuilder()
				.setName(help.name)
				.setType(conf.type);

			if (conf.memberPermissions.length >= 1) {
				const PermissionsField: PermissionsBitField = new PermissionsBitField();
				// @ts-ignore
				conf.memberPermissions.forEach((perm: any): any => PermissionsField.add(PermissionsBitField.Flags[perm]));
				contextData.setDefaultMemberPermissions(PermissionsField.bitfield);
			}

			interactions.push(contextData.toJSON());
		}

		const response: any = { success: false, interactionsRegistered: 0, callback: null };

		try {
			await rest.put(Routes.applicationCommands(this.client.user!.id), { body: interactions });
			response.success = true;
			response.interactionsRegistered = interactions.length;
			this.client.logger.success(`Registered ${interactions.length} interactions`);
		} catch (error) {
			response.callback = error;
			this.client.logger.error("Error while registering interactions", error);
		}

		return response;
	}
}