import axios from 'axios';
import { APP_CONFIG } from '@/utils';

/**
 * News Data Service layer.
 * Communicates directly with backend news REST endpoints.
 */
const api = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  headers: { Accept: 'application/json' },
});

export const newsService = {
  /**
   * Fetches a paginated list of news articles.
   * @param {Object} [params] - Query parameters (category, query, page, limit)
   */
  async getNews(params = {}) {
    const queryParams = { ...params };
    if (queryParams.category === 'Todos') {
      delete queryParams.category;
    }

    const { data: res } = await api.get('/news', { params: queryParams });
    return {
      success: true,
      data: res.data ?? res,
      pagination: res.pagination,
    };
  },

  /**
   * Fetches a single news article by its ID.
   * @param {string} id - The article ID
   */
  async getNewsById(id) {
    const { data: res } = await api.get(`/news/${id}`);
    return { success: true, data: res.data ?? res };
  },

  /**
   * Fetches available news categories from the API.
   */
  async getCategories() {
    const { data: res } = await api.get('/categories');
    return { success: true, data: res.data ?? res };
  },

  /**
   * Fetches contextually related articles for a given article ID.
   * Falls back to same-category articles if the /related endpoint is unavailable.
   * @param {string} id - The source article ID
   * @param {Object} [params] - Additional query parameters (e.g. limit)
   */
  async getRelatedNews(id, params = {}) {
    try {
      const { data: res } = await api.get(`/news/${id}/related`, { params });
      return { success: true, data: res.data ?? res };
    } catch {
      // Fallback: fetch articles from the same category
      const { data: articleRes } = await api.get(`/news/${id}`);
      const article = articleRes.data ?? articleRes;
      const categoryParam = article?.categoryId || article?.category;
      const { data: newsRes } = await api.get('/news', {
        params: { category: categoryParam, limit: (params.limit ?? 3) + 5 },
      });
      const list = newsRes.data ?? (Array.isArray(newsRes) ? newsRes : []);
      const filtered = list
        .filter((item) => String(item.id) !== String(id))
        .slice(0, params.limit ?? 3);
      return { success: true, data: filtered };
    }
  },
};
