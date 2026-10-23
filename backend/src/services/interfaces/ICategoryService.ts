import type { Category } from '../../models/entities/Category.js';
import type { QueryOptions } from '../../commands/QueryOptions.js';

export interface ICategoryService {
    // Define os métodos que o serviço de categoria deve implementar
    getAllCategories(queryOptions: QueryOptions): Promise<Category[]>;
    getCategoryById(queryOptions: QueryOptions): Promise<Category | null>;
}