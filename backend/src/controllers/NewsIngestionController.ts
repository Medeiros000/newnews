import type { Request, Response, NextFunction } from 'express';
import type { INewsIngestionController } from './interfaces/INewsIngestionController.js';
import {
	NewsIngestionWorker,
	createNewsIngestionWorker,
} from '../workers/NewsIngestionWorker.js';

export class NewsIngestionController implements INewsIngestionController {
	constructor(
		private readonly worker: NewsIngestionWorker = createNewsIngestionWorker(),
	) {}

	public async triggerIngestion(
		_request: Request,
		response: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			await this.worker.runOnce();
			response.status(200).json({
				success: true,
				message: 'Ingestão de notícias executada com sucesso.',
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			next(error);
		}
	}
}
