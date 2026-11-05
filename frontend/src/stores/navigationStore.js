import { create } from 'zustand';
import { newsService } from '@/services';

const parseIcon = (icon) => {
  if (icon?.startsWith('U+')) {
    try {
      return String.fromCodePoint(parseInt(icon.slice(2), 16));
    } catch {
      return '📰';
    }
  }
  return icon || '📰';
};

/**
 * Global navigation store (Zustand).
 * Tracks the active nav item, raw search input, debounced search query,
 * and the dynamic navigation items loaded from the API.
 */
export const useNavigationStore = create((set, get) => ({
  // Currently selected nav item ID
  activeNavId: 'inicio',

  // Raw search query, updated on every keystroke
  searchQuery: '',

  // Debounced search query, updated 500ms after the user stops typing
  debouncedSearchQuery: '',

  // Navigation items loaded from the API
  navigationItems: [],

  // Map of category id → display label, built from the same API call
  categoryMap: new Map(),

  /**
   * Sets the active navigation item
   * @param {string} id - The ID of the nav item to activate
   */
  setActiveNavId: (id) => set({ activeNavId: id }),

  /**
   * Updates the raw search query and schedules a debounced update.
   * Uses a 500ms delay before updating debouncedSearchQuery to avoid
   * triggering API calls on every keystroke.
   * @param {string} query - The new search string
   */
  setSearchQuery: (query) => {
    set({ searchQuery: query });

    // Debounce: clear previous timer and set a new one
    const state = get();
    if (state.debounceTimer) clearTimeout(state.debounceTimer);
    const timer = setTimeout(() => {
      set({ debouncedSearchQuery: query });
    }, 500);
    set({ debounceTimer: timer });
  },

  /**
   * Clears both raw and debounced search queries
   */
  clearSearch: () => set({ searchQuery: '', debouncedSearchQuery: '' }),

  /**
   * Fetches navigation items from the API and updates the store
   */
  loadNavigation: async () => {
    try {
      const res = await newsService.getCategories();
      const categories = res.data ?? (Array.isArray(res) ? res : []);
      const navItems = [
        { id: 'inicio', label: 'Início', icon: '🏠', category: null },
        ...categories.map((c) => ({
          id: c.name,
          label: c.label || c.name,
          icon: parseIcon(c.icon),
          category: c.name,
        })),
      ];
      const categoryMap = new Map(categories.map((c) => [c.id, c.label || c.name]));
      set({ navigationItems: navItems, categoryMap });
    } catch (err) {
      console.error('Failed to load navigation items:', err);
    }
  },
}));

/**
 * Selector: derives the currently selected news category from the active nav item.
 * Returns 'salvos' for the bookmarks tab, or the category linked to the active nav item.
 * @param {Object} state - The navigation store state
 * @returns {string|null} The active category string, or null if none is matched
 */
export const selectNavCategory = (state) => {
  if (state.activeNavId === 'salvos') return 'salvos';
  const activeNavItem = state.navigationItems.find(
    (item) => item.id === state.activeNavId,
  );
  return activeNavItem?.category ?? null;
};
