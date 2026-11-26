import axios from 'axios';
import { APP_CONFIG } from '@/utils';

const api = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  headers: { Accept: 'application/json' },
});

export const tagService = {
  /**
   * Lista tags disponíveis com suporte a busca/autocomplete
   * @param {Object} [params] - { q, limit }
   */
  async getTags(params = {}) {
    const { data: res } = await api.get('/tags', { params });
    return { success: true, data: res.data ?? res };
  },

  /**
   * Obtém notícias associadas a uma tag específica por slug
   * @param {string} slug - Slug da tag
   * @param {Object} [params] - { page, limit }
   */
  async getNewsByTagSlug(slug, params = {}) {
    const { data: res } = await api.get(`/tags/${slug}/news`, { params });
    return { success: true, data: res.data ?? res };
  },
};
