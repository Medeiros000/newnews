import type { Prisma } from '../../generated/prisma/client.js';
import { QueryOptions } from '../commands/QueryOptions.js';
import { PrismaService } from './PrismaService.js';
import { RedisService } from './RedisService.js';
import type { INewsService } from './interfaces/INewsService.js';

export type NewsListPayload = {
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

export type NewsByIdResult = {
    data: Prisma.NewsGetPayload<object>;
    fromCache: boolean;
};

export type RelatedNews = Prisma.NewsGetPayload<{
    select: {
        id: true;
        title: true;
        summary: true;
        image_url: true;
        published_at: true;
    };
}>;

export type RelatedNewsResult = {
    data: RelatedNews[];
    fromCache: boolean;
};

export class NewsService implements INewsService {
    public constructor(
        private readonly prisma: PrismaService = PrismaService.getInstance(),
        private readonly redis: RedisService = RedisService.getInstance(),
    ) {
    }

    public async getNews(
        queryOptions: QueryOptions,
    ): Promise<{ data: NewsListPayload; fromCache: boolean }> {
        const page = queryOptions.page || 1;
        const limit = queryOptions.limit || 10;
        const query = queryOptions.query?.trim() || undefined;
        const where: Prisma.NewsWhereInput | undefined = query
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
        const cachedData = await this.redis.get<NewsListPayload>(cacheKey);
        if (cachedData) {
            return { data: cachedData, fromCache: true };
        }

        const [news, totalItems] = await Promise.all([
            this.prisma.news.findMany({
                skip: (page - 1) * limit,
                take: limit,
                where,
                orderBy: { published_at: 'desc' },
            }),
            this.prisma.news.count({ where }),
        ]);
        const payload: NewsListPayload = {
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
        await this.redis.set(cacheKey, payload, 180);
        return { data: payload, fromCache: false };
    }

    public async getNewsById(queryOptions: QueryOptions) {
        if (!queryOptions.id) {
            return null;
        }

        const cacheKey = `news:${queryOptions.id}`;
        const cachedNews = await this.redis.get<Prisma.NewsGetPayload<object>>(cacheKey);
        if (cachedNews) {
            return { data: cachedNews, fromCache: true };
        }

        const news = await this.prisma.news.findUnique({
            where: { id: queryOptions.id },
        });
        if (!news) {
            return null;
        }

        await this.redis.set(cacheKey, news, 300);
        return { data: news, fromCache: false };
    }

    public async getRelatedNews(queryOptions: QueryOptions) {
        if (!queryOptions.id) {
            return null;
        }

        const limit = queryOptions.limit || 4;
        const cacheKey = `news:${queryOptions.id}:related:limit:${limit}`;
        const cachedNews = await this.redis.get<RelatedNews[]>(cacheKey);
        if (cachedNews) {
            return { data: cachedNews, fromCache: true };
        }

        const currentNews = await this.prisma.news.findUnique({
            where: { id: queryOptions.id },
            select: { id: true, category_id: true },
        });
        if (!currentNews) {
            return null;
        }

        const relatedNews = await this.prisma.news.findMany({
            where: {
                category_id: currentNews.category_id,
                id: { not: currentNews.id },
            },
            take: limit,
            orderBy: { published_at: 'desc' },
            select: {
                id: true,
                title: true,
                summary: true,
                image_url: true,
                published_at: true,
            },
        });
        await this.redis.set(cacheKey, relatedNews, 300);
        return { data: relatedNews, fromCache: false };
    }
}
