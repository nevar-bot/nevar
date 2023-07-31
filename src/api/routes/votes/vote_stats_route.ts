/** @format */

import { Express, Request, Response } from 'express';
import { get as getVoteStats } from '@api/controllers/votes/vote_stats_controller';

export default function configureVoteStatsRoutes(app: Express): void {
	app.route('/votes/:month?').get((req: Request, res: Response): void => {
		getVoteStats(req, res);
	});
}
