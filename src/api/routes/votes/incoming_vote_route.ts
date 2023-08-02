import { Express, Request, Response } from 'express';
import { post as postIncomingVote } from '@api/controllers/votes/incoming_vote_controller';

export default function configureIncomingVoteRoutes(app: Express): void {
	app.route('/votes/post').post((req: Request, res: Response): void => {
		postIncomingVote(req, res);
	});
}
