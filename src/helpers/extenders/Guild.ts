import {
	Guild,
	ChannelType,
	Collection,
	GuildBasedChannel,
	Role,
	GuildMember,
	EmbedBuilder
} from 'discord.js';

const ROLE_MENTION: RegExp = /<?@?&?(\d{17,20})>?/;
const CHANNEL_MENTION: RegExp = /<?#?(\d{17,20})>?/;
const MEMBER_MENTION: RegExp = /<?@?!?(\d{17,20})>?/;

declare module 'discord.js' {
	interface Guild {
		findMatchingChannels(query: string, type?: ChannelType[]): any;
		findMatchingRoles(query: string): any;
		resolveMember(query: string, exact?: boolean): Promise<any>;
		fetchMemberStats(): Promise<any>;
		logAction(
			embed: EmbedBuilder,
			type:
				| 'moderation'
				| 'member'
				| 'guild'
				| 'role'
				| 'thread'
				| 'channel'
		): Promise<any>;
	}
}

Guild.prototype.findMatchingChannels = function (
	query: string,
	type: ChannelType[]
): any {
	if (!this || !query) return [];

	// @ts-ignore - Property 'channels' does not exist on type 'never'
	const channelManager: Collection<any, any> = this.channels.cache.filter(
		(ch: GuildBasedChannel): any => type.includes(ch.type)
	);

	const patternMatch: RegExpExecArray | null =
		RegExp(CHANNEL_MENTION).exec(query);
	if (patternMatch) {
		const id: string = patternMatch[1];
		const channel: GuildBasedChannel = channelManager.find(
			(r): boolean => r.id === id
		);
		if (channel) return [channel];
	}

	const exact: Array<any> = [];
	const startsWith: Array<any> = [];
	const includes: Array<any> = [];
	channelManager.forEach((ch: any): void => {
		const lowerName: string = ch.name.toLowerCase();
		if (ch.name === query) exact.push(ch);
		if (lowerName.startsWith(query.toLowerCase())) startsWith.push(ch);
		if (lowerName.includes(query.toLowerCase())) includes.push(ch);
	});

	if (exact.length > 0) return exact;
	if (startsWith.length > 0) return startsWith;
	if (includes.length > 0) return includes;
	return [];
};

Guild.prototype.findMatchingRoles = function (query: string): any {
	if (!this || !query) return [];

	const patternMatch: RegExpExecArray | null =
		RegExp(ROLE_MENTION).exec(query);
	if (patternMatch) {
		const id: string = patternMatch[1];
		const role: any = this.roles.cache.find(
			(r: Role): boolean => r.id === id
		);
		if (role) return [role];
	}

	const exact: Array<any> = [];
	const startsWith: Array<any> = [];
	const includes: Array<any> = [];
	this.roles.cache.forEach((role: Role): void => {
		const lowerName: string = role.name.toLowerCase();
		if (role.name === query) exact.push(role);
		if (lowerName.startsWith(query.toLowerCase())) startsWith.push(role);
		if (lowerName.includes(query.toLowerCase())) includes.push(role);
	});
	if (exact.length > 0) return exact;
	if (startsWith.length > 0) return startsWith;
	if (includes.length > 0) return includes;
	return [];
};

Guild.prototype.resolveMember = async function (
	query: string,
	exact: boolean = false
): Promise<any> {
	if (!query) return;
	const { client } = this;

	const patternMatch: RegExpExecArray | null =
		RegExp(MEMBER_MENTION).exec(query);
	if (patternMatch) {
		const id: string = patternMatch[1];
		const fetched: any = await this.members
			.fetch({ user: id })
			.catch((e) => {
				// @ts-ignore - Property 'alertException' does not exist on type 'Client'
				client.alertException(
					e,
					this.name,
					null,
					'<Guild||Prototype>.resolveMember("' +
						query +
						'", ' +
						exact +
						')'
				);
			});
		if (fetched) return fetched;
	}

	await this.members.fetch({ query }).catch((e): void => {
		// @ts-ignore - Property 'alertException' does not exist on type 'Client'
		client.alertException(
			e,
			this.name,
			null,
			'<Guild||Prototype>.resolveMember("' + query + '", ' + exact + ')'
		);
	});

	const matchingUsernames: Collection<string, GuildMember> =
		this.members.cache.filter(
			(mem: any): boolean => mem.user.username === query
		);
	if (matchingUsernames.size === 1) return matchingUsernames.first();

	if (!exact) {
		return this.members.cache.find(
			(x: any) =>
				x.user.username === query ||
				x.user.username.toLowerCase().includes(query.toLowerCase()) ||
				x.displayName.toLowerCase().includes(query.toLowerCase())
		);
	}
};

Guild.prototype.fetchMemberStats = async function (): Promise<any> {
	const all: Collection<string, GuildMember> | null = await this.members
		.fetch()
		.catch(() => {
			return null;
		});
	const total: number = all!.size;
	const bots: number = all!.filter((mem) => mem.user.bot).size;
	const members: number = total - bots;
	return [total, bots, members];
};

Guild.prototype.logAction = async function (
	embed: EmbedBuilder,
	type: 'moderation' | 'member' | 'guild' | 'role' | 'thread' | 'channel'
): Promise<any> {
	const { client } = this;
	// @ts-ignore - Property 'findOrCreateGuild' does not exist on type 'Client'
	const guildData: any = await client.findOrCreateGuild(this.id);
	if (!guildData.settings?.logs?.channels[type]) return;
	const logChannel: any = this.channels.cache.get(
		guildData.settings?.logs?.channels[type]
	);
	if (!logChannel) return;
	return logChannel.send({ embeds: [embed] }).catch((e: any): void => {});
};
