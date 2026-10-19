import { PrismaService } from '../../lib/prisma.js';
import { RedisService } from '../../lib/redis.js';
import { NormalizedNews } from './NewsNormalizer.js';

export class NewsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache?: RedisService
  ) {}

  async save(newsItem: NormalizedNews) {
    const saved = await this.prisma.news.create({
      data: {
        category_id: newsItem.category_id,
        badge_bg: newsItem.badge_bg,
        title: newsItem.title,
        summary: newsItem.summary,
        content: newsItem.content,
        image_url: newsItem.image_url,
        published_at: newsItem.published_at,
        author: newsItem.author,
        source: newsItem.source,
      },
    });

    if (this.cache) {
      await this.cache.set(`news:${saved.id}`, saved, 300);
    }

    return saved;
  }
}