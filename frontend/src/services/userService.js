import axios from 'axios';
import { APP_CONFIG } from '@/utils';

/**
 * User Data Service layer.
 * Encapsulates HTTP communication with user and authentication endpoints.
 */
const api = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  headers: { Accept: 'application/json' },
});

export const userService = {
  /**
   * Fetches the authenticated user's profile data.
   * Treats visitor as guest when endpoint is unauthenticated or unavailable.
   * @returns {Promise<{ success: boolean, data: Object|null }>}
   */
  async getUserProfile() {
    const { data: res } = await api.get('/user/profile');
    return { success: true, data: res.data ?? res };
  },

  /**
   * Fetches the authenticated user's notifications list.
   * @returns {Promise<{ success: boolean, data: Array }>}
   */
  async getUserNotifications() {
    const { data: res } = await api.get('/user/notifications');
    return { success: true, data: res.data ?? res };
  },

  /**
   * Sends user login credentials to authentication endpoint.
   * @param {{ email: string, password: string }} credentials
   */
  async login(credentials) {
    const { data: res } = await api.post('/auth/login', credentials);
    return res;
  },

  /**
   * Sends new user registration details to registration endpoint.
   * @param {{ name: string, email: string, password: string }} userData
   */
  async register(userData) {
    const { data: res } = await api.post('/auth/register', userData);
    return res;
  },
};
