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
