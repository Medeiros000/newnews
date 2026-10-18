import { prisma } from '../../lib/prisma.js';
import { NormalizedNews } from './NewsNormalizer.js';

export class NewsRepository {
  async save(newsItem: NormalizedNews) {
    return await prisma.news.create({
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
  }
}