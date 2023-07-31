/** @format */

import * as mongoose from 'mongoose';
import { Model } from 'mongoose';

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
		buttons: {
			join: mongoose.Schema.Types.Mixed,
			leave: mongoose.Schema.Types.Mixed,
			joinReply: mongoose.Schema.Types.Mixed,
			leaveReply: mongoose.Schema.Types.Mixed
		},
		entrantIds: { type: [String], default: undefined },
		messages: {
			giveaway: String,
			giveawayEnded: String,
			inviteToParticipate: String,
			drawing: String,
			dropMessage: String,
			winMessage: mongoose.Schema.Types.Mixed,
			embedFooter: mongoose.Schema.Types.Mixed,
			noWinner: String,
			winners: String,
			endedAt: String,
			hostedBy: String
		},
		thumbnail: String,
		hostedBy: String,
		winnerIds: { type: [String], default: undefined },
		reaction: mongoose.Schema.Types.Mixed,
		botsCanWin: Boolean,
		embedColor: mongoose.Schema.Types.Mixed,
		embedColorEnd: mongoose.Schema.Types.Mixed,
		exemptPermissions: { type: [], default: undefined },
		exemptMembers: String,
		bonusEntries: String,
		extraData: mongoose.Schema.Types.Mixed,
		lastChance: {
			enabled: Boolean,
			content: String,
			threshold: Number,
			embedColor: mongoose.Schema.Types.Mixed
		},
		pauseOptions: {
			isPaused: Boolean,
			content: String,
			unPauseAfter: Number,
			embedColor: mongoose.Schema.Types.Mixed,
			durationAfterPause: Number
		},
		isDrop: Boolean,
		allowedMentions: {
			parse: { type: [String], default: undefined },
			users: { type: [String], default: undefined },
			roles: { type: [String], default: undefined }
		}
	},
	{
		id: false,
		autoIndex: false
	}
);

const Giveaway: Model<any> = mongoose.model('Giveaway', Schema);
export default Giveaway;
