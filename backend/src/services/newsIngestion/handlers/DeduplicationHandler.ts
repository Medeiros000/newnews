import { PrismaService } from '../../PrismaService.js';
import type { NormalizedNews } from '../NewsNormalizer.js';
import { AbstractNewsHandler } from './INewsHandler.js';
import { Logger } from '../../../utils/Logger.js';

export class DeduplicationHandler extends AbstractNewsHandler<NormalizedNews, NormalizedNews> {
    private readonly logger = new Logger('DeduplicationHandler');
    private readonly prisma: PrismaService;
    private existingTitles = new Set<string>();
    private existingSlugs = new Set<string>();
    private seenTitles = new Set<string>();
    private seenSlugs = new Set<string>();
    private initialized = false;

    public constructor(prisma: PrismaService = PrismaService.getInstance()) {
        super();
        this.prisma = prisma;
    }

    public async preloadExisting(articles: NormalizedNews[]): Promise<void> {
        if (articles.length === 0) return;

        const titles = articles.map((a) => a.title);
        const slugs = articles.map((a) => a.slug);

        const existingRecords = await this.prisma.news.findMany({
            where: {
                OR: [{ title: { in: titles } }, { slug: { in: slugs } }],
            },
            select: { title: true, slug: true },
        });

        this.existingTitles = new Set(existingRecords.map((r) => r.title));
        this.existingSlugs = new Set(existingRecords.map((r) => r.slug));
        this.initialized = true;
    }

    public async handle(news: NormalizedNews): Promise<NormalizedNews | null> {
        if (!this.initialized) {
            const existing = await this.prisma.news.findFirst({
                where: {
                    OR: [{ title: news.title }, { slug: news.slug }],
                },
                select: { id: true },
            });
            if (existing) {
                this.logger.info(`Duplicada ignorada (existente no banco): "${news.title}"`);
                return null;
            }
        } else if (this.existingTitles.has(news.title) || this.existingSlugs.has(news.slug)) {
            this.logger.info(`Duplicada ignorada (existente no banco): "${news.title}"`);
            return null;
        }

        if (this.seenTitles.has(news.title) || this.seenSlugs.has(news.slug)) {
            this.logger.info(`Duplicada ignorada (repetida no lote): "${news.title}"`);
            return null;
        }

        this.seenTitles.add(news.title);
        this.seenSlugs.add(news.slug);
        return this.passToNext(news);
    }
}
