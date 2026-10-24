import { QueryOptions } from '../queries/QueryOptions.js';
import { CreateNewsDto } from '../dtos/CreateNewsDto.js';
import { PrismaService } from './PrismaService.js';
import { RedisService } from './RedisService.js';
import { INewsService } from './interfaces/INewsService.js';
import { News } from '../models/entities/News.js';
import { NewsMapper } from '../mappers/NewsMapper.js';

export class NewsService implements INewsService {
    public constructor(
        private readonly prisma: PrismaService = PrismaService.getInstance(),
        private readonly redis: RedisService = RedisService.getInstance(),
    ) {
    }

    public async getNews(queryOptions: QueryOptions): Promise<News[]> {
        const page = queryOptions.page && queryOptions.page > 0 ? queryOptions.page : 1;
        const limit = queryOptions.limit && queryOptions.limit > 0 ? queryOptions.limit : 10;
        const query = queryOptions.query?.trim() || undefined;
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
        const cachedData = await this.redis.get<News[]>(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        const news = (
            await this.prisma.news.findMany({
                skip: (page - 1) * limit,
                take: limit,
                where,
                orderBy: { published_at: 'desc' },
            })
        ).map(NewsMapper.fromPrisma);

        await this.redis.set(cacheKey, news, 180);
        return news;
    }

    public async createNews(input: CreateNewsDto): Promise<News> {
        const savedNews = await this.prisma.news.create({
            data: input,
        });

        await this.redis.delByPattern('news:list:*');
        return NewsMapper.fromPrisma(savedNews);
    }

    public async getNewsById(queryOptions: QueryOptions): Promise<News | null> {
        const id = queryOptions.id?.trim();
        if (!id) {
            return null;
        }

        const cacheKey = `news:${id}`;
        const cachedNews = await this.redis.get<News>(cacheKey);
        if (cachedNews) {
            return cachedNews;
        }

        const news = await this.prisma.news.findUnique({
            where: { id },
        });
        if (!news) {
            return null;
        }

        const mappedNews = NewsMapper.fromPrisma(news);
        await this.redis.set(cacheKey, mappedNews, 300);
        return mappedNews;
    }

    public async getRelatedNews(queryOptions: QueryOptions): Promise<News[] | null> {
        const id = queryOptions.id?.trim();
        if (!id) {
            return null;
        }

        const limit = queryOptions.limit && queryOptions.limit > 0 ? queryOptions.limit : 4;
        const cacheKey = `news:${id}:related:limit:${limit}`;
        const cachedNews = await this.redis.get<News[]>(cacheKey);
        if (cachedNews) {
            return cachedNews;
        }

        const currentNews = await this.prisma.news.findUnique({
            where: { id },
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
        });
        const mappedNews = relatedNews.map(NewsMapper.fromPrisma);
        await this.redis.set(cacheKey, mappedNews, 300);
        return mappedNews;
    }
}
