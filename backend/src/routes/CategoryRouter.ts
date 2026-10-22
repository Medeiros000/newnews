import { Router } from 'express';
import CategoryController from '../controllers/CategoryController.js';

export default class CategoryRouter {
	public readonly router: Router;
	private readonly controller: CategoryController;

	public constructor(controller = new CategoryController()) {
		this.controller = controller;
		this.router = Router();
		this.configureRoutes();
	}

	private configureRoutes(): void {
		this.router.get('/', this.controller.get.bind(this.controller));
		this.router.get('/:id', this.controller.getById.bind(this.controller));
	}
}
