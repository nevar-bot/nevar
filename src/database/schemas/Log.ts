import * as mongoose from "mongoose";
import { Model } from "mongoose";

const Schema = new mongoose.Schema({
	command: { type: String, default: "Unknown" },
	type: { type: String, default: "Unknown" },
	arguments: { type: Array, default: [] },
	date: { type: Number, default: Date.now() },
	user: {
		type: Object,
		default: {
			tag: "Unknown#0000",
			id: null,
			createdAt: { type: Number, default: Date.now() }
		}
	},
	guild: {
		type: Object,
		default: {
			name: "Unknown",
			id: null,
			createdAt: { type: Number, default: Date.now() }
		}
	},
	channel: {
		type: Object,
		default: {
			name: "Unknown",
			id: null,
			createdAt: { type: Number, default: Date.now() }
		}
	}
});

const Log: Model<any> = mongoose.model("Log", Schema);
export default Log;
