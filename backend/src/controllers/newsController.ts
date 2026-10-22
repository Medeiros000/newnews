import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaService } from '../services/PrismaServce.js';
import { RedisService } from '../services/RedisService.js';

const newsQuerySchema = z
    .object({
        query: z.string().trim().max(200).optional(),
        q: z.string().trim().max(200).optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
    })
    .transform(({ query, q, ...pagination }) => ({
        query: query || q,
        ...pagination,
    }));

// Schema para a rota de notícias relacionadas
const relatedNewsSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'O ID da notícia é obrigatório'),
    }),
    query: z.object({
        limit: z.coerce.number().int().min(1).max(50).default(4),
    }),
});

// Define the type for the response payload
type NewsListPayload = {
    type: 'search' | 'all';
    query: string | null;
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
    data: Awaited<ReturnType<PrismaService['news']['findMany']>>;
};
export class NewsController {
    public constructor(
        private readonly prisma: PrismaService,
        protected readonly redis: RedisService,
    ) {}

    public async getNews(request: Request, response: Response, next: NextFunction) {
        const result = newsQuerySchema.safeParse(request.query);

        if (!result.success) {
            response.status(400).json({
                error: 'Invalid query parameters',
                issues: result.error.issues,
            });
            return;
        }

        const { query, page, limit } = result.data;
        const where = query
            ? {
                OR: [
                    { title: { contains: query } },
                    { summary: { contains: query } },
                    { content: { contains: query } },
                ],
            }
            : undefined;
        const cacheKey = `news:list:${encodeURIComponent(
            query?.toLowerCase() || 'all',
        )}:page:${page}:limit:${limit}`;

        try {
            const cachedData = await this.redis.get<NewsListPayload>(cacheKey);
            if (cachedData) {
                return response.status(200).json({
                    source: 'cache',
                    ...cachedData,
                });
            }

            const [news, totalItems] = await Promise.all([
                this.prisma.news.findMany({
                    skip: (page - 1) * limit,
                    take: limit,
                    where,
                    orderBy: {
                        published_at: 'desc',
                    },
                }),
                this.prisma.news.count({ where }),
            ]);

            const responsePayload: NewsListPayload = {
                type: query ? 'search' : 'all',
                query: query || null,
                pagination: {
                    page,
                    limit,
                    totalItems,
                    totalPages: Math.ceil(totalItems / limit),
                },
                data: news,
            };

            await this.redis.set(cacheKey, responsePayload, 180);

            return response.status(200).json({
                source: 'database',
                ...responsePayload,
            });
        } catch (error) {
            next(error);
        }
    }

    public async searchNews(request: Request, response: Response, next: NextFunction) {
        const result = newsQuerySchema.safeParse(request.query);

        if (!result.success) {
            response.status(400).json({
                error: 'Invalid query parameters',
                issues: result.error.issues,
            });
            return;
        }

        const { query, page, limit } = result.data;
        const where = query
            ? {
                OR: [
                    { title: { contains: query } },
                    { summary: { contains: query } },
                    { content: { contains: query } },
                ],
            }
            : undefined;
        const cacheKey = `news:list:${encodeURIComponent(
            query?.toLowerCase() || 'all',
        )}:page:${page}:limit:${limit}`;

        try {
            const cachedData = await this.redis.get<NewsListPayload>(cacheKey);
            if (cachedData) {
                return response.status(200).json({
                    source: 'cache',
                    ...cachedData,
                });
            }

            const [news, totalItems] = await Promise.all([
                this.prisma.news.findMany({
                    skip: (page - 1) * limit,
                    take: limit,
                    where,
                    orderBy: {
                        published_at: 'desc',
                    },
                }),
                this.prisma.news.count({ where }),
            ]);

            const responsePayload: NewsListPayload = {
                type: query ? 'search' : 'all',
                query: query || null,
                pagination: {
                    page,
                    limit,
                    totalItems,
                    totalPages: Math.ceil(totalItems / limit),
                },
                data: news,
            };

            await this.redis.set(cacheKey, responsePayload, 180);

            return response.status(200).json({
                source: 'database',
                ...responsePayload,
            });
        } catch (error) {
            next(error);
        }
    }

    public async getNewsById(request: Request, response: Response, next: NextFunction) {
        const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
        if (!id) {
            response.status(400).json({ success: false, error: 'ID inválido' });
            return;
        }

        const cacheKey = `news:${id}`;

        try {
            // 1. Check cache (Article cache hit?)
            const cachedNews = await this.redis.get(cacheKey);
            if (cachedNews) {
                response.setHeader('X-Cache', 'HIT');
                response.json({ success: true, data: cachedNews });
                return;
            }

            // 2. On cache miss, fetch from database
            const news = await this.prisma.news.findUnique({ where: { id } });

            if (!news) {
                response.status(404).json({ success: false, error: 'Notícia não encontrada' });
                return;
            }

            // 3. Save to cache with a 5-minute TTL (300s)
            await this.redis.set(cacheKey, news, 300);

            response.setHeader('X-Cache', 'MISS');
            response.json({ success: true, data: news });
        } catch (error) {
            next(error);
        }
    }

    public async getRelatedNews(request: Request, response: Response, next: NextFunction) {
        const result = relatedNewsSchema.safeParse({
            params: request.params,
            query: request.query,
        });

        if (!result.success) {
            response.status(400).json({
                error: 'Invalid parameters',
                issues: result.error.issues,
            });
            return;
        }

        const { id } = result.data.params;
        const { limit } = result.data.query;

        const cacheKey = `news:${id}:related:limit:${limit}`;

        try {
            // 1. Tenta recuperar do Cache Redis
            const cachedData = await this.redis.get<NewsListPayload>(cacheKey);
            if (cachedData) {
                response.setHeader('X-Cache', 'HIT');
                return response.status(200).json({
                    success: true,
                    data: {
                        news: cachedData,
                    },
                });
            }

            // 2. Busca a notícia principal para pegar a category_id
            const currentNews = await this.prisma.news.findUnique({
                where: { id },
                select: { id: true, category_id: true },
            });

            if (!currentNews) {
                return response.status(404).json({
                    success: false,
                    error: 'Notícia não encontrada',
                });
            }

            // 3. Busca notícias da mesma categoria excluindo a atual
            const relatedNews = await this.prisma.news.findMany({
                where: {
                    category_id: currentNews.category_id,
                    id: { not: currentNews.id },
                },
                take: limit,
                orderBy: {
                    published_at: 'desc',
                },
                select: {
                    id: true,
                    title: true,
                    summary: true,
                    image_url: true,
                    published_at: true,
                },
            });

            // 4. Armazena no Redis (TTL de 5 minutos / 300s)
            await this.redis.set(cacheKey, relatedNews, 300);

            response.setHeader('X-Cache', 'MISS');
            return response.status(200).json({
                success: true,
                data: {
                    news: relatedNews,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}
