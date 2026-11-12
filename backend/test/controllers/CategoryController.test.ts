
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Request, Response } from 'express';

import { CategoryController } from '../../src/controllers/CategoryController.js';

describe('CategoryController', () => {
  let controller: CategoryController;

  let service: any;
  let response: any;

  beforeEach(() => {
    service = {
      getAllCategories: jest.fn(),
      getCategoryById: jest.fn(),
    };

    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    controller = new CategoryController(service);
  });

  describe('get()', () => {
    it('deve retornar categorias obtidas pelo serviço', async () => {
      // Arrange
      const categories = [
        { id: '1', name: 'Tecnologia' },
        { id: '2', name: 'Esportes' },
      ];

      service.getAllCategories.mockResolvedValue(categories);

      // Act
      await controller.getAllCategories(
        {} as Request,
        response as Response,
      );

      // Assert
      expect(service.getAllCategories).toHaveBeenCalledWith(
        expect.objectContaining({}),
      );

      expect(response.status).toHaveBeenCalledWith(200);

      expect(response.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Array),
      });
    });

    it('deve preservar categorias retornadas pelo serviço', async () => {
      // Arrange
      const cachedCategories = [
        { id: '1', name: 'Tecnologia' },
        { id: '2', name: 'Esportes' },
      ];

      service.getAllCategories.mockResolvedValue(cachedCategories);

      // Act
      await controller.getAllCategories(
        {} as Request,
        response as Response,
      );

      // Assert
      expect(service.getAllCategories).toHaveBeenCalledTimes(1);

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

      service.getCategoryById.mockResolvedValue(category);

      const request = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
      } as Request<{ id: string }>;

      // Act
      await controller.getCategoryById(request, response as Response);

      // Assert
      expect(service.getCategoryById).toHaveBeenCalledWith(
        expect.objectContaining({ id: '550e8400-e29b-41d4-a716-446655440000' }),
      );

      expect(response.status).toHaveBeenCalledWith(200);

      expect(response.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
      });
    });

    it('deve retornar erro quando a categoria não for encontrada', async () => {
      // Arrange
      service.getCategoryById.mockResolvedValue(null);

      const request = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440001',
        },
      } as Request<{ id: string }>;

      // Act
      await controller.getCategoryById(request, response as Response);

      // Assert
      expect(service.getCategoryById).toHaveBeenCalledWith(
        expect.objectContaining({ id: '550e8400-e29b-41d4-a716-446655440001' }),
      );

      expect(response.status).toHaveBeenCalledWith(400);

      expect(response.json).toHaveBeenCalledWith({
        message: 'Categoria não encontrada.',
      });
    });
  });
});
