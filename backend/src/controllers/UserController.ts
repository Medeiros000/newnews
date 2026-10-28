import type { NextFunction, Request, Response } from 'express';
import { QueryOptions } from '../queries/QueryOptions.js';
import { UserService } from '../services/UserService.js';
import { IUserService } from '../services/interfaces/IUserService.js';
import { IUserController } from './interfaces/IUserController.js';

export class UserController implements IUserController {
  public constructor(private readonly service: IUserService = new UserService()) {}

  public async getUser(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.service.getUser(
        new QueryOptions({
          email: Array.isArray(request.params.email)
            ? request.params.email[0]
            : request.params.email,
        }),
      );

      if (!user) {
        response.status(404).json({ error: 'User not found' });
        return;
      }

      response.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  public async createUser(request: Request, response: Response, _next: NextFunction) {
    console.log('Request body:', request.body); // Log the request body for debugging
    response.status(200).json({ message: 'User creation endpoint hit', body: request.body }); // Temporary response for debugging
    // const result = createUserSchema.safeParse(request.body);

    // if (!result.success) {
    // 	response.status(400).json({
    // 		error: 'Invalid request body',
    // 		issues: result.error.issues,
    // 	});
    // 	return;
    // }

    // try {
    // 	const user = await this.prisma.user.create({ data: result.data });
    // 	response.status(201).json({ data: user });
    // } catch (error) {
    // 	next(error);
    // }
  }
}
