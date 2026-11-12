import type { NextFunction, Request, Response } from 'express';
import { NewsIngestionPipeline } from '../services/newsIngestion/NewsIngestionPipeline.js';
import type { INewsIngestionController } from './interfaces/INewsIngestionController.js';

export class NewsIngestionController implements INewsIngestionController {
	public async execute(
		_request: Request,
		response: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const pipeline = new NewsIngestionPipeline();
			const executed = await pipeline.execute();

			response.status(executed ? 200 : 409).json({
				status: executed ? 'ok' : 'already_running',
			});
		} catch (error) {
			next(error);
		}
	}
}
