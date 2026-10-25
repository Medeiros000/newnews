import { PrismaService } from '../PrismaService.js';
import { NormalizedNews } from './NewsNormalizer.js';

export class NewsDeduplicator {
    public constructor(
        private readonly prisma: PrismaService = PrismaService.getInstance(),
    ) {}

    public async filterDuplicates(items: NormalizedNews[]): Promise<NormalizedNews[]> {
        if (items.length === 0) return [];

        const titles = items.map((i) => i.title);
        const slugs = items.map((i) => i.slug);

        const existingRecords = await this.prisma.news.findMany({
            where: {
                OR: [
                    { title: { in: titles } },
                    { slug: { in: slugs } },
                ],
            },
            select: {
                title: true,
                slug: true,
            },
        });

        const existingTitleSet = new Set(existingRecords.map((record) => record.title));
        const existingSlugSet = new Set(existingRecords.map((record) => record.slug));
        const seenTitles = new Set<string>();
        const seenSlugs = new Set<string>();

        return items.filter((item) => {
            if (existingTitleSet.has(item.title) || existingSlugSet.has(item.slug)) {
                console.log(`🔁 Duplicada ignorada (Título/slug): "${item.title}"`);
                return false;
            }

            if (seenTitles.has(item.title) || seenSlugs.has(item.slug)) {
                console.log(`🔁 Duplicada ignorada no lote (Título/slug): "${item.title}"`);
                return false;
            }

            seenTitles.add(item.title);
            seenSlugs.add(item.slug);
            return true;
        });
    }
}
