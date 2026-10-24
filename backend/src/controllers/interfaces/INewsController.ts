import type { NextFunction, Request, Response } from 'express';

export interface INewsController {
    getNews(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void>;
    createNews(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void>;
    searchNews(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void>;
    getNewsById(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void>;
    getRelatedNews(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void>;
}
