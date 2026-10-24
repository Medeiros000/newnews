import { Router } from 'express';
import { NewsController } from '../controllers/NewsController.js';
import type { INewsController } from '../controllers/interfaces/INewsController.js';

export class NewsRouter {
    public readonly router: Router;
    private readonly controller: INewsController;

    public constructor(controller: INewsController = new NewsController()) {
        this.router = Router();
        this.controller = controller;
        this.setupRoutes();
    }

    private setupRoutes(): void {
        this.router.get('/', this.controller.getNews.bind(this.controller));
        this.router.post('/', this.controller.createNews.bind(this.controller));
        this.router.get('/search', this.controller.searchNews.bind(this.controller));
        this.router.get('/:id', this.controller.getNewsById.bind(this.controller));
        this.router.get('/:id/related', this.controller.getRelatedNews.bind(this.controller));
    }
}