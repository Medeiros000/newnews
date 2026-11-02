import { APP_CONFIG } from '@/utils';
import { mockAdapter } from '@/mocks';

/**
 * User Data Service layer.
 * Encapsulates HTTP communication with user-related endpoints.
 * Toggles between mock data and real API based on IS_MOCK_MODE config.
 */
export class UserService {
  /**
   * Internal helper to make HTTP requests with fetch.
   */
  async request(path, options = {}) {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}${path}`, {
      headers: { Accept: 'application/json', ...options.headers },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`User request failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Fetches the authenticated user's profile data.
   * @returns {{ success: boolean, data: Object }}
   */
  async getUserProfile() {
    if (APP_CONFIG.IS_MOCK_MODE) {
      return mockAdapter.getUserProfile();
    }

    const res = await this.request('/user/profile');
    return { success: true, data: res.data ?? res };
  }

  /**
   * Fetches the authenticated user's notifications list.
   * @returns {{ success: boolean, data: Array }}
   */
  async getUserNotifications() {
    if (APP_CONFIG.IS_MOCK_MODE) {
      return mockAdapter.getUserNotifications();
    }

    const res = await this.request('/user/notifications');
    return { success: true, data: res.data ?? res };
  }
}

// Exporta uma instância pronta (Singleton) para manter a compatibilidade
export const userService = new UserService();