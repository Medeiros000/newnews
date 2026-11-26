import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { ensureAuthenticated } from '../middlewares/authMiddleware.js';

export class UserRouter {
  public readonly router: Router;
  private readonly controller: UserController;

  public constructor(controller: UserController = new UserController()) {
    this.router = Router();
    this.controller = controller;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.use(ensureAuthenticated);
    this.router.patch('/me', this.controller.updateProfile.bind(this.controller));
    this.router.patch('/me/password', this.controller.updatePassword.bind(this.controller));
    this.router.put('/me/preferences', this.controller.updatePreferences.bind(this.controller));
    this.router.get('/me/bookmarks', this.controller.getBookmarks.bind(this.controller));
    this.router.get('/me/history', this.controller.getHistory.bind(this.controller));
  }
}
