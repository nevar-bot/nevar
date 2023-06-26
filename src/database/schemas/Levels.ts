import * as mongoose from "mongoose";
import { Model } from "mongoose";

const Schema = new mongoose.Schema({
	userID: { type: String },
	guildID: { type: String },
	xp: { type: Number, default: 0 },
	level: { type: Number, default: 0 },
	lastUpdated: { type: Number, default: new Date() }
});

const Levels: Model<any> = mongoose.model("Levels", Schema);
export default Levels;