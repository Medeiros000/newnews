import { Category } from '../models/entities/Category.js';
import type { Category as PrismaCategory } from '../../generated/prisma/client.js';

export class CategoryMapper {
	static fromPrisma(category: PrismaCategory): Category {
		return new Category(category.id, category.name, category.label, category.icon);
	}
}