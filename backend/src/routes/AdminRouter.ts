import { Router } from 'express';
import { AdminController } from '../controllers/AdminController.js';
import { ensureAuthenticated, ensureAdmin } from '../middlewares/authMiddleware.js';

export class AdminRouter {
  public readonly router: Router;
  private readonly controller: AdminController;

  public constructor(controller: AdminController = new AdminController()) {
    this.router = Router();
    this.controller = controller;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.use(ensureAuthenticated);
    this.router.use(ensureAdmin);

    this.router.get('/stats', this.controller.getStats.bind(this.controller));
    this.router.get('/users', this.controller.getUsers.bind(this.controller));
    this.router.patch('/users/:id', this.controller.updateUser.bind(this.controller));
    this.router.delete('/users/:id', this.controller.deleteUser.bind(this.controller));
  }
}
