import { PrismaService } from '../PrismaService.js';
import { RedisService } from '../RedisService.js';
import { NormalizedNews } from './NewsNormalizer.js';

export class NewsRepository {
    public constructor(
        private readonly prisma: PrismaService = PrismaService.getInstance(),
        private readonly redis: RedisService = RedisService.getInstance(),
    ) {}

    public async save(newsItem: NormalizedNews) {
        const categoryId = await this.findCategoryId(newsItem.category);
        const saved = await this.prisma.news.create({
            data: {
                category_id: categoryId,
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

        await this.redis.set(`news:${saved.id}`, saved, 300);

        return saved;
    }

    private async findCategoryId(categoryText?: string): Promise<number> {
        const categories = await this.prisma.category.findMany({
            select: {
                id: true,
                name: true,
                label: true,
            },
        });

        const normalizedText = this.normalizeCategoryText(categoryText);
        const matchingCategory = categories
            .map((category) => ({
                category,
                score: this.getCategoryMatchScore(category, normalizedText),
            }))
            .filter(({ score }) => score > 0)
            .sort((left, right) => right.score - left.score)[0]?.category;

        const fallbackCategory = categories.find(
            (category) => this.normalizeCategoryText(category.name) === 'general',
        );

        const resolvedCategory = matchingCategory || fallbackCategory;
        if (!resolvedCategory) {
            throw new Error(
                'Nenhuma categoria correspondente foi encontrada e a categoria general não está cadastrada.',
            );
        }

        return resolvedCategory.id;
    }

    private getCategoryMatchScore(
        category: { name: string; label: string },
        normalizedText: string,
    ): number {
        if (!normalizedText) {
            return 0;
        }

        const normalizedName = this.normalizeCategoryText(category.name);
        const normalizedLabel = this.normalizeCategoryText(category.label);

        if (normalizedText === normalizedName || normalizedText === normalizedLabel) {
            return 3;
        }

        if (
            normalizedText.includes(normalizedName) ||
            normalizedName.includes(normalizedText) ||
            normalizedText.includes(normalizedLabel) ||
            normalizedLabel.includes(normalizedText)
        ) {
            return 2;
        }

        const categoryTerms = normalizedName.split(' ');
        return categoryTerms.some((term) => normalizedText.includes(term)) ? 1 : 0;
    }

    private normalizeCategoryText(value?: string): string {
        return (value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[_-]+/g, ' ')
            .replace(/[^\p{L}\p{N}\s]/gu, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
}
