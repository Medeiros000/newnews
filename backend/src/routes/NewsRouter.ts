import { Router } from 'express';
import { NewsController } from '../controllers/NewsController.js';

export class NewsRouter {
	public router: Router;

	constructor(private readonly newsController: NewsController) {
		this.router = Router();
		this.setupRoutes();
	}

	private setupRoutes(): void {
		this.router.get('/', this.newsController.searchNews);
		this.router.get('/search', this.newsController.searchNews);
		this.router.get('/:id', this.newsController.getNewsById);
		this.router.get('/:id/related', this.newsController.getRelatedNews);
	}
}
