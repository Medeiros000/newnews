import { Router } from 'express';
import { userController } from '../controllers/userController.js';

export const usersRouter = Router();

usersRouter.get('/', userController.getUsers);

usersRouter.post('/', userController.createUser);
