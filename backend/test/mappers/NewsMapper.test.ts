import { NewsMapper } from '../../src/mappers/NewsMapper.js';

describe('NewsMapper', () => {
  it('maps Prisma news fields to the matching entity fields', () => {
    const publishedAt = new Date('2026-11-11T23:20:17.000Z');
    const prismaNews = {
      id: 'news-id',
      category_id: 'category-id',
      title: 'Título',
      description: 'Descrição',
      url: 'https://example.com/news',
      author: 'Autor',
      image_url: 'https://example.com/image.jpg',
      language: 'pt',
      source: 'example.com',
      published_at: publishedAt,
    };

    expect(NewsMapper.fromPrisma(prismaNews)).toEqual({
      id: 'news-id',
      category_id: 'category-id',
      title: 'Título',
      description: 'Descrição',
      url: 'https://example.com/news',
      author: 'Autor',
      image_url: 'https://example.com/image.jpg',
      language: 'pt',
      source: 'example.com',
      published_at: publishedAt,
    });
  });
});
