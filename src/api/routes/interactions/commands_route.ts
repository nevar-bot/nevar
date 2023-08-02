import { Express, Request, Response } from 'express';
import { get as getCommands } from '@api/controllers/interactions/commands_controller';

export default function configureCommandsRoutes(app: Express): void {
	app.route('/interactions/commands').get(
		(req: Request, res: Response): void => {
			getCommands(req, res);
		}
	);
}
