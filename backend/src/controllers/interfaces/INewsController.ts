import type { NextFunction, Request, Response } from 'express';

export interface INewsController {
  getNews(request: Request, response: Response, next: NextFunction): Promise<void>;
  searchNews(request: Request, response: Response, next: NextFunction): Promise<void>;
  getNewsById(request: Request, response: Response, next: NextFunction): Promise<void>;
  getNewsBySlugAndIdPrefix(request: Request, response: Response, next: NextFunction): Promise<void>;
  getRelatedNews(request: Request, response: Response, next: NextFunction): Promise<void>;
  createNews(request: Request, response: Response, next: NextFunction): Promise<void>;
  updateNews(request: Request, response: Response, next: NextFunction): Promise<void>;
  deleteNews(request: Request, response: Response, next: NextFunction): Promise<void>;
  startNewsIngestion(request: Request, response: Response): void;
}
