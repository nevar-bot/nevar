import { Request, Response } from 'express';

export async function get(req: Request, res: Response)
{
	const { app } = req;

	const json: any = {
		status_code: 200,
		status_message: null,
		routes: []
	};

	app._router.stack.forEach(function(r: any)
	{
		if (!r || !r.route) return;
		if (r.route.path === '*' || r.route.path === '/') return;

		const type: string = r.route.methods.get ? 'GET' : 'POST';
		json.routes.push(type + ' ' + req.get('host') + r.route.path);
	});

	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(json, null, 4));
}