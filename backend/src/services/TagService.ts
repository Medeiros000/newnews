import { PrismaService } from './PrismaService.js';
import type { CacheProvider } from './cache/CacheProvider.js';
import { getSharedCacheProvider } from './cache/createCacheProvider.js';
import { ITagService } from './interfaces/ITagService.js';
import { Tag } from '../models/entities/Tag.js';
import { News } from '../models/entities/News.js';
import { TagMapper } from '../mappers/TagMapper.js';
import { NewsMapper } from '../mappers/NewsMapper.js';
import { QueryOptions } from '../queries/QueryOptions.js';
import { generateSlug } from '../utils/slug.js';

export class TagService implements ITagService {
  public constructor(
    private readonly prisma: PrismaService = PrismaService.getInstance(),
    private readonly cache: CacheProvider = getSharedCacheProvider(),
  ) {}

  public async getTags(searchQuery?: string, limit = 20): Promise<Tag[]> {
    const q = searchQuery?.trim();
    const cacheKey = `tags:list:${q ? encodeURIComponent(q.toLowerCase()) : 'all'}:limit:${limit}`;
    const cached = await this.cache.get<Tag[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { slug: { contains: generateSlug(q) } },
          ],
        }
      : undefined;

    const tags = await this.prisma.tag.findMany({
      where,
      take: limit,
      include: {
        _count: {
          select: { news: true },
        },
      },
      orderBy: {
        news: {
          _count: 'desc',
        },
      },
    });

    const mapped = tags.map(TagMapper.fromPrisma);
    await this.cache.set(cacheKey, mapped, 300);
    return mapped;
  }

  public async getNewsByTagSlug(
    slug: string,
    queryOptions: QueryOptions,
  ): Promise<{ tag: Tag; news: News[] } | null> {
    const cleanSlug = slug?.trim();
    if (!cleanSlug) return null;

    const page = queryOptions.page > 0 ? queryOptions.page : 1;
    const limit = queryOptions.limit > 0 ? queryOptions.limit : 10;

    const cacheKey = `tags:${cleanSlug}:news:page:${page}:limit:${limit}`;
    const cached = await this.cache.get<{ tag: Tag; news: News[] }>(cacheKey);
    if (cached) {
      return cached;
    }

    const tagRecord = await this.prisma.tag.findUnique({
      where: { slug: cleanSlug },
      include: {
        _count: { select: { news: true } },
      },
    });

    if (!tagRecord) {
      return null;
    }

    const newsRecords = await this.prisma.news.findMany({
      where: {
        tags: {
          some: {
            slug: cleanSlug,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { published_at: 'desc' },
      include: {
        category: true,
        tags: true,
      },
    });

    const result = {
      tag: TagMapper.fromPrisma(tagRecord),
      news: newsRecords.map(NewsMapper.fromPrisma),
    };

    await this.cache.set(cacheKey, result, 180);
    return result;
  }
}
