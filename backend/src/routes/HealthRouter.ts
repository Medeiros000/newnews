import { Router } from 'express';

export class HealthRouter {
    public readonly router: Router;

    constructor() {
        this.router = Router();
        this.configureRoutes();
    }

    private configureRoutes(): void {
        this.router.get('/', (_request, response) => {
            response.json({
                status: 'ok',
                service: 'newnews-api',
                timestamp: new Date().toISOString(),
            });
        });
    }
}