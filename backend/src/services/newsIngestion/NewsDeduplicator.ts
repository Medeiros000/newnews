import { PrismaService } from '../PrismaServce.js';
import { NormalizedNews } from './NewsNormalizer.js';

export class NewsDeduplicator {
    constructor(private readonly prisma: PrismaService) {}

    async filterDuplicates(items: NormalizedNews[]): Promise<NormalizedNews[]> {
        if (items.length === 0) return [];

        const titles = items.map((i) => i.title);

        // Busca em lote no banco de dados (evita N+1 queries)
        const existingRecords = await this.prisma.news.findMany({
            where: {
                title: {
                    in: titles,
                },
            },
            select: {
                title: true,
            },
        });

        const existingTitleSet = new Set(existingRecords.map((r) => r.title));

        // Filtra itens que já existem por título
        return items.filter((item) => {
            if (existingTitleSet.has(item.title)) {
                console.log(`🔁 Duplicada ignorada (Título): "${item.title}"`);
                return false;
            }
            return true;
        });
    }
}
