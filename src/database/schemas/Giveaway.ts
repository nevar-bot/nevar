import * as mongoose from "mongoose";
import { Model } from "mongoose";

const Schema = new mongoose.Schema(
	{
		messageId: String,
		channelId: String,
		guildId: String,
		startAt: Number,
		endAt: Number,
		ended: Boolean,
		winnerCount: Number,
		prize: String,
		entrantIds: { type: [String], default: undefined },
		hostedBy: String,
		winnerIds: { type: [String], default: undefined },
		exemptMembers: { type: [String], default: undefined },
		conditions: { type: [String], default: undefined }
	},
	{
		id: false,
		autoIndex: false
	}
);

const Giveaway: Model<any> = mongoose.model("Giveaway", Schema);
export default Giveaway;
