import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { ensureAuthenticated } from '../middlewares/authMiddleware.js';

export class AuthRouter {
  public readonly router: Router;
  private readonly controller: AuthController;

  public constructor(controller: AuthController = new AuthController()) {
    this.router = Router();
    this.controller = controller;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/register', this.controller.register.bind(this.controller));
    this.router.post('/login', this.controller.login.bind(this.controller));
    this.router.post('/refresh', this.controller.refresh.bind(this.controller));
    this.router.post('/logout', ensureAuthenticated, this.controller.logout.bind(this.controller));
    this.router.get('/me', ensureAuthenticated, this.controller.me.bind(this.controller));
  }
}
