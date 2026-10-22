import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { PrismaService } from '../services/PrismaServce.js';

export class UserRouter {
    public readonly router: Router

    constructor(prisma: PrismaService) {
        this.router = Router();
        this.configureRoutes(new UserController(prisma));
    }

    public configureRoutes(controller: UserController): void {
        this.router.get('/:email', controller.getUser.bind(controller));
        this.router.post('/', controller.createUser.bind(controller));
    }
}