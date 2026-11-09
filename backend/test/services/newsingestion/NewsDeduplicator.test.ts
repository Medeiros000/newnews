import { NewsDeduplicator } from '../../../src/services/newsIngestion/NewsDeduplicator.js';
import { PrismaService } from '../../../src/lib/prisma.js';
import { mockNoticiasEntrada, mockRetornoBancoPrisma } from './newsmocks/news.mock.js';

describe('NewsDeduplicator', () => {
  let deduplicator: NewsDeduplicator;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      news: {
        findMany: jest.fn(),
      },
    };

    deduplicator = new NewsDeduplicator(prismaMock as PrismaService);
  });

  test('deve retornar um array vazio se a lista de entrada estiver vazia', async () => {
    const result = await deduplicator.filterDuplicates([]);
    expect(result).toEqual([]);
  });

  test('deve filtrar duplicatas do banco e títulos repetidos no mesmo lote corretamente', async () => {
    prismaMock.news.findMany.mockResolvedValue(mockRetornoBancoPrisma);

    const result = await deduplicator.filterDuplicates(mockNoticiasEntrada);

    expect(result.length).toBe(2);
    expect(result[0].title).toBe('TypeScript 5.5 Lançado');
    expect(result[1].title).toBe('Node.js v22 Atualizações');

    expect(prismaMock.news.findMany).toHaveBeenCalledWith({
      where: {
        title: {
          in: mockNoticiasEntrada.map((i) => i.title),
        },
      },
      select: {
        title: true,
      },
    });
  });
});