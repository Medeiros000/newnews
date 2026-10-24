import type { Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService.js';
import { QueryOptions } from '../queries/QueryOptions.js';
import { ICategoryService } from '../services/interfaces/ICategoryService.js';
import { ICategoryController } from './interfaces/ICategoryController.js';

export class CategoryController implements ICategoryController {
	public constructor(
		private readonly service: ICategoryService = new CategoryService()) {
	}

	public async getAllCategories(_request: Request, response: Response): Promise<Response> {
		const queryOptions = new QueryOptions(_request.query);
		console.log('Query Options:', queryOptions);

		try {
			const categories = await this.service.getAllCategories(queryOptions);
			return response.status(200).json({
				success: true,
				data: categories,
			});
		} catch {
			return response.status(400).json({ message: 'Erro ao buscar categorias.' });
		}
	}

	public async getCategoryById(
		request: Request,
		response: Response,
	): Promise<Response> {
		const queryOptions = new QueryOptions({ ...request.params, ...request.query });
		console.log('Query Options:', queryOptions);
		try {
			const category = await this.service.getCategoryById(queryOptions);

			if (!category) {
				return response.status(400).json({ message: 'Categoria não encontrada.' });
			}

			return response.status(200).json({
				success: true,
				data: category,
			});
		} catch {
			return response.status(400).json({ message: 'Erro ao buscar categoria.' });
		}
	}
}
