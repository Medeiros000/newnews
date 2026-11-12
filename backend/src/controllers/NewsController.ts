import { NextFunction, Request, Response } from 'express';
import { PrismaService } from '../lib/prisma.js';
import { RedisService } from '../lib/redis.js';
import { NewsMapper } from '../mappers/NewsMapper.js';
import { newsQuerySchema, relatedNewsSchema } from '../schemas/newsValidation.js';

export class NewsController {
	constructor(
		private readonly prisma: PrismaService,
		private readonly cache: RedisService,
	) {}

	public searchNews = async (
		request: Request,
		response: Response,
		next: NextFunction,
	): Promise<void> => {
		const result = newsQuerySchema.safeParse(request.query);

		if (!result.success) {
			response.status(400).json({
				error: 'Invalid query parameters',
				issues: result.error.issues,
			});
			return;
		}

		const { query, category, page, limit } = result.data;
		const where = query
			? {
					OR: [
						{ title: { contains: query } },
						{ summary: { contains: query } },
						{ content: { contains: query } },
					],
				}
			: undefined;

		if (category) {
			console.log(`Category filter ${category}.`); // Placeholder for future implementation
			// if (!where) {
			//   where = {};
			// }
			// where.category_id = category;
		}

		const cacheKey = `news:list:${encodeURIComponent(
			query?.toLowerCase() || 'all',
		)}category:${category || 'all'}:page:${page}:limit:${limit}`;

		try {
			const cachedData = await this.cache.get<any>(cacheKey);
			if (cachedData) {
				response.status(200).json({
					source: 'cache',
					...cachedData,
				});
				return;
			}
			console.log(`Cache miss for key: ${cacheKey}. Fetching from database.`);
			const [newsRaw, totalItems] = await Promise.all([
				this.prisma.news.findMany({
					skip: (page - 1) * limit,
					take: limit,
					where: {
						...where,
						...(category && {
							category: {
								is: {
									name: category,
								},
							},
						}),
					},
					orderBy: { published_at: 'desc' },
				}),
				this.prisma.news.count({ where }),
			]);
			console.log(
				`Fetched ${newsRaw.length} news items from database. Total items: ${totalItems}.`,
			);
			const newsDomain = NewsMapper.toDomainList(newsRaw);

			const responsePayload = {
				type: query ? 'search' : 'all',
				query: query || null,
				pagination: {
					page,
					limit,
					totalItems,
					totalPages: Math.ceil(totalItems / limit),
				},
				data: newsDomain,
			};

			await this.cache.set(cacheKey, responsePayload, 180);

			response.status(200).json({
				source: 'database',
				...responsePayload,
			});
		} catch (error) {
			next(error);
		}
	};

	public getNewsById = async (
		request: Request,
		response: Response,
		next: NextFunction,
	): Promise<void> => {
		const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
		if (!id) {
			response.status(400).json({ success: false, error: 'ID inválido' });
			return;
		}

		const cacheKey = `news:${id}`;

		try {
			const cachedNews = await this.cache.get(cacheKey);
			if (cachedNews) {
				response.setHeader('X-Cache', 'HIT');
				response.json({ success: true, data: cachedNews });
				return;
			}

			const newsRaw = await this.prisma.news.findUnique({ where: { id } });

			if (!newsRaw) {
				response.status(404).json({ success: false, error: 'Notícia não encontrada' });
				return;
			}

			const newsDomain = NewsMapper.toDomain(newsRaw);

			await this.cache.set(cacheKey, newsDomain, 300);

			response.setHeader('X-Cache', 'MISS');
			response.json({ success: true, data: newsDomain });
		} catch (error) {
			next(error);
		}
	};

	public getRelatedNews = async (
		request: Request,
		response: Response,
		next: NextFunction,
	): Promise<void> => {
		const result = relatedNewsSchema.safeParse({
			params: request.params,
			query: request.query,
		});

		if (!result.success) {
			response.status(400).json({
				error: 'Invalid parameters',
				issues: result.error.issues,
			});
			return;
		}

		const { id } = result.data.params;
		const { limit } = result.data.query;

		const cacheKey = `news:${id}:related:limit:${limit}`;

		try {
			const cachedData = await this.cache.get<any>(cacheKey);
			if (cachedData) {
				response.setHeader('X-Cache', 'HIT');
				response.status(200).json({
					success: true,
					data: { news: cachedData },
				});
				return;
			}

			const currentNews = await this.prisma.news.findUnique({
				where: { id },
				select: { id: true, category_id: true },
			});

			if (!currentNews) {
				response.status(404).json({ success: false, error: 'Notícia não encontrada' });
				return;
			}

			const relatedRaw = await this.prisma.news.findMany({
				where: {
					category_id: currentNews.category_id,
					id: { not: currentNews.id },
				},
				take: limit,
				orderBy: { published_at: 'desc' },
			});

			const relatedDomain = NewsMapper.toDomainList(relatedRaw);

			await this.cache.set(cacheKey, relatedDomain, 300);

			response.setHeader('X-Cache', 'MISS');
			response.status(200).json({
				success: true,
				data: { news: relatedDomain },
			});
		} catch (error) {
			next(error);
		}
	};
}
