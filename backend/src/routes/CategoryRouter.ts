import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController.js';
import type { ICategoryController } from '../controllers/interfaces/ICategoryController.js';

export class CategoryRouter {
  public readonly router: Router;
  private readonly controller: ICategoryController;

  public constructor(controller: ICategoryController = new CategoryController()) {
    this.controller = controller;
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/', this.controller.getAllCategories.bind(this.controller));
    this.router.get('/:id', this.controller.getCategoryById.bind(this.controller));
  }
}
