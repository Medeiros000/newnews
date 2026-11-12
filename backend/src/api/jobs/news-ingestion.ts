import type { NextFunction, Request, Response } from 'express';
import { NewsIngestionController } from '../../controllers/NewsIngestionController.js';

export default async function handler(
	request: Request,
	response: Response,
	next: NextFunction,
): Promise<void> {
	const controller = new NewsIngestionController();
	await controller.execute(request, response, (error) => {
		if (response.headersSent) {
			next(error);
			return;
		}

		console.error(error);
		response.status(500).json({ error: 'Internal server error' });
	});
}
