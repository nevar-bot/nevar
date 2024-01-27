import * as mongoose from "mongoose";
import { Model } from "mongoose";

const Schema = new mongoose.Schema({
	id: { type: String },
	afk: {
		type: Object,
		default: {
			state: false,
			reason: null,
			since: null,
		},
	},
	blocked: {
		type: Object,
		default: {
			state: false,
			reason: null,
			date: null,
			moderator: null,
		},
	},
	staff: {
		type: Object,
		default: {
			state: false,
			role: null,
		},
	},

	voteCount: { type: Number, default: 0 },
});

const User: Model<any> = mongoose.model("User", Schema);
export default User;
