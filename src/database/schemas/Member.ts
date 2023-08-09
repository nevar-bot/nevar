import * as mongoose from "mongoose";
import { Model } from "mongoose";

const Schema = new mongoose.Schema({
	id: { type: String },
	guildID: { type: String },
	warnings: {
		type: Object,
		default: {
			count: 0,
			list: []
		}
	},
	banned: {
		type: Object,
		default: {
			state: false,
			reason: null,
			moderator: {
				name: null,
				id: null
			},
			duration: null,
			bannedAt: null,
			bannedUntil: null
		}
	},
	muted: {
		type: Object,
		default: {
			state: false,
			reason: null,
			moderator: {
				name: null,
				id: null
			},
			duration: null,
			mutedAt: null,
			mutedUntil: null
		}
	},
	suggestions: {
		type: Array,
		default: []
	},
	reminders: [],
	invites: [],
	inviteUsed: {
		type: String,
		default: null
	}
});

const Member: Model<any> = mongoose.model("Member", Schema);
export default Member;
