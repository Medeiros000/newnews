import { Router } from 'express';
import { NewsController } from '../controllers/NewsController.js';
import { PrismaService } from '../services/PrismaServce.js';
import { RedisService } from '../services/RedisService.js';

export class NewsRouter {
    public readonly router: Router;
    private readonly controller: NewsController;

    constructor(prisma: PrismaService, redis: RedisService) {
        this.router = Router();
        this.controller = new NewsController(prisma, redis);
        this.setupRoutes();
    }

    private setupRoutes(): void {
        this.router.get('/', this.controller.getNews.bind(this.controller));
        this.router.get('/search', this.controller.searchNews.bind(this.controller));
        this.router.get('/:id', this.controller.getNewsById.bind(this.controller));
        this.router.get('/:id/related', this.controller.getRelatedNews.bind(this.controller));
    }
}