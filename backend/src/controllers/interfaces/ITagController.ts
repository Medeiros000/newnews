import type { NextFunction, Request, Response } from 'express';

export interface ITagController {
  getTags(request: Request, response: Response, next: NextFunction): Promise<void>;
  getNewsByTagSlug(request: Request, response: Response, next: NextFunction): Promise<void>;
}
