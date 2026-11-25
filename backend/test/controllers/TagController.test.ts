import { describe, expect, it, jest } from '@jest/globals';
import { TagController } from '../../src/controllers/TagController.js';
import { ITagService } from '../../src/services/interfaces/ITagService.js';
import { Tag } from '../../src/models/entities/Tag.js';
import { News } from '../../src/models/entities/News.js';

describe('TagController', () => {
  it('retorna lista de tags com sucesso', async () => {
    const mockTags = [
      new Tag('1', 'Tecnologia', 'tecnologia', new Date(), 5),
      new Tag('2', 'IA', 'ia', new Date(), 3),
    ];
    const mockService: Partial<ITagService> = {
      getTags: jest.fn<ITagService['getTags']>().mockResolvedValue(mockTags),
    };
    const controller = new TagController(mockService as ITagService);

    const req: any = { query: { q: 'tec', limit: '10' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await controller.getTags(req, res, next);

    expect(mockService.getTags).toHaveBeenCalledWith('tec', 10);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockTags });
  });

  it('retorna notícias por tag com sucesso', async () => {
    const mockTag = new Tag('1', 'Tecnologia', 'tecnologia');
    const mockNews = [
      new News(
        '1',
        'cat1',
        'Notícia 1',
        'Desc',
        'https://site.com/1',
        'Autor',
        'https://site.com/img.jpg',
        'pt-BR',
        'site.com',
        new Date(),
        'noticia-1',
        [mockTag],
      ),
    ];
    const mockService: Partial<ITagService> = {
      getNewsByTagSlug: jest.fn<ITagService['getNewsByTagSlug']>().mockResolvedValue({
        tag: mockTag,
        news: mockNews,
      }),
    };
    const controller = new TagController(mockService as ITagService);

    const req: any = { params: { slug: 'tecnologia' }, query: { page: '1', limit: '10' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await controller.getNewsByTagSlug(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { tag: mockTag, news: mockNews },
    });
  });
});
