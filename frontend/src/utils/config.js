/**
 * Application-wide configuration constants.
 * Values are read from Vite environment variables and fall back to safe defaults.
 */
export const APP_CONFIG = {
  // Base URL for all API requests
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',

  // Delay (ms) before the search query is considered "settled" for API calls
  DEBOUNCE_SEARCH_MS: 250,

  // How long (ms) a toast notification remains visible before auto-dismissing
  TOAST_AUTO_DISMISS_MS: 4000,

  // Default number of articles fetched per page
  DEFAULT_PAGE_LIMIT: 12,
};

/**
 * Preset toast notification messages for common app events.
 * Each entry contains a user-facing message, a visual type, and an icon.
 */
export const TOAST_MESSAGES = {
  DARK_MODE_ON: { message: 'Modo escuro ativado', type: 'info', icon: '🌙' },
  DARK_MODE_OFF: { message: 'Modo claro ativado', type: 'info', icon: '☀️' },
  BOOKMARK_ADDED: {
    message: 'Notícia salva nos seus favoritos!',
    type: 'success',
    icon: '🔖',
  },
  BOOKMARK_REMOVED: {
    message: 'Notícia removida dos salvos',
    type: 'info',
    icon: '🗑️',
  },
  LINK_COPIED: {
    message: 'Link da notícia copiado!',
    type: 'success',
    icon: '🔗',
  },
  SESSION_ENDED: {
    message: 'Sessão encerrada com sucesso',
    type: 'info',
    icon: '👋',
  },
};
