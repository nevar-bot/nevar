import { Request, Response } from 'express';
import { client } from '@src/app';
import mongoose from 'mongoose';

export async function get(req: Request, res: Response)
{
	const { app } = req;

	const headStaffs: any[] = [];
	const normalStaffs: any[] = [];

	for (const ownerId of client.config.general['OWNER_IDS']) {
		const user: any = await client.users.fetch(ownerId).catch((): void =>
		{
		});
		if (!user) continue;
		headStaffs.push({
			username: user.username,
			displayName: user.displayName,
			avatar: user.displayAvatarURL(),
			id: user.id,
			role: 'Head-Staff',
		});
	}

	const staffsData: any = await mongoose.connection.db.collection('users').find({ 'staff.state': true }).toArray();

	for (const staffData of staffsData) {
		const user: any = await client.users.fetch(staffData.id).catch(() =>
		{
		});
		if (!user) continue;
		if (headStaffs.find((s: any): boolean => s.id === user.id)) continue;
		const staffToPush: any = {
			username: user.username,
			displayName: user.displayName,
			avatar: user.displayAvatarURL(),
			id: user.id,
			role: staffData.staff.role === 'head-staff' ? 'Head-Staff' : 'Staff',
		};

		if (staffData.staff.role === 'head-staff') headStaffs.push(staffToPush);
		else normalStaffs.push(staffToPush);
	}

	const staffs: any[] = [...headStaffs, ...normalStaffs];

	const json: any = {
		status_code: 200,
		status_message: null,
		res: {
			staff_count: staffs.length,
			staffs,
		},
	};
	res.setHeader('Content-Type', 'application/json');
	return res.end(JSON.stringify(json, null, 4));
}