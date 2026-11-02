import { APP_CONFIG } from '@/utils';

export class CategoryService {
  /**
   * Category Data Service layer.
   * Encapsulates HTTP communication with category-related endpoints.
   */
  async request(path) {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}${path}`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Category request failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Fetches all categories.
   * @returns {{ success: boolean, data: Object }}
   */
  async getAllCategories() {
    return this.request('/categories');
  }

  /**
   * Fetches a category by its ID.
   * @param {string|number} id - The ID of the category to fetch.
   * @returns {{ success: boolean, data: Object }}
   */
  async getCategoryById(id) {
    const res = await this.request(`/categories/${id}`);
    return { success: true, data: res.data ?? res };
  }
}

export const categoryService = new CategoryService();
