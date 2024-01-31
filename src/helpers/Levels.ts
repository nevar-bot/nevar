import * as mongoose from "mongoose";
import LevelSchema from "@schemas/Levels";
let mongoUrl;

export default class Levels {
	static async setURL(dbUrl: string): Promise<any> {
		mongoUrl = dbUrl;
		return mongoose.connect(dbUrl);
	}

	static async createUser(userId: string, guildId: string): Promise<any> {
		const isUser: any = await LevelSchema.findOne({
			userID: userId,
			guildID: guildId,
		});
		if (isUser) return false;

		const newUser = new LevelSchema({
			userID: userId,
			guildID: guildId,
		});

		await newUser.save().catch((e: any): boolean => {
			return false;
		});
		return newUser;
	}

	static async deleteUser(userId: string, guildId: string): Promise<any> {
		const user: any = await LevelSchema.findOne({
			userID: userId,
			guildID: guildId,
		});
		if (!user) return false;

		await LevelSchema.findOneAndDelete({
			userID: userId,
			guildID: guildId,
		}).catch((e: any): boolean => {
			return false;
		});
		return user;
	}

	static async appendXp(userId: string, guildId: string, xp: number): Promise<any> {
		if (xp <= 0 || !xp || isNaN(parseInt(String(xp)))) return false;

		const user: any = await LevelSchema.findOne({
			userID: userId,
			guildID: guildId,
		});
		if (!user) {
			const newUser: any = new LevelSchema({
				userID: userId,
				guildID: guildId,
				xp: xp,
				level: Math.floor(0.1 * Math.sqrt(xp)),
			});
			await newUser.save().catch((e: any): boolean => {
				return false;
			});

			return Math.floor(0.1 * Math.sqrt(xp)) > 0;
		}

		user.xp += parseInt(String(xp), 10);
		user.level = Math.floor(0.1 * Math.sqrt(user.xp));
		user.lastUpdated = new Date();

		await user.save().catch((e: any): boolean => {
			return false;
		});

		return Math.floor(0.1 * Math.sqrt((user.xp -= xp))) < user.level;
	}

	static async appendLevel(userId: string, guildId: string, levels: number): Promise<any> {
		const user: any = await LevelSchema.findOne({
			userID: userId,
			guildID: guildId,
		});
		if (!user) return false;

		user.level += parseInt(String(levels), 10);
		user.xp = user.level * user.level * 100;
		user.lastUpdated = new Date();

		user.save().catch((e: any): boolean => {
			return false;
		});

		return user;
	}

	static async setXp(userId: string, guildId: string, xp: number): Promise<any> {
		if (xp <= 0 || !xp || isNaN(parseInt(String(xp)))) return false;

		const user: any = await LevelSchema.findOne({
			userID: userId,
			guildID: guildId,
		});
		if (!user) return false;

		user.xp = xp;
		user.level = Math.floor(0.1 * Math.sqrt(user.xp));
		user.lastUpdated = new Date();

		user.save().catch((e: any): boolean => {
			return false;
		});

		return user;
	}

	static async setLevel(userId: string, guildId: string, level: number): Promise<any> {
		const user: any = await LevelSchema.findOne({
			userID: userId,
			guildID: guildId,
		});
		if (!user) return false;

		user.level = level;
		user.xp = level * level * 100;
		user.lastUpdated = new Date();

		user.save().catch((e: any): boolean => {
			return false;
		});

		return user;
	}

	static async fetch(userId: string, guildId: string, fetchPosition: boolean = false): Promise<any> {
		const user: any = await LevelSchema.findOne({
			userID: userId,
			guildID: guildId,
		});
		if (!user) return false;

		if (fetchPosition) {
			const leaderboard: any[] = await LevelSchema.find({
				guildID: guildId,
			})
				.sort([["xp", "descending"]])
				.exec();

			user.position = leaderboard.findIndex((i: any): boolean => i.userID === userId) + 1;
		}

		user.cleanXp = user.xp - this.xpFor(user.level);
		user.cleanNextLevelXp = this.xpFor(user.level + 1) - this.xpFor(user.level);

		return user;
	}

	static async substractXp(userId: string, guildId: string, xp: number): Promise<any> {
		if (xp <= 0 || !xp || isNaN(parseInt(String(xp)))) return false;

		const user: any = await LevelSchema.findOne({
			userID: userId,
			guildID: guildId,
		});
		if (!user) return false;

		user.xp -= xp;
		user.level = Math.floor(0.1 * Math.sqrt(user.xp));
		user.lastUpdated = new Date();

		user.save().catch((e: any): boolean => {
			return false;
		});

		return user;
	}

	static async substractLevel(userId: string, guildId: string, levels: number): Promise<any> {
		const user: any = await LevelSchema.findOne({
			userID: userId,
			guildID: guildId,
		});
		if (!user) return false;

		user.level -= levels;
		user.xp = user.level * user.level * 100;
		user.lastUpdated = new Date();

		user.save().catch((e: any): boolean => {
			return false;
		});

		return user;
	}

	static async fetchLeaderboard(guildId: string, limit: number = 10): Promise<any> {
		return await LevelSchema.find({ guildID: guildId })
			.sort([["xp", "descending"]])
			.limit(limit)
			.exec();
	}

	static async computeLeaderboard(client: any, leaderboard: any[], fetchUsers = false): Promise<any> {
		if (leaderboard.length < 1) return [];

		const computedArray: any[] = [];

		for(const key of leaderboard){
			let user: any = client.users.cache.get(key.userID);
			if(!user && fetchUsers) user = await client.users.fetch(key.userID);
			if(!user) continue;
			if(user.username.includes("Deleted User")){
				await this.deleteUser(key.userID, key.guildID);
				continue;
			}

			computedArray.push({
				user: {
					id: key.userID,
					username: user.username,
					displayName: user.displayName,
					avatar: user.displayAvatarURL()
				},
				guild: {
					id: key.guildID,
					name: client.guilds.cache.get(key.guildID)?.name || "Unknown",
					icon: client.guilds.cache.get(key.guildID)?.iconURL() || client.displayAvatarURL()
				},
				level: key.level,
				xp: key.xp,
				nextLevelXp: this.xpFor(key.level + 1),
				cleanXp: key.xp - this.xpFor(key.level),
				cleanNextLevelXp: this.xpFor(key.level + 1) - this.xpFor(key.level),
				position: leaderboard.findIndex((i: any): boolean => i.guildID === key.guildID && i.userID === key.userID) + 1,
			});

		}

		return computedArray;
	}

	static xpFor(level: number): any {
		if (level < 0) return false;

		return level * level * 100;
	}

	static async deleteGuild(guildId: string): Promise<any> {
		const guild: any = await LevelSchema.findOne({ guildID: guildId });
		if (!guild) return false;

		await LevelSchema.deleteMany({ guildID: guildId }).catch((e: any): boolean => {
			return false;
		});

		return guild;
	}
}
