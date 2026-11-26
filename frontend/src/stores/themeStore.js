import { create } from 'zustand';

export const useThemeStore = create((set) => {
  const getInitialTheme = () => {
    try {
      const savedTheme = localStorage.getItem('nn_theme');
      if (savedTheme) return savedTheme;
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch {
      return 'light';
    }
  };

  const initialMode = getInitialTheme();
  const isDark = initialMode === 'dark';

  document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');

  return {
    theme: initialMode,
    isDarkMode: isDark,

    setTheme: (mode) => {
      let resolvedDark = mode === 'dark';
      if (mode === 'system') {
        resolvedDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
      }
      document.documentElement.setAttribute('data-bs-theme', resolvedDark ? 'dark' : 'light');
      try {
        localStorage.setItem('nn_theme', mode);
      } catch {}
      set({ theme: mode, isDarkMode: resolvedDark });
    },

    toggleDarkMode: () =>
      set((state) => {
        const nextDark = !state.isDarkMode;
        const nextTheme = nextDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-bs-theme', nextDark ? 'dark' : 'light');
        try {
          localStorage.setItem('nn_theme', nextTheme);
        } catch {}
        return { theme: nextTheme, isDarkMode: nextDark };
      }),
  };
});
