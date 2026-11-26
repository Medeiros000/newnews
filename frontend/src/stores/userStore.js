import { create } from 'zustand';
import { authService, userService } from '@/services';

export const useUserStore = create((set, get) => ({
  user: null,
  isLoadingUser: true,
  notifications: [],

  initAuth: async () => {
    const token = localStorage.getItem('nn_access_token');
    if (!token) {
      set({ user: null, isLoadingUser: false });
      return;
    }

    try {
      set({ isLoadingUser: true });
      const res = await authService.getMe();
      if (res.success && res.data) {
        set({ user: res.data, isLoadingUser: false });
      } else {
        set({ user: null, isLoadingUser: false });
      }
    } catch {
      localStorage.removeItem('nn_access_token');
      localStorage.removeItem('nn_refresh_token');
      set({ user: null, isLoadingUser: false });
    }
  },

  login: (authData) => {
    if (authData.accessToken) {
      localStorage.setItem('nn_access_token', authData.accessToken);
    }
    if (authData.refreshToken) {
      localStorage.setItem('nn_refresh_token', authData.refreshToken);
    }
    set({ user: authData.user || authData, isLoadingUser: false });
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {}
    localStorage.removeItem('nn_access_token');
    localStorage.removeItem('nn_refresh_token');
    set({ user: null, notifications: [] });
  },

  updateUserProfile: async (profileData) => {
    const res = await userService.updateProfile(profileData);
    if (res.success && res.data) {
      set((state) => ({
        user: { ...state.user, ...res.data },
      }));
    }
    return res;
  },

  updateUserPreferences: async (prefData) => {
    const res = await userService.updatePreferences(prefData);
    if (res.success && res.data) {
      set((state) => ({
        user: {
          ...state.user,
          preferences: res.data,
        },
      }));
    }
    return res;
  },

  clearUser: () => set({ user: null }),

  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
