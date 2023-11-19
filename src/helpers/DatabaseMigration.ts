import Guild from "@schemas/Guild";
import User from "@schemas/User";
import Member from "@schemas/Member";
import _ from "lodash";
import mongoose from "mongoose";

export default {
	async isEqual(data: any, updatedData: any): Promise<boolean> {
		return _.isEqual(data, updatedData);
	},

	async migrateGuilds(): Promise<number> {
		let count: number = 0;
		const guilds: any[] = await Guild.find();
		for (const guild of guilds) {
			const rawGuildData: any = await Guild.findOne({ id: guild.id }).lean();
			const currentGuildData: any = guild;
			const updatedGuildData: any = updateData(currentGuildData, Guild.schema.obj);

			if (!(await this.isEqual(rawGuildData, updatedGuildData))) {
				count++;
				await Guild.findOneAndDelete({ id: guild.id }).catch((): void => {});
				const newGuildData: any = new Guild(updatedGuildData);
				await newGuildData.save().catch((): void => {});
			}
		}
		return count;
	},

	async migrateUsers(): Promise<number> {
		let count: number = 0;
		const users: any[] = await User.find();

		for (const user of users) {
			const rawUserData: any = await User.findOne({ id: user.id }).lean();
			const currentUserData: any = user;
			const updatedUserData: any = updateData(currentUserData, User.schema.obj);

			if (!(await this.isEqual(rawUserData, updatedUserData))) {
				count++;
				await User.findOneAndDelete({ id: user.id }).catch((): void => {});
				const newUserData = new User(updatedUserData);
				await newUserData.save().catch((): void => {});
			}
		}

		return count;
	},

	async migrateMembers(): Promise<number> {
		let count: number = 0;
		const members: any[] = await Member.find();

		for (const member of members) {
			const rawMemberData: any = await Member.findOne({
				id: member.id,
				guildID: member.guildID
			}).lean();
			const currentMemberData: any = member;
			const updatedMemberData: any = updateData(currentMemberData, Member.schema.obj);

			if (!(await this.isEqual(rawMemberData, updatedMemberData))) {
				count++;
				await Member.findOneAndDelete({ id: member.id, guildID: member.guildID }).catch(
					(): void => {}
				);
				const newMemberData = new Member(updatedMemberData);
				await newMemberData.save().catch((): void => {});
			}
		}

		return count;
	}
};

function addMissingProperties(data: any, schema: any) {
	for (const key in schema) {
		const schemaValue: any = schema[key];
		const dataValue: any = data[key];

		if (dataValue === undefined) {
			if (schemaValue.default !== undefined) {
				data[key] = schemaValue.default;
			} else if (schemaValue.type === Object || schemaValue instanceof mongoose.Schema) {
				data[key] = {};

				if (schemaValue.type === Object) {
					addMissingProperties(data[key], schemaValue.default);
				} else if (schemaValue instanceof mongoose.Schema) {
					addMissingProperties(data[key], schemaValue.obj);
				}
			}
		} else if (schemaValue?.type === Object || schemaValue instanceof mongoose.Schema) {
			if (dataValue !== null) {
				addMissingProperties(dataValue, schemaValue.default);
			}
		}
	}
	return data;
}

function removeObsoleteProperties(data: any, schema: any) {
	for (const key in data) {
		const schemaValue: any = schema[key];
		const dataValue: any = data[key];

		if (key === "_id" || key === "__v") continue;

		if (!(key in schema)) {
			delete data[key];
		} else if (
			(schemaValue?.type === Object || schemaValue instanceof mongoose.Schema) &&
			dataValue !== null
		) {
			if (schemaValue.type === Object) {
				removeObsoleteProperties(dataValue, schemaValue.default || {});
			} else if (schemaValue instanceof mongoose.Schema) {
				removeObsoleteProperties(dataValue, schemaValue.obj);
			}
		}
	}
	return data;
}

function updateData(data: any, schema: any) {
	data = addMissingProperties(data, schema);
	data = removeObsoleteProperties(data.toObject(), schema);
	return data;
}
