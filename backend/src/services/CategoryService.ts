import { PrismaService } from './PrismaService.js';
import { RedisService } from './RedisService.js';
import { CategoryMapper } from '../mappers/CategoryMapper.js';
import { Category } from '../models/entities/Category.js';
import { QueryOptions } from '../queries/QueryOptions.js';
import { ICategoryService } from './interfaces/ICategoryService.js';

export class CategoryService implements ICategoryService {
    private readonly prisma: PrismaService;
    private readonly redis: RedisService;

    public constructor(
        prisma: PrismaService = PrismaService.getInstance(),
        redis: RedisService = RedisService.getInstance(),
    ) {
        this.prisma = prisma;
        this.redis = redis;
    }

    public async getAllCategories(queryOptions: QueryOptions): Promise<Category[]> {
        const cacheKey = `categories:list:${JSON.stringify(queryOptions)}`;
        const cachedCategories = await this.redis.get<Category[]>(cacheKey);

        if (cachedCategories) {
            return cachedCategories;
        }

        const categories = (await this.prisma.category.findMany()).map(
            CategoryMapper.fromPrisma,
        );
        await this.redis.set(cacheKey, categories, 300);

        return categories;
    }

    public async getCategoryById(queryOptions: QueryOptions): Promise<Category | null> {
        const id = Number(queryOptions.id);
        if (!Number.isInteger(id) || id <= 0) {
            return null;
        }

        const cacheKey = `categories:${id}`;
        const cachedCategory = await this.redis.get<Category>(cacheKey);

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
        await this.redis.set(cacheKey, mappedCategory, 300);

        return mappedCategory;
    }
}