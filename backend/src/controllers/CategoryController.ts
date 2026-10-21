import { Request, Response } from 'express';
import { cache, prisma } from '../container.js';
import { CategoryMapper } from '../mappers/CategoryMapper.js';
import type { Category } from '../models/Category.js';

export default class CategoryController {
    public async get(_request: Request, response: Response): Promise<Response> {
        try {
            const cacheKey = 'categories:list';
            const cachedCategories = await cache.get<Category[]>(cacheKey);

            if (cachedCategories) {
                return response.status(200).json(
                    {
                        success: true,
                        // source: 'cache',
                        data: cachedCategories
                    });
            }

            const categories = (await prisma.category.findMany()).map(
                CategoryMapper.fromPrisma,
            );
            await cache.set(cacheKey, categories, 300);

            return response.status(200).json({
                success: true,
                // source: 'database',
                data: categories
            });
        } catch {
            return response.status(400).json({ message: 'Erro ao buscar categorias.' });
        }
    }

    public async getById(
        request: Request<{ id: string }>,
        response: Response,
    ): Promise<Response> {
        try {
            const cacheKey = `categories:${request.params.id}`;
            const cachedCategory = await cache.get<Category>(cacheKey);

            if (cachedCategory) {
                return response.status(200).json(
                    {
                        success: true,
                        // source: 'cache',
                        data: cachedCategory
                    });
            }

            const category = await prisma.category.findUnique({
                where: { id: request.params.id },
            });

            if (!category) {
                return response.status(400).json({ message: 'Categoria não encontrada.' });
            }

            const mappedCategory = CategoryMapper.fromPrisma(category);
            await cache.set(cacheKey, mappedCategory, 300);

            return response.status(200).json({
                success: true,
                // source: 'database',
                data: mappedCategory
            });
        } catch {
            return response.status(400).json({ message: 'Erro ao buscar categoria.' });
        }
    }
}
