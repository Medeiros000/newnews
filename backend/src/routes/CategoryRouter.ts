import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController.js';
import { PrismaService } from '../services/PrismaServce.js';
import { RedisService } from '../services/RedisService.js';

export class CategoryRouter {
	public readonly router: Router;
	private readonly controller: CategoryController;

	public constructor(prisma: PrismaService, redis: RedisService) {
		this.controller = new CategoryController(prisma, redis);
		this.router = Router();
		this.setupRoutes();
	}

	private setupRoutes(): void {
		this.router.get('/', this.controller.get.bind(this.controller));
		this.router.get('/:id', this.controller.getById.bind(this.controller));
	}
}
