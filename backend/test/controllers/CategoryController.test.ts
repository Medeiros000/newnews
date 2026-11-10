
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Request, Response } from 'express';

import CategoryController from '../../src/controllers/CategoryController.js';
import { CategoryMapper } from '../../src/mappers/CategoryMapper.js';

describe('CategoryController', () => {
  let controller: CategoryController;

  let prisma: any;
  let cache: any;
  let response: any;

  beforeEach(() => {
    prisma = {
      category: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    cache = {
      get: jest.fn(),
      set: jest.fn(),
    };

    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    controller = new CategoryController(prisma, cache);
  });

  describe('get()', () => {
    it('deve buscar categorias no banco quando não existirem no cache', async () => {
      // Arrange
      const categories = [
        { id: '1', name: 'Tecnologia' },
        { id: '2', name: 'Esportes' },
      ];

      cache.get.mockResolvedValue(null);
      prisma.category.findMany.mockResolvedValue(categories);

      const mapperSpy = jest.spyOn(
        CategoryMapper,
        'fromPrisma',
      );

      // Act
      await controller.get(
        {} as Request,
        response as Response,
      );

      // Assert
      expect(cache.get).toHaveBeenCalledWith('categories:list');

      expect(prisma.category.findMany).toHaveBeenCalledTimes(1);

      expect(mapperSpy).toHaveBeenCalledTimes(2);

      expect(cache.set).toHaveBeenCalledWith(
        'categories:list',
        expect.any(Array),
        300,
      );

      expect(response.status).toHaveBeenCalledWith(200);

      expect(response.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Array),
      });

      mapperSpy.mockRestore();
    });

    it('deve retornar categorias diretamente do cache', async () => {
      // Arrange
      const cachedCategories = [
        { id: '1', name: 'Tecnologia' },
        { id: '2', name: 'Esportes' },
      ];

      cache.get.mockResolvedValue(cachedCategories);

      // Act
      await controller.get(
        {} as Request,
        response as Response,
      );

      // Assert
      expect(cache.get).toHaveBeenCalledWith('categories:list');

      expect(prisma.category.findMany).not.toHaveBeenCalled();

      expect(cache.set).not.toHaveBeenCalled();

      expect(response.status).toHaveBeenCalledWith(200);

      expect(response.json).toHaveBeenCalledWith({
        success: true,
        data: cachedCategories,
      });
    });
  });

  describe('getById()', () => {
    it('deve buscar uma categoria no banco quando não existir no cache', async () => {
      // Arrange
      const category = {
        id: '1',
        name: 'Tecnologia',
      };

      cache.get.mockResolvedValue(null);

      prisma.category.findUnique.mockResolvedValue(category);

      const mapperSpy = jest.spyOn(
        CategoryMapper,
        'fromPrisma',
      );

      const request = {
        params: {
          id: '1',
        },
      } as Request<{ id: string }>;

      // Act
      await controller.getById(request, response as Response);

      // Assert
      expect(cache.get).toHaveBeenCalledWith('categories:1');

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: {
          id: '1',
        },
      });

      expect(mapperSpy).toHaveBeenCalledTimes(1);

      expect(cache.set).toHaveBeenCalledWith(
        'categories:1',
        expect.any(Object),
        300,
      );

      expect(response.status).toHaveBeenCalledWith(200);

      expect(response.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
      });

      mapperSpy.mockRestore();
    });

    it('deve retornar erro quando a categoria não for encontrada', async () => {
      // Arrange
      cache.get.mockResolvedValue(null);

      prisma.category.findUnique.mockResolvedValue(null);

      const mapperSpy = jest.spyOn(
        CategoryMapper,
        'fromPrisma',
      );

      const request = {
        params: {
          id: '999',
        },
      } as Request<{ id: string }>;

      // Act
      await controller.getById(request, response as Response);

      // Assert
      expect(cache.get).toHaveBeenCalledWith('categories:999');

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: {
          id: '999',
        },
      });

      expect(mapperSpy).not.toHaveBeenCalled();

      expect(cache.set).not.toHaveBeenCalled();

      expect(response.status).toHaveBeenCalledWith(400);

      expect(response.json).toHaveBeenCalledWith({
        message: 'Categoria não encontrada.',
      });

      mapperSpy.mockRestore();
    });
  });
});
