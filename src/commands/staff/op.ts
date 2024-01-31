import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";

export default class OpCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "op",
			description: "Fierce OP Command",
			localizedDescriptions: {
				de: "Heftiger OP Command"
			},
			staffOnly: true,
			dirname: __dirname,
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
