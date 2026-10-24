import { News } from '../models/entities/News.js';
import type { News as PrismaNews } from '../../generated/prisma/client.js';

export class NewsMapper {
    static fromPrisma(prismaNews: PrismaNews): News {
        return new News(
            prismaNews.id,
            prismaNews.category_id,
            prismaNews.badge_bg,
            prismaNews.title,
            prismaNews.slug,
            prismaNews.content,
            prismaNews.image_url,
            prismaNews.published_at,
            prismaNews.author,
            prismaNews.source
        );
    }
}