import { PrismaService } from '../../lib/prisma.js';
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

        // Set inicial com o que já está salvo no banco
        const existingTitleSet = new Set(existingRecords.map((r) => r.title));

        // Filtra itens que já existem no banco ou duplicados no mesmo lote
        return items.filter((item) => {
            if (existingTitleSet.has(item.title)) {
                console.log(`🔁 Duplicada ignorada (Título): "${item.title}"`);
                return false;
            }
            
            // Adiciona o título ao Set dinamicamente para barrar duplicadas no mesmo lote
            existingTitleSet.add(item.title);
            return true;
        });
    }
}