import type { Category } from '../../models/entities/Category.js';
import type { QueryOptions } from '../../queries/QueryOptions.js';

export interface ICategoryService {
  getAllCategories(queryOptions: QueryOptions): Promise<Category[]>;
  getCategoryById(queryOptions: QueryOptions): Promise<Category | null>;
}
