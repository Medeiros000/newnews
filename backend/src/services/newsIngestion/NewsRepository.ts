import { PrismaService } from '../PrismaService.js';
import { RedisService } from '../RedisService.js';
import { NormalizedNews } from './NewsNormalizer.js';

export class NewsRepository {
    private readonly prisma: PrismaService;
    private readonly redis: RedisService;
    public constructor() {
        this.prisma = PrismaService.getInstance();
        this.redis = RedisService.getInstance();
    }

    public async save(newsItem: NormalizedNews) {
        const categoryId = await this.findCategoryId(newsItem.category);
        const saved = await this.prisma.news.create({
            data: {
                category_id: categoryId,
                badge_bg: newsItem.badge_bg,
                title: newsItem.title,
                slug: newsItem.slug,
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

    private async findCategoryId(categoryTexts?: string[]): Promise<number> {
        const categories = await this.prisma.category.findMany({
            select: {
                id: true,
                name: true,
                label: true,
            },
        });

        const matchingCategory = categories
            .map((category) => ({
                category,
                score: (categoryTexts || [])
                    .map((categoryText) =>
                        this.getCategoryMatchScore(category, this.normalizeCategoryText(categoryText)),
                    )
                    .reduce((bestScore, score) => Math.max(bestScore, score), 0),
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

        if (matchingCategory) {
            console.log(
                `📂 Categoria "${categoryTexts?.join(', ')}" associada a "${matchingCategory.name}" (ID ${matchingCategory.id}).`,
            );
        } else {
            console.warn(
                `⚠️ Nenhuma categoria da API correspondeu a "${categoryTexts?.join(', ') || 'nenhuma'}"; usando "${resolvedCategory.name}" (ID ${resolvedCategory.id}).`,
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

        if (normalizedText === normalizedName) {
            return 100;
        }

        if (normalizedText === normalizedLabel) {
            return 90;
        }

        const textTerms = normalizedText.split(' ');
        const nameTerms = normalizedName.split(' ');
        const labelTerms = normalizedLabel.split(' ');
        const hasExactTerm = nameTerms.some((term) => textTerms.includes(term))
            || labelTerms.some((term) => textTerms.includes(term));

        if (hasExactTerm) {
            return 80;
        }

        if (normalizedName.includes(normalizedText) || normalizedLabel.includes(normalizedText)) {
            return 60;
        }

        return 0;
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
