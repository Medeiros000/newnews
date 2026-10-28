import type { NextFunction, Request, Response } from 'express';

export interface IUserController {
  getUser(request: Request, response: Response, next: NextFunction): Promise<void>;
  createUser(request: Request, response: Response, next: NextFunction): Promise<void>;
}
