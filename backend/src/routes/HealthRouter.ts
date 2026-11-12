import { Router, type Request, type Response } from 'express';

export class HealthRouter {
	public readonly router: Router;

	constructor() {
		this.router = Router();
		this.setupRoutes();
	}

	private setupRoutes(): void {
		this.router.get('/', this.getHealth);
	}

	private getHealth(_request: Request, response: Response): void {
		response.json({
			status: 'ok',
			service: 'newnews-api',
			timestamp: new Date().toISOString(),
		});
	}
}
