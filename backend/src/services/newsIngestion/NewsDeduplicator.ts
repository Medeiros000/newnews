
import { prisma } from '../../lib/prisma.js';
import { NormalizedNews } from './NewsNormalizer.js';

export class NewsDeduplicator {
  async filterDuplicates(items: NormalizedNews[]): Promise<NormalizedNews[]> {
    if (items.length === 0) return [];

    const titles = items.map(i => i.title);

    // Busca em lote no banco de dados (evita N+1 queries)
    const existingRecords = await prisma.news.findMany({
      where: {
        title: {
          in: titles,
        },
      },
      select: {
        title: true,
        image_url: true,
      },
    });

    // Tipagem explícita (r: { title: string }) para o TypeScript parar de reclamar
    const existingTitleSet = new Set(existingRecords.map((r: { title: string }) => r.title));

    // Filtra itens que já existem por título
    return items.filter(item => {
      if (existingTitleSet.has(item.title)) {
        console.log(`🔁 Duplicada ignorada (Título): "${item.title}"`);
        return false;
      }
      return true;
    });
  }
}