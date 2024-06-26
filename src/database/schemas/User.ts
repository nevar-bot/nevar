import * as mongoose from "mongoose";
import { Model } from "mongoose";

const Schema = new mongoose.Schema({
	id: { type: String },
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
	}
});

const UserModel: Model<any> = mongoose.model("User", Schema);
export { UserModel };