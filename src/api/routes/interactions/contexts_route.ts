import { Express, Request, Response } from 'express';
import { get as getContexts } from '@api/controllers/interactions/contexts_controller';

export default function configureContextsRoutes(app: Express): void
{
	app.route('/interactions/contexts')
		.get((req: Request, res: Response): void =>
		{
			getContexts(req, res);
		});
}
