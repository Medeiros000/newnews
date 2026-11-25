import type { NextFunction, Request, Response } from 'express';
import { QueryOptions } from '../queries/QueryOptions.js';
import { NewsService } from '../services/NewsService.js';
import { INewsService } from '../services/interfaces/INewsService.js';
import { INewsController } from './interfaces/INewsController.js';
import { getNewsIngestionWorker } from '../workers/NewsIngestionWorker.js';
import { createNewsSchema, updateNewsSchema } from '../schemas/newsValidation.js';

export class NewsController implements INewsController {
	public constructor(private readonly service: INewsService = new NewsService()) { }

	public async getNews(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			const result = await this.service.getNews(this.createQueryOptions(request));
			response.status(200).json({
				success: true,
				data: result,
			});
		} catch (error) {
			next(error);
		}
	}

	public async searchNews(request: Request, response: Response, next: NextFunction): Promise<void> {
		return this.getNews(request, response, next);
	}

	public startNewsIngestion(_request: Request, response: Response): void {
		getNewsIngestionWorker().start();
		response.status(202).json({
			success: true,
			message: 'Ingestão de notícias ativada.',
		});
	}

	public async getNewsById(
		request: Request,
		response: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const result = await this.service.getNewsById(this.createQueryOptions(request));
			if (!result) {
				response.status(404).json({
					success: false,
					error: 'Notícia não encontrada',
				});
				return;
			}

			response.json({ success: true, data: result });
		} catch (error) {
			next(error);
		}
	}

	public async getNewsBySlugAndIdPrefix(
		request: Request,
		response: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const slugParam = Array.isArray(request.params.slug) ? request.params.slug[0] : request.params.slug;
			const idPrefixParam = Array.isArray(request.params.idPrefix) ? request.params.idPrefix[0] : request.params.idPrefix;

			const slug = slugParam?.trim();
			const idPrefix = idPrefixParam?.trim();

			if (!slug || !idPrefix || idPrefix.length !== 8) {
				response.status(400).json({
					success: false,
					error: 'Slug e prefixo de 8 caracteres do ID são obrigatórios e devem ser válidos.',
				});
				return;
			}

			const result = await this.service.getNewsBySlugAndIdPrefix(slug, idPrefix);
			if (!result) {
				response.status(404).json({
					success: false,
					error: 'Notícia não encontrada',
				});
				return;
			}

			response.status(200).json({ success: true, data: result });
		} catch (error) {
			next(error);
		}
	}

	public async getRelatedNews(
		request: Request,
		response: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const limit = this.parseNumber(request.query.limit, 6);
			const targetId = Array.isArray(request.params.id)
				? request.params.id[0]
				: Array.isArray(request.params.slug)
					? request.params.slug[0]
					: request.params.id || request.params.slug;

			const options = new QueryOptions({ id: targetId, limit });
			const result = await this.service.getRelatedNews(options);

			if (!result) {
				response.status(404).json({
					success: false,
					error: 'Notícia não encontrada',
				});
				return;
			}

			response.status(200).json({
				success: true,
				data: { news: result },
			});
		} catch (error) {
			next(error);
		}
	}

	public async createNews(
		request: Request,
		response: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const validated = createNewsSchema.parse(request.body);
			const created = await this.service.createNews(validated);
			response.status(201).json({
				success: true,
				data: created,
			});
		} catch (error) {
			next(error);
		}
	}

	public async updateNews(
		request: Request,
		response: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
			const validated = updateNewsSchema.parse(request.body);
			const updated = await this.service.updateNews(id, validated);
			if (!updated) {
				response.status(404).json({
					success: false,
					error: 'Notícia não encontrada',
				});
				return;
			}
			response.status(200).json({
				success: true,
				data: updated,
			});
		} catch (error) {
			next(error);
		}
	}

	public async deleteNews(
		request: Request,
		response: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
			const deleted = await this.service.deleteNews(id);
			if (!deleted) {
				response.status(404).json({
					success: false,
					error: 'Notícia não encontrada',
				});
				return;
			}
			response.status(200).json({
				success: true,
				message: 'Notícia excluída com sucesso',
			});
		} catch (error) {
			next(error);
		}
	}

	private createQueryOptions(request: Request): QueryOptions {
		const query =
			typeof request.query.query === 'string'
				? request.query.query
				: typeof request.query.q === 'string'
					? request.query.q
					: undefined;
		const category =
			typeof request.query.category === 'string' ? request.query.category : undefined;
		const tag = typeof request.query.tag === 'string' ? request.query.tag : undefined;
		const page = this.parseNumber(request.query.page, 1);
		const limit = this.parseNumber(request.query.limit, 10);

		return new QueryOptions({
			id: Array.isArray(request.params.id) ? request.params.id[0] : request.params.id,
			page,
			limit,
			query,
			category,
			tag,
		});
	}

	private parseNumber(value: unknown, fallback: number): number {
		const parsed = Number(Array.isArray(value) ? value[0] : value);
		return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
	}
}
