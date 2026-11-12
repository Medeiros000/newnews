import { Router } from 'express';
import { NewsIngestionController } from '../controllers/NewsIngestionController.js';
import type { INewsIngestionController } from '../controllers/interfaces/INewsIngestionController.js';

export class NewsIngestionRouter {
	public readonly router: Router;
	private readonly controller: INewsIngestionController;

	public constructor(
		controller: INewsIngestionController = new NewsIngestionController(),
	) {
		this.router = Router();
		this.controller = controller;
		this.setupRoutes();
	}

	private setupRoutes(): void {
		this.router.get('/', this.controller.triggerIngestion.bind(this.controller));
	}
}
