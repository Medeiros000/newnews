import { PrismaService } from '../../services/PrismaService.js';
import { Category } from '../../models/entities/Category.js';
import { NormalizedNews } from './NewsNormalizer.js';
import { CategoryMapper } from '../../mappers/CategoryMapper.js';

export class NewsRepository {
	private readonly prisma: PrismaService;
	private categories: ReadonlyArray<Category> = Object.freeze([]);
	private categoriesInitialization?: Promise<void>;

	constructor(prisma: PrismaService = PrismaService.getInstance()) {
		this.prisma = prisma;
	}

	async initialize(): Promise<void> {
		if (!this.categoriesInitialization) {
			this.categoriesInitialization = this.loadCategories();
		}

		await this.categoriesInitialization;
	}

	private async loadCategories(): Promise<void> {
		const categories = (await this.prisma.category.findMany()).map(CategoryMapper.fromPrisma);
		this.categories = Object.freeze(categories);
	}

	private getCategoryId(categoryName: string) {
		const category = this.categories.find((cat) => cat.getName() === categoryName);
		if (!category) {
			throw new Error(`Categoria não encontrada: ${categoryName}`);
		}
		return category.getId();
	}

	async saveMany(newsItems: NormalizedNews[]) {
		await this.initialize();

		const itemsWithUrls = newsItems.map((item) => {
			if (!item.url) {
				throw new Error(`Notícia sem URL não pode ser persistida: ${item.title ?? 'sem título'}`);
			}
			return { ...item, url: item.url };
		});
		const existingNews = await this.prisma.news.findMany({
			where: { url: { in: itemsWithUrls.map((item) => item.url) } },
			select: { url: true },
		});
		const existingUrls = new Set(existingNews.map((item) => item.url));
		const batchUrls = new Set<string>();
		const data = itemsWithUrls
			.filter((item) => {
				if (existingUrls.has(item.url) || batchUrls.has(item.url)) {
					return false;
				}
				batchUrls.add(item.url);
				return true;
			})
			.map((item) => ({
				...(item.id ? { id: item.id } : {}),
				category_id: this.getCategoryId(item.category),
				title: item.title || item.description || '',
				description: item.description || '',
				url: item.url,
				author: item.author,
				image_url: item.image_url || 'https://via.placeholder.com/800x400',
				language: item.language || 'pt-BR',
				source: item.source,
				published_at: item.published_at,
			}));
		const result = data.length === 0 ? { count: 0 } : await this.prisma.news.createMany({ data });
		console.log(`✅ ${result.count} notícias salvas no banco de dados.`);
		return result;
	}
}
