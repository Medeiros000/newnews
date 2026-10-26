import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import type { IUserController } from '../controllers/interfaces/IUserController.js';

export class UserRouter {
    public readonly router: Router;

    public constructor(controller: IUserController = new UserController()) {
        this.router = Router();
        this.setupRoutes(controller);
    }

    private setupRoutes(controller: IUserController): void {
        this.router.get('/:email', controller.getUser.bind(controller));
        this.router.post('/', controller.createUser.bind(controller));
    }
}