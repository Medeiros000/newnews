import axios from 'axios';
import { APP_CONFIG } from '@/utils';

export const api = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  headers: { Accept: 'application/json' },
});

// Interceptor para injetar Authorization token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nn_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta para auto-refresh caso receba 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('nn_refresh_token');
      if (refreshToken) {
        try {
          const { data: res } = await axios.post(
            `${APP_CONFIG.API_BASE_URL}/auth/refresh`,
            { refreshToken },
          );
          if (res.success && res.data?.accessToken) {
            localStorage.setItem('nn_access_token', res.data.accessToken);
            if (res.data.refreshToken) {
              localStorage.setItem('nn_refresh_token', res.data.refreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
            return api(originalRequest);
          }
        } catch {
          localStorage.removeItem('nn_access_token');
          localStorage.removeItem('nn_refresh_token');
          window.dispatchEvent(new Event('auth:logout'));
        }
      }
    }
    return Promise.reject(error);
  },
);

export const authService = {
  async register(data) {
    const { data: res } = await api.post('/auth/register', data);
    return res;
  },

  async login(data) {
    const { data: res } = await api.post('/auth/login', data);
    return res;
  },

  async getMe() {
    const { data: res } = await api.get('/auth/me');
    return res;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('nn_access_token');
      localStorage.removeItem('nn_refresh_token');
    }
  },
};

export const userService = {
  ...authService,

  async updateProfile(data) {
    const { data: res } = await api.patch('/users/me', data);
    return res;
  },

  async updatePassword(data) {
    const { data: res } = await api.patch('/users/me/password', data);
    return res;
  },

  async updatePreferences(data) {
    const { data: res } = await api.put('/users/me/preferences', data);
    return res;
  },

  async getBookmarks() {
    const { data: res } = await api.get('/users/me/bookmarks');
    return res;
  },

  async toggleBookmark(newsId) {
    const { data: res } = await api.post(`/news/${newsId}/bookmark`);
    return res;
  },

  async getHistory() {
    const { data: res } = await api.get('/users/me/history');
    return res;
  },
};

export const adminService = {
  async getStats() {
    const { data: res } = await api.get('/admin/stats');
    return res;
  },

  async getUsers(params = {}) {
    const { data: res } = await api.get('/admin/users', { params });
    return res;
  },

  async updateUser(id, data) {
    const { data: res } = await api.patch(`/admin/users/${id}`, data);
    return res;
  },

  async deleteUser(id) {
    const { data: res } = await api.delete(`/admin/users/${id}`);
    return res;
  },

  async createNews(data) {
    const { data: res } = await api.post('/news', data);
    return res;
  },

  async updateNews(id, data) {
    const { data: res } = await api.put(`/news/${id}`, data);
    return res;
  },

  async deleteNews(id) {
    const { data: res } = await api.delete(`/news/${id}`);
    return res;
  },
};
