import { News } from '../models/entities/News.js';
import { TagMapper } from './TagMapper.js';
import type { News as PrismaNews, Tag as PrismaTag } from '../../generated/prisma/client.js';

type PrismaNewsWithTags = PrismaNews & {
  tags?: PrismaTag[];
};

export class NewsMapper {
  static fromPrisma(prismaNews: PrismaNewsWithTags): News {
    const tags = prismaNews.tags ? prismaNews.tags.map(TagMapper.fromPrisma) : [];

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
      prismaNews.slug ?? '',
      tags,
    );
  }
}
