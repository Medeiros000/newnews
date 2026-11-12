import { Request, Response } from 'express';
import { PrismaService } from '../lib/prisma.js';
import { RedisService } from '../lib/redis.js';
import { CategoryMapper } from '../mappers/CategoryMapper.js';
import type { Category } from '../models/entities/Category.js';

export default class CategoryController {
	constructor(
		private readonly prisma: PrismaService,
		private readonly cache?: RedisService,
	) {}
	public async get(_request: Request, response: Response): Promise<Response> {
		try {
			const cacheKey = 'categories:list';
			const cachedCategories = await this.cache?.get<Category[]>(cacheKey);

			if (cachedCategories) {
				return response.status(200).json({
					success: true,
					// source: 'cache',
					data: cachedCategories,
				});
			}

			const categories = (await this.prisma.category.findMany()).map(CategoryMapper.fromPrisma);
			await this.cache?.set(cacheKey, categories, 300);

			return response.status(200).json({
				success: true,
				// source: 'database',
				data: categories,
			});
		} catch {
			return response.status(400).json({ message: 'Erro ao buscar categorias.' });
		}
	}

	public async getById(request: Request<{ id: string }>, response: Response): Promise<Response> {
		try {
			const cacheKey = `categories:${request.params.id}`;
			const cachedCategory = await this.cache?.get<Category>(cacheKey);

			if (cachedCategory) {
				return response.status(200).json({
					success: true,
					// source: 'cache',
					data: cachedCategory,
				});
			}

			const category = await this.prisma.category.findUnique({
				where: { id: request.params.id },
			});

			if (!category) {
				return response.status(400).json({ message: 'Categoria não encontrada.' });
			}

			const mappedCategory = CategoryMapper.fromPrisma(category);
			await this.cache?.set(cacheKey, mappedCategory, 300);

			return response.status(200).json({
				success: true,
				// source: 'database',
				data: mappedCategory,
			});
		} catch {
			return response.status(400).json({ message: 'Erro ao buscar categoria.' });
		}
	}
}
