import { describe, expect, it, jest } from '@jest/globals';
import { NewsController } from '../../src/controllers/NewsController.js';
import { INewsService } from '../../src/services/interfaces/INewsService.js';
import { News } from '../../src/models/entities/News.js';

describe('NewsController - getNewsBySlugAndIdPrefix', () => {
  const mockNews = new News(
    '12345678-abcd-ef01-2345-6789abcdef01',
    'cat-1',
    'Título da Notícia',
    'Descrição',
    'https://example.com/noticia',
    'Autor',
    'https://example.com/foto.jpg',
    'pt-BR',
    'example.com',
    new Date('2026-11-25T10:00:00Z'),
    'titulo-da-noticia',
  );

  it('retorna 200 e a notícia quando encontrada pelo slug e prefixo de 8 caracteres', async () => {
    const mockService: Partial<INewsService> = {
      getNewsBySlugAndIdPrefix: jest.fn<INewsService['getNewsBySlugAndIdPrefix']>().mockResolvedValue(mockNews),
    };
    const controller = new NewsController(mockService as INewsService);

    const req: any = {
      params: { slug: 'titulo-da-noticia', idPrefix: '12345678' },
      query: {},
    };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await controller.getNewsBySlugAndIdPrefix(req, res, next);

    expect(mockService.getNewsBySlugAndIdPrefix).toHaveBeenCalledWith(
      'titulo-da-noticia',
      '12345678',
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockNews });
  });

  it('retorna 400 se o prefixo de ID não tiver 8 caracteres', async () => {
    const mockService: Partial<INewsService> = {
      getNewsBySlugAndIdPrefix: jest.fn<INewsService['getNewsBySlugAndIdPrefix']>(),
    };
    const controller = new NewsController(mockService as INewsService);

    const req: any = {
      params: { slug: 'titulo-da-noticia', idPrefix: '123' },
      query: {},
    };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await controller.getNewsBySlugAndIdPrefix(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
    expect(mockService.getNewsBySlugAndIdPrefix).not.toHaveBeenCalled();
  });

  it('retorna 404 se a notícia não for encontrada', async () => {
    const mockService: Partial<INewsService> = {
      getNewsBySlugAndIdPrefix: jest.fn<INewsService['getNewsBySlugAndIdPrefix']>().mockResolvedValue(null),
    };
    const controller = new NewsController(mockService as INewsService);

    const req: any = {
      params: { slug: 'titulo-inexistente', idPrefix: '12345678' },
      query: {},
    };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await controller.getNewsBySlugAndIdPrefix(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Notícia não encontrada',
    });
  });
});
