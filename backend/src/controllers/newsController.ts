import type { NextFunction, Request, Response } from 'express';
import { QueryOptions } from '../commands/QueryOptions.js';
import { NewsService } from '../services/NewsService.js';
import { INewsService } from '../services/interfaces/INewsService.js';
import { INewsController } from './interfaces/INewsController.js';

export class NewsController implements INewsController {
    public constructor(
        private readonly service: INewsService = new NewsService()) {
    }

    public async getNews(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const result = await this.service.getNews(
                this.createQueryOptions(request),
            );
            response.status(200).json({
                source: result.fromCache ? 'cache' : 'database',
                ...result.data,
            });
        } catch (error) {
            next(error);
        }
    }

    public async searchNews(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        return this.getNews(request, response, next);
    }

    public async getNewsById(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const result = await this.service.getNewsById(
                this.createQueryOptions(request),
            );
            if (!result) {
                response.status(404).json({
                    success: false,
                    error: 'Notícia não encontrada',
                });
                return;
            }

            response.setHeader('X-Cache', result.fromCache ? 'HIT' : 'MISS');
            response.json({ success: true, data: result.data });
        } catch (error) {
            next(error);
        }
    }

    public async getRelatedNews(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const result = await this.service.getRelatedNews(
                this.createQueryOptions(request),
            );
            if (!result) {
                response.status(404).json({
                    success: false,
                    error: 'Notícia não encontrada',
                });
                return;
            }

            response.setHeader('X-Cache', result.fromCache ? 'HIT' : 'MISS');
            response.status(200).json({
                success: true,
                data: { news: result.data },
            });
        } catch (error) {
            next(error);
        }
    }

    private createQueryOptions(request: Request): QueryOptions {
        const query = typeof request.query.query === 'string'
            ? request.query.query
            : typeof request.query.q === 'string'
                ? request.query.q
                : undefined;
        const page = this.parseNumber(request.query.page, 1);
        const limit = this.parseNumber(request.query.limit, 10);

        return new QueryOptions({
            id: Array.isArray(request.params.id)
                ? request.params.id[0]
                : request.params.id,
            page,
            limit,
            query,
        });
    }

    private parseNumber(value: unknown, fallback: number): number {
        const parsed = Number(Array.isArray(value) ? value[0] : value);
        return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
    }
}
