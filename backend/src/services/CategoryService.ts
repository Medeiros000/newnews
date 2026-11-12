import { PrismaService } from './PrismaService.js';
import { CategoryMapper } from '../mappers/CategoryMapper.js';
import { Category } from '../models/entities/Category.js';
import { QueryOptions } from '../queries/QueryOptions.js';
import { ICategoryService } from './interfaces/ICategoryService.js';
import type { CacheProvider } from './cache/CacheProvider.js';
import { createCacheProvider } from './cache/createCacheProvider.js';

export class CategoryService implements ICategoryService {
  private readonly prisma: PrismaService;
  private readonly cache: CacheProvider;

  public constructor(
    prisma: PrismaService = PrismaService.getInstance(),
    cache: CacheProvider = createCacheProvider(),
  ) {
    this.prisma = prisma;
    this.cache = cache;
  }

  public async getAllCategories(queryOptions: QueryOptions): Promise<Category[]> {
    const cacheKey = `categories:list:${JSON.stringify(queryOptions)}`;
    const cachedCategories = await this.cache.get<Category[]>(cacheKey);

    if (cachedCategories) {
      return cachedCategories;
    }

    const categories = (await this.prisma.category.findMany()).map(CategoryMapper.fromPrisma);
    await this.cache.set(cacheKey, categories, 300);

    return categories;
  }

  public async getCategoryById(queryOptions: QueryOptions): Promise<Category | null> {
    const id = queryOptions.id;

    const cacheKey = `categories:${id}`;
    const cachedCategory = await this.cache.get<Category>(cacheKey);

    if (cachedCategory) {
      return cachedCategory;
    }

    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return null;
    }

    const mappedCategory = CategoryMapper.fromPrisma(category);
    await this.cache.set(cacheKey, mappedCategory, 300);

    return mappedCategory;
  }
}
