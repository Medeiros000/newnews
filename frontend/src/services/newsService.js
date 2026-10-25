import axios from 'axios';
import { APP_CONFIG } from '@/utils';
import { mockAdapter } from '@/mocks';

/**
 * News Data Service layer.
 * Encapsulates HTTP communication with news endpoints.
 * Automatically toggles between the local mock adapter and real REST API endpoints
 * based on the IS_MOCK_MODE application configuration flag.
 */
const api = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  headers: { Accept: 'application/json' },
});

export const newsService = {
  /**
   * Fetches a paginated list of news articles, optionally filtered by category or search query.
   * @param {Object} [params] - Query parameters (category, query, page, limit)
   */
  async getNews(params = {}) {
    const res = await api.get('/news', { params });
    console.log('Fetched news articles:', res.data);
    return {
      data: res.data.data,
      success: res.data.success,
      meta: res.meta ?? { total: res.length ?? 0, hasMore: false },
    };
  },

  /**
   * Fetches a single news article by its ID.
   * @param {string|number} id - The article ID
   */
  async getNewsById(id) {
    if (APP_CONFIG.IS_MOCK_MODE) return mockAdapter.getNewsById(id);
    const { data: res } = await api.get(`/news/${id}`);
    return { success: true, data: res.data ?? res };
  },

  /**
   * Fetches a single news article by its ID.
   * @param {string} slug - The article slug
   */
  async getNewsBySlug(slug) {
    const { data: res } = await api.get(`/news/pt-br/${slug}`);
    return { success: true, data: res.data ?? res };
  },

  /**
   * Fetches available news categories and the dynamic navigation items.
   */
  async getCategories() {
    const { data: res } = await api.get('/categories');
    return { success: true, data: res.data ?? res };
  },

  /**
   * Fetches the current trending/featured article for the hero spotlight.
   */
  async getTrending() {
    if (APP_CONFIG.IS_MOCK_MODE) return mockAdapter.getTrending();
    const { data: res } = await api.get('/news/trending');
    return { success: true, data: res.data ?? res };
  },

  /**
   * Fetches contextually related articles for a given article ID.
   * Uses the `/news/:id/related` endpoint, with a fallback that queries
   * articles from the same category if the dedicated endpoint is unavailable.
   *
   * @param {string|number} id - The source article ID
   * @param {Object} [params] - Additional query parameters (e.g. limit)
   */
  async getRelatedNews(id, params = {}) {
    if (APP_CONFIG.IS_MOCK_MODE) return mockAdapter.getRelatedNews(id, params);

    const limit = params.limit || 3;
    try {
      const { data: res } = await api.get(`/news/${id}/related`, {
        params: { limit, ...params },
      });
      return { success: true, data: res.data ?? res };
    } catch {
      // Fallback: fetch articles from the same category if /related endpoint is not available
      const { data: articleRes } = await api.get(`/news/${id}`);
      const article = articleRes.data ?? articleRes;
      const { data: newsRes } = await api.get('/news', {
        params: { category: article?.category, limit: limit + 5 },
      });
      const list = newsRes.data ?? newsRes;
      const filtered = (Array.isArray(list) ? list : [])
        .filter((item) => Number(item.id) !== Number(id))
        .slice(0, limit);
      return { success: true, data: filtered };
    }
  },
};
