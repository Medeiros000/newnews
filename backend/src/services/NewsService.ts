import { QueryOptions } from '../queries/QueryOptions.js';
import { PrismaService } from './PrismaService.js';
import type { CacheProvider } from './cache/CacheProvider.js';
import { getSharedCacheProvider } from './cache/createCacheProvider.js';
import { CreateNewsDTO, INewsService, UpdateNewsDTO } from './interfaces/INewsService.js';
import { News } from '../models/entities/News.js';
import { NewsMapper } from '../mappers/NewsMapper.js';
import { generateSlug } from '../utils/slug.js';

export class NewsService implements INewsService {
  public constructor(
    private readonly prisma: PrismaService = PrismaService.getInstance(),
    private readonly cache: CacheProvider = getSharedCacheProvider(),
  ) {}

  public async getNews(queryOptions: QueryOptions): Promise<News[]> {
    const page = queryOptions.page && queryOptions.page > 0 ? queryOptions.page : 1;
    const limit = queryOptions.limit && queryOptions.limit > 0 ? queryOptions.limit : 10;
    const query = queryOptions.query?.trim() || undefined;
    const category = queryOptions.category?.trim() || undefined;
    const tag = queryOptions.tag?.trim() || undefined;

    const where = {
      ...(query && {
        OR: [{ title: { contains: query } }, { description: { contains: query } }],
      }),
      ...(category && {
        category: {
          is: {
            name: category,
          },
        },
      }),
      ...(tag && {
        tags: {
          some: {
            OR: [{ slug: tag }, { name: tag }],
          },
        },
      }),
    };

    const cacheKey = `news:list:${encodeURIComponent(
      query?.toLowerCase() || 'all',
    )}:cat:${category || 'all'}:tag:${tag || 'all'}:p:${page}:l:${limit}`;

    const cachedData = await this.cache.get<News[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const news = (
      await this.prisma.news.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: true,
          tags: true,
        },
      })
    ).map(NewsMapper.fromPrisma);

    await this.cache.set(cacheKey, news, 180);
    return news;
  }

  public async getNewsById(queryOptions: QueryOptions): Promise<News | null> {
    const id = queryOptions.id?.trim();
    if (!id) {
      return null;
    }

    const cacheKey = `news:${id}`;
    const cachedNews = await this.cache.get<News>(cacheKey);
    if (cachedNews) {
      return cachedNews;
    }

    const news = await this.prisma.news.findUnique({
      where: { id },
      include: {
        category: true,
        tags: true,
      },
    });
    if (!news) {
      return null;
    }

    const mappedNews = NewsMapper.fromPrisma(news);
    await this.cache.set(cacheKey, mappedNews, 300);
    return mappedNews;
  }

  public async getNewsBySlugAndIdPrefix(slug: string, idPrefix: string): Promise<News | null> {
    const cleanSlug = slug?.trim();
    const cleanPrefix = idPrefix?.trim();

    if (!cleanSlug || !cleanPrefix || cleanPrefix.length !== 8) {
      return null;
    }

    const cacheKey = `news:slug:${cleanSlug}:prefix:${cleanPrefix}`;
    const cachedNews = await this.cache.get<News>(cacheKey);
    if (cachedNews) {
      return cachedNews;
    }

    const newsItem = await this.prisma.news.findFirst({
      where: {
        slug: cleanSlug,
        id: {
          startsWith: cleanPrefix,
        },
      },
      include: {
        category: true,
        tags: true,
      },
    });

    if (!newsItem) {
      return null;
    }

    const mappedNews = NewsMapper.fromPrisma(newsItem);
    await this.cache.set(cacheKey, mappedNews, 300);
    return mappedNews;
  }

  public async getRelatedNews(queryOptions: QueryOptions): Promise<News[] | null> {
    const targetIdentifier = queryOptions.id?.trim();
    if (!targetIdentifier) {
      return null;
    }

    const limit = queryOptions.limit && queryOptions.limit > 0 ? queryOptions.limit : 6;
    const cacheKey = `news:${targetIdentifier}:related:limit:${limit}`;
    const cachedNews = await this.cache.get<News[]>(cacheKey);
    if (cachedNews) {
      return cachedNews;
    }

    // Busca a notícia alvo tanto por id completo quanto por slug ou prefixo de id
    const currentNews = await this.prisma.news.findFirst({
      where: {
        OR: [
          { id: targetIdentifier },
          { slug: targetIdentifier },
          ...(targetIdentifier.length === 8 ? [{ id: { startsWith: targetIdentifier } }] : []),
        ],
      },
      include: {
        tags: true,
      },
    });

    if (!currentNews) {
      return null;
    }

    const currentId = currentNews.id;
    const tagIds = currentNews.tags.map((t) => t.id);
    const relatedMap = new Map<string, any>();

    // 1. Prioridade 1: Ranquear notícias com o maior número de tags em comum
    if (tagIds.length > 0) {
      const candidatesByTag = await this.prisma.news.findMany({
        where: {
          id: { not: currentId },
          tags: {
            some: {
              id: { in: tagIds },
            },
          },
        },
        include: {
          category: true,
          tags: true,
        },
        take: limit * 2,
      });

      // Ordena por quantidade de tags em comum DESC e depois publishedAt DESC
      candidatesByTag.sort((a, b) => {
        const sharedA = a.tags.filter((t) => tagIds.includes(t.id)).length;
        const sharedB = b.tags.filter((t) => tagIds.includes(t.id)).length;
        if (sharedB !== sharedA) {
          return sharedB - sharedA;
        }
        return b.publishedAt.getTime() - a.publishedAt.getTime();
      });

      for (const item of candidatesByTag) {
        if (relatedMap.size >= limit) break;
        relatedMap.set(item.id, item);
      }
    }

    // 2. Prioridade 2: Fallback por similaridade de título com pg_trgm
    if (relatedMap.size < limit) {
      const needed = limit - relatedMap.size;
      const excludedIds = [currentId, ...Array.from(relatedMap.keys())];

      try {
        const similarityResults = await this.prisma.$queryRaw<Array<{ id: string; sim: number }>>`
          SELECT id, similarity(title, ${currentNews.title}) AS sim
          FROM news
          WHERE id NOT IN (${PrismaService.getInstance() ? excludedIds : ''})
            AND similarity(title, ${currentNews.title}) > 0.05
          ORDER BY sim DESC, published_at DESC
          LIMIT ${needed};
        `;

        if (Array.isArray(similarityResults) && similarityResults.length > 0) {
          const simIds = similarityResults.map((r) => r.id);
          const simNewsRecords = await this.prisma.news.findMany({
            where: { id: { in: simIds } },
            include: { category: true, tags: true },
          });

          // Mantém ordem dos resultados por similaridade
          const recordMap = new Map(simNewsRecords.map((r) => [r.id, r]));
          for (const s of similarityResults) {
            const found = recordMap.get(s.id);
            if (found && !relatedMap.has(found.id)) {
              relatedMap.set(found.id, found);
            }
          }
        }
      } catch (err) {
        console.warn('Busca de similaridade pg_trgm não disponível ou com erro, usando fallback comum:', err);
      }
    }

    // 3. Prioridade 3: Fallback final com as notícias mais recentes (excluindo atuais)
    if (relatedMap.size < limit) {
      const needed = limit - relatedMap.size;
      const excludedIds = [currentId, ...Array.from(relatedMap.keys())];

      const fallbackRecent = await this.prisma.news.findMany({
        where: {
          id: { notIn: excludedIds },
          categoryId: currentNews.categoryId, // prefere mesma categoria se houver
        },
        take: needed,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: true,
          tags: true,
        },
      });

      for (const item of fallbackRecent) {
        if (relatedMap.size >= limit) break;
        relatedMap.set(item.id, item);
      }

      // Se ainda não atingir, pega qualquer notícia mais recente
      if (relatedMap.size < limit) {
        const remainingNeeded = limit - relatedMap.size;
        const allExcluded = [currentId, ...Array.from(relatedMap.keys())];
        const anyRecent = await this.prisma.news.findMany({
          where: { id: { notIn: allExcluded } },
          take: remainingNeeded,
          orderBy: { publishedAt: 'desc' },
          include: { category: true, tags: true },
        });

        for (const item of anyRecent) {
          if (relatedMap.size >= limit) break;
          relatedMap.set(item.id, item);
        }
      }
    }

    const finalNews = Array.from(relatedMap.values()).map(NewsMapper.fromPrisma);
    await this.cache.set(cacheKey, finalNews, 180);
    return finalNews;
  }

  public async createNews(data: CreateNewsDTO): Promise<News> {
    const slug = generateSlug(data.title);
    const categoryRecord = await this.prisma.category.findFirst({
      where: {
        OR: [{ name: data.category }, { id: data.category }],
      },
    });

    if (!categoryRecord) {
      throw new Error(`Categoria não encontrada: ${data.category}`);
    }

    const tagConnectOrCreate = (data.tags || []).map((tagName) => {
      const trimmed = tagName.trim();
      const tagSlug = generateSlug(trimmed);
      return {
        where: { slug: tagSlug },
        create: { name: trimmed, slug: tagSlug },
      };
    });

    const created = await this.prisma.news.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        url: data.url,
        author: data.author || 'Redação',
        imageUrl: data.image_url || 'https://via.placeholder.com/800x400',
        language: data.language || 'pt-BR',
        source: new URL(data.url).hostname.replace(/^www\./, ''),
        publishedAt: data.published_at || new Date(),
        categoryId: categoryRecord.id,
        tags: {
          connectOrCreate: tagConnectOrCreate,
        },
      },
      include: {
        category: true,
        tags: true,
      },
    });

    // Invalidação de caches
    await this.invalidateNewsCaches(created.id, created.slug);
    return NewsMapper.fromPrisma(created);
  }

  public async updateNews(id: string, data: UpdateNewsDTO): Promise<News | null> {
    const existing = await this.prisma.news.findUnique({
      where: { id },
    });
    if (!existing) return null;

    let categoryId = existing.categoryId;
    if (data.category) {
      const cat = await this.prisma.category.findFirst({
        where: {
          OR: [{ name: data.category }, { id: data.category }],
        },
      });
      if (cat) categoryId = cat.id;
    }

    const tagConnectOrCreate = data.tags
      ? data.tags.map((tagName) => {
          const trimmed = tagName.trim();
          const tagSlug = generateSlug(trimmed);
          return {
            where: { slug: tagSlug },
            create: { name: trimmed, slug: tagSlug },
          };
        })
      : undefined;

    const updated = await this.prisma.news.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title, slug: generateSlug(data.title) }),
        ...(data.description && { description: data.description }),
        ...(data.url && { url: data.url }),
        ...(data.author && { author: data.author }),
        ...(data.image_url && { imageUrl: data.image_url }),
        ...(data.language && { language: data.language }),
        ...(data.published_at && { publishedAt: data.published_at }),
        categoryId,
        ...(tagConnectOrCreate && {
          tags: {
            set: [], // Limpa relações antigas
            connectOrCreate: tagConnectOrCreate,
          },
        }),
      },
      include: {
        category: true,
        tags: true,
      },
    });

    await this.invalidateNewsCaches(id, existing.slug, updated.slug);
    return NewsMapper.fromPrisma(updated);
  }

  public async deleteNews(id: string): Promise<boolean> {
    const existing = await this.prisma.news.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });
    if (!existing) return false;

    await this.prisma.news.delete({ where: { id } });
    await this.invalidateNewsCaches(id, existing.slug);
    return true;
  }

  private async invalidateNewsCaches(id: string, ...slugs: (string | undefined)[]): Promise<void> {
    await this.cache.del(`news:${id}`);
    await this.cache.delByPattern(`news:${id}:related:*`);
    await this.cache.delByPattern('news:list:*');
    await this.cache.delByPattern('tags:*');

    for (const slug of slugs) {
      if (slug) {
        await this.cache.delByPattern(`news:slug:${slug}:*`);
        await this.cache.delByPattern(`news:${slug}:related:*`);
      }
    }
  }
}
