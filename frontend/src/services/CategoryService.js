import { APP_CONFIG } from '@/utils';

export const CategoryService = {
    /**
     * User Data Service layer.
     * Encapsulates HTTP communication with user-related endpoints.
     * Toggles between mock data and real API based on IS_MOCK_MODE config.
    */
    async request(path) {
        const response = await fetch(`${APP_CONFIG.API_BASE_URL}${path}`, {
            headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`Category request failed: ${response.status}`);
        }

        return response.json();
    },
    /**
     * Fetches the authenticated user's profile data.
     * @returns {{ success: boolean, data: Object }}
     */
    async getAllCategories() {
        const res = await CategoryService.request('/categories');
        // console.log('CategoryService.getAllCategories response:', res);
        return res;
    },
    /**
     * Fetches a category by its ID.
     * @param {string} id - The ID of the category to fetch.
     * @returns {{ success: boolean, data: Object }}
     */
    async getCategoryById(id) {
        const res = await CategoryService.request(`/categories/${id}`);
        return { success: true, data: res.data ?? res };
    }
}
