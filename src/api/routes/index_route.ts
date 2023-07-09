import { Express, Request, Response } from 'express';
import { get as getIndex } from '@api/controllers/index_controller';

export default function configureIndexRoutes(app: Express)
{
	app.route('/')
		.get((req: Request, res: Response) =>
		{
			getIndex(req, res);
		});
}
