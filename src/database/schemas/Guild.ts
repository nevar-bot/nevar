import * as mongoose from "mongoose";
import { Model, Schema, model, Document } from "mongoose";

const GuildSchema: Schema = new mongoose.Schema({
	id: { type: String, default: null },
	membersData: { type: Object, default: {} },
	members: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Member",
		},
	],
	blocked: {
		type: Object,
		default: {
			state: false,
			reason: null,
			date: null,
			moderator: null,
		},
	},
	locale: { type: String, default: "de" },
	settings: {
		type: Object,
		default: {
			logs: {
				enabled: true,
				channels: {
					moderation: null,
					member: null,
					guild: null,
					role: null,
					thread: null,
					channel: null,
				},
			},
			joinToCreate: {
				enabled: false,
				channel: null,
				category: null,
				userLimit: null,
				bitrate: null,
				defaultName: null,
				channels: [],
			},
			levels: {
				enabled: false,
				channel: null,
				message: "GG %user.name, you're level %level now!",
				roles: [],
				doubleXP: [],
				exclude: {
					channels: [],
					roles: [],
				},
				xp: {
					min: 1,
					max: 30,
				},
			},
			welcome: {
				enabled: false,
				channel: null,
				type: null,
				message: null,
				profilePicture: true,
				autoroles: [],
			},
			farewell: {
				enabled: false,
				channel: null,
				type: null,
				message: null,
				profilePicture: true,
			},
			polls: [],
			notifiers: {
				youtube: {
					enabled: false,
					channels: [],
					announcementChannel: null,
				},
				twitch: {
					enabled: false,
					channels: [],
					announcementChannel: null,
				},
			},
			autodelete: [],
			autoreact: [],
		},
	},
});

const GuildModel: Model<any> = model("Guild", GuildSchema);
export { GuildModel };