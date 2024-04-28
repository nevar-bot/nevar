import { GuildModel } from "@schemas/Guild.js";
import { UserModel } from "@schemas/User.js";
import { MemberModel } from "@schemas/Member.js";
// @ts-ignore
import _ from "lodash";
import mongoose from "mongoose";

export class DatabaseMigration {
	public constructor() {
	}

	private isEqual(data: any, updatedData: any): boolean {
		return _.isEqual(data, updatedData);
	}

	private addMissingProperties(data: any, schema: any): any {
		for (const key in schema) {
			const schemaValue: any = schema[key];
			const dataValue: any = data[key];

			if (dataValue === undefined) {
				if (schemaValue.default !== undefined) {
					data[key] = schemaValue.default;
				} else if (schemaValue.type === Object || schemaValue instanceof mongoose.Schema) {
					data[key] = {};

					if (schemaValue.type === Object) {
						this.addMissingProperties(data[key], schemaValue.default);
					} else if (schemaValue instanceof mongoose.Schema) {
						this.addMissingProperties(data[key], schemaValue.obj);
					}
				}
			} else if (schemaValue?.type === Object || schemaValue instanceof mongoose.Schema) {
				if (dataValue !== null) {
					this.addMissingProperties(dataValue, schemaValue.default);
				}
			}
		}
		return data;
	}

	private removeObsoleteProperties(data: any, schema: any): any {
		for (const key in data) {
			const schemaValue: any = schema[key];
			const dataValue: any = data[key];

			if (key === "_id" || key === "__v") continue;

			if (!(key in schema)) {
				delete data[key];
			} else if ((schemaValue?.type === Object || schemaValue instanceof mongoose.Schema) && dataValue !== null) {
				if (schemaValue.type === Object) {
					this.removeObsoleteProperties(dataValue, schemaValue.default || {});
				} else if (schemaValue instanceof mongoose.Schema) {
					this.removeObsoleteProperties(dataValue, schemaValue.obj);
				}
			}
		}
		return data;
	}

	private updateData(data: any, schema: any): any {
		data = this.addMissingProperties(data, schema);
		data = this.removeObsoleteProperties(data.toObject(), schema);
		return data;
	}


	public async migrateGuilds(): Promise<number> {
		let count: number = 0;
		const guilds: any[] = await GuildModel.find();
		for (const guild of guilds) {
			const rawGuildData: any = await GuildModel.findOne({id: guild.id}).lean();
			const currentGuildData: any = guild;
			const updatedGuildData: any = this.updateData(currentGuildData, GuildModel.schema.obj);

			if (!this.isEqual(rawGuildData, updatedGuildData)) {
				count++;
				await GuildModel.findOneAndDelete({id: guild.id}).catch((): void => {});
				const newGuildData: any = new GuildModel(updatedGuildData);
				await newGuildData.save().catch((): void => {});
			}
		}
		return count;
	}

	public async migrateUsers(): Promise<number> {
		let count: number = 0;
		const users: any[] = await UserModel.find();

		for (const user of users) {
			const rawUserData: any = await UserModel.findOne({id: user.id}).lean();
			const currentUserData: any = user;
			const updatedUserData: any = this.updateData(currentUserData, UserModel.schema.obj);

			if (!this.isEqual(rawUserData, updatedUserData)) {
				count++;
				await UserModel.findOneAndDelete({id: user.id}).catch((): void => {});
				const newUserData = new UserModel(updatedUserData);
				await newUserData.save().catch((): void => {});
			}
		}

		return count;
	}

	public async migrateMembers(): Promise<number> {
		let count: number = 0;
		const members: any[] = await MemberModel.find();

		for (const member of members) {
			const rawMemberData: any = await MemberModel.findOne({
				id: member.id,
				guildID: member.guildID,
			}).lean();
			const currentMemberData: any = member;
			const updatedMemberData: any = this.updateData(currentMemberData, MemberModel.schema.obj);

			if (!this.isEqual(rawMemberData, updatedMemberData)) {
				count++;
				await MemberModel.findOneAndDelete({id: member.id, guildID: member.guildID}).catch((): void => {});
				const newMemberData = new MemberModel(updatedMemberData);
				await newMemberData.save().catch((): void => {});
			}
		}

		return count;
	}
}