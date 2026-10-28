import { Router } from 'express';

export class HealthRouter {
  public readonly router: Router;

  public constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/', (_request, response) => {
      response.json({
        status: 'ok',
        service: 'newnews-api',
        timestamp: new Date().toISOString(),
      });
    });
  }
}
