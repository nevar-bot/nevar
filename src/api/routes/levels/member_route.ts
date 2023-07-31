/** @format */

import { Express, Request, Response } from 'express';
import { get as getMemberLevel } from '@api/controllers/levels/member_controller';

export default function configureMemberLevelRoutes(app: Express): void {
	app.route('/levels/member/:guildID/:memberID').get(
		(req: Request, res: Response): void => {
			getMemberLevel(req, res);
		}
	);
}
