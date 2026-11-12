import { News } from '../models/entities/News.js';
import type { News as PrismaNews } from '../../generated/prisma/client.js';

export class NewsMapper {
  static fromPrisma(prismaNews: PrismaNews): News {
    return new News(
      prismaNews.id,
      prismaNews.category_id,
      prismaNews.title,
      prismaNews.description,
      prismaNews.url,
      prismaNews.author,
      prismaNews.image_url,
      prismaNews.language,
      prismaNews.source,
      prismaNews.published_at,
    );
  }
}
