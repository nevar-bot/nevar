import { Express, Request, Response } from 'express';
import { get as getStats } from '@api/controllers/client/stats_controller';

export default function configureStatsRoutes(app: Express): void {
	app.route('/client/stats').get((req: Request, res: Response): void => {
		getStats(req, res);
	});
}
