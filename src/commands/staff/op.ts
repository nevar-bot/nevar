import { NevarCommand } from "@core/NevarCommand.js";
import { NevarClient } from "@core/NevarClient";

export default class OpCommand extends NevarCommand {
	public constructor(client: NevarClient) {
		super(client, {
			name: "op",
			description: "Fierce OP Command",
			localizedDescriptions: {
				de: "Heftiger OP Command"
			},
			staffOnly: true,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: false,
				data: null,
			},
		});
	}

	public async dispatch(message: any, args: any[], data: any): Promise<void> {
		this.message = message;
		this.guild = message.guild;
		this.data = data;
		await this.op(args.join(" "));
	}

	private async op(user: string): Promise<any> {
		const member: any = (await this.message.guild!.resolveMember(user)) || this.message.member;
		return this.message.reply({
			content: "*Made " + member.user.username + " a server operator*",
		});
	}
}
