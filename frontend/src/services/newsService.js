import { APP_CONFIG } from '@/utils';

/**
 * News Data Service layer.
 * Encapsulates HTTP communication with news endpoints.
 */
export class NewsService {
  /**
   * Internal helper to make HTTP requests with fetch.
   */
  async request(path, options = {}) {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}${path}`, {
      headers: { Accept: 'application/json', ...options.headers },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`News request failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Fetches a paginated list of news articles, optionally filtered by category or search query.
   * @param {Object} [params] Query parameters (category, query, page, limit)
   */
  async getNews(params = {}) {
    const queryParams = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
    ).toString();

    const endpoint = queryParams ? `/news?${queryParams}` : '/news';
    const res = await this.request(endpoint);

    return {
      data: res.data,
      success: res.success,
      meta: res.meta ?? { total: res.data?.length ?? 0, hasMore: false },
    };
  }

  /**
   * Fetches a single news article by its ID.
   * @param {string|number} id - The article ID
   */
  async getNewsById(id) {
    const res = await this.request(`/news/${id}`);
    return { success: true, data: res.data ?? res };
  }

  /**
   * Fetches a single news article by its slug.
   * @param {string} slug - The article slug
   */
  async getNewsBySlug(slug) {
    const res = await this.request(`/news/pt-br/${slug}`);
    return { success: true, data: res.data ?? res };
  }

  /**
   * Fetches available news categories and the dynamic navigation items.
   */
  async getCategories() {
    const res = await this.request('/categories');
    return { success: true, data: res.data ?? res };
  }

  /**
   * Fetches the current trending/featured article for the hero spotlight.
   */
  async getTrending() {
    const res = await this.request('/news/trending');
    return { success: true, data: res.data ?? res };
  }

  /**
   * Fetches contextually related articles for a given article ID.
   * Uses the `/news/:id/related` endpoint, with a fallback that queries
   * articles from the same category if the dedicated endpoint is unavailable.
   * 
   * @param {string|number} id - The source article ID
   * @param {Object} [params] - Additional query parameters (e.g. limit)
   */
  async getRelatedNews(id, params = {}) {
    const limit = params.limit || 3;
    try {
      const queryParams = new URLSearchParams({ limit, ...params }).toString();
      const res = await this.request(`/news/${id}/related?${queryParams}`);
      return { success: true, data: res.data?.news ?? res.data ?? res };
    } catch {
      // Fallback: fetch articles from the same category if /related endpoint is not available
      const articleRes = await this.request(`/news/${id}`);
      const article = articleRes.data ?? articleRes;

      const queryParams = new URLSearchParams({
        category: article?.category,
        limit: limit + 5,
      }).toString();

      const newsRes = await this.request(`/news?${queryParams}`);
      const list = newsRes.data ?? newsRes;

      const filtered = (Array.isArray(list) ? list : [])
        .filter((item) => Number(item.id) !== Number(id))
        .slice(0, limit);

      return { success: true, data: filtered };
    }
  }
}

export const newsService = new NewsService();
