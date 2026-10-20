import type { Category } from '../models/Category.js';
import type { Category as PrismaCategory } from '../../generated/prisma/client.js';

class CategoryMapper {
	static fromPrisma(category: PrismaCategory): Category {
		return {
			id: category.id,
			label: category.label,
			icon: category.icon,
		};
	}
}