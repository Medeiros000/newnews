import { PrismaService } from '../PrismaServce.js';
import { RedisService } from '../RedisService.js';
import { NormalizedNews } from './NewsNormalizer.js';

export class NewsRepository {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redis?: RedisService,
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

        if (this.redis) {
            await this.redis.set(`news:${saved.id}`, saved, 300);
        }

        return saved;
    }
}
