import { Request, Response } from 'express';
import { client } from '@src/app';
import fs from 'fs';
import moment from 'moment';

export async function get(req: Request, res: Response)
{
	const { app } = req;

	const month: string = req.params.month;

	if (!month) {
		const votes = JSON.parse(fs.readFileSync('./assets/votes.json').toString());
		const json: any = {
			status_code: 200,
			status_message: null,
			res: votes
		};
		res.setHeader('Content-Type', 'application/json');
		return res.end(JSON.stringify(json, null, 4));
	}

	const months: string[] = moment.months().map(m => m.toLowerCase());
	let requestedMonth: string | undefined;

	if (months.includes(month.toLowerCase())) {
		requestedMonth = months[months.indexOf(month.toLowerCase())];
	} else {
		if (months[parseInt(month) - 1] !== undefined) {
			requestedMonth = months[parseInt(month) - 1];
		}
	}

	if (requestedMonth) {
		const votes = JSON.parse(fs.readFileSync('./assets/votes.json').toString());
		const json: any = {
			status_code: 200,
			status_message: null,
			res: {
				month: requestedMonth,
				votes: votes[requestedMonth] || 0
			}
		};
		res.setHeader('Content-Type', 'application/json');
		return res.end(JSON.stringify(json, null, 4));
	} else {
		return res.sendStatus(404);
	}
}