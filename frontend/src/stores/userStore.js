import { create } from 'zustand';

import { UserService } from '@/services';

/**
 * Global user store (Zustand).
 * Manages authentication state, user profile data, and notifications.
 *
 * State:
 * - user: null means guest visitor; object means authenticated user
 * - isLoadingUser: true while the profile fetch is in progress
 * - notifications: list of unread notification objects
 */
export const useUserStore = create((set) => ({
  // null = guest visitor, object = authenticated user
  user: null,

  // True while user profile is being fetched
  isLoadingUser: false,

  // List of unread notification objects
  notifications: [],

  /**
   * Sets the authenticated user in the store after successful login
   * @param {Object} userData - The user profile object returned from the API
   */
  login: (userData) => {
    set({ user: userData });
  },

  /**
   * Clears the user session, removing profile and notifications
   */
  logout: () => {
    set({ user: null, notifications: [] });
  },

  /**
   * Fetches user profile and notifications in parallel from the API.
   * On failure, resets the user to null.
   */
  loadUserData: async () => {
    set({ isLoadingUser: true });

    try {
      const [profileRes, notifRes] = await Promise.all([
        UserService.getUserProfile(),
        UserService.getUserNotifications(),
      ]);

      set({
        user: profileRes.success ? profileRes.data : null,
        notifications: notifRes.success ? notifRes.data : [],
        isLoadingUser: false,
      });
    } catch (err) {
      console.error('Failed to load user data:', err);

      set({ user: null, isLoadingUser: false });
    }
  },

  /**
   * Resets the user state without a full logout flow
   */
  clearUser: () => set({ user: null }),

  /**
   * Removes a specific notification by ID
   * @param {string|number} id - The ID of the notification to dismiss
   */
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (notification) => notification.id !== id,
      ),
    })),
}));
