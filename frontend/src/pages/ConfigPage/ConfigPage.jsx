import { useEffect, useState } from 'react';
import {
  IconBell,
  IconBookmark,
  IconCheck,
  IconChevronRight,
  IconLock,
  IconMoon,
  IconNews,
  IconSettings,
  IconSun,
  IconUser,
} from '@tabler/icons-react';
import { Navbar } from '@/components/Navbar';
import { NewsCard } from '@/components/NewsCard';
import { ToastContainer } from '@/components/ToastContainer';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useNewsFeed } from '@/hooks';
import '@/components/Sidebar/Sidebar.css';
import {
  useBookmarksStore,
  useThemeStore,
  useToastStore,
  useUserStore,
} from '@/stores';
import './ConfigPage.css';

const preferenceKey = 'nn_preferences';
const defaultPreferences = {
  emailNotifications: true,
  breakingNews: true,
  compactView: false,
  showReadArticles: true,
  preferredCategories: ['Tecnologia', 'Brasil', 'Mundo'],
};

const categories = [
  'Futebol',
  'Tecnologia',
  'Política',
  'Economia',
  'Mundo',
  'Games',
  'Entretenimento',
];

const categoryColors = {
  Futebol: '#198754',
  Tecnologia: '#0d6efd',
  Política: '#dc3545',
  Economia: '#fd7e14',
  Mundo: '#6f42c1',
  Games: '#d63384',
  Entretenimento: '#20c997',
};

/**
 * Loads user preferences from local storage or falls back to defaults.
 * @returns {Object} User preferences object
 */
function readPreferences() {
  try {
    return {
      ...defaultPreferences,
      ...JSON.parse(localStorage.getItem(preferenceKey) || '{}'),
    };
  } catch {
    return defaultPreferences;
  }
}

/**
 * Reusable component for a single configuration setting row.
 * Displays an icon, title, description, and accepts form controls as children.
 */
function SettingRow({ icon, title, description, children }) {
  return (
    <div className="d-flex align-items-center gap-3 py-3 border-bottom">
      <span
        className="d-flex align-items-center justify-content-center rounded-3 bg-body-secondary text-secondary flex-shrink-0"
        style={{ width: 34, height: 34 }}
      >
        {icon}
      </span>
      <div className="flex-grow-1">
        <div className="fw-semibold small">{title}</div>
        <div className="text-secondary small">{description}</div>
      </div>
      {children}
    </div>
  );
}

const CONFIG_NAV_ITEMS = [
  { id: 'profile', label: 'Meu perfil', icon: '👤' },
  { id: 'favorites', label: 'Favoritos', icon: '🔖' },
  { id: 'categories', label: 'Minhas categorias', icon: '⚙️' },
  { id: 'settings', label: 'Configurações', icon: '🛠️' },
  { id: 'privacy', label: 'Privacidade e segurança', icon: '🔒' },
];

function ConfigurationNavItems({
  activeSection,
  onSelect,
  isOffcanvas = false,
}) {
  return CONFIG_NAV_ITEMS.map((item) => (
    <button
      key={item.id}
      type="button"
      {...(isOffcanvas ? { 'data-bs-dismiss': 'offcanvas' } : {})}
      onClick={() => onSelect(item.id)}
      className={`sidebar-item btn btn-link w-100 text-start d-flex align-items-center gap-2 rounded-3 px-3 py-2 mb-1 text-decoration-none fw-medium ${
        activeSection === item.id
          ? 'active bg-primary text-white'
          : 'text-secondary'
      }`}
    >
      <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>
        {item.icon}
      </span>
      <span style={{ fontSize: '0.875rem' }}>{item.label}</span>
    </button>
  ));
}

/**
 * User configuration and preferences management page.
 * Handles user profile display, bookmarked articles, preferred news categories, and display preferences.
 * Preferences are automatically synchronized with localStorage for persistent client state across sessions.
 */
export function ConfigPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useUserStore((state) => state.user);
  const bookmarkedArticleIds = useBookmarksStore(
    (state) => state.bookmarkedArticleIds,
  );
  const readArticleIds = useBookmarksStore((state) => state.readArticleIds);
  const markArticleAsRead = useBookmarksStore(
    (state) => state.markArticleAsRead,
  );
  const toggleArticleBookmark = useBookmarksStore(
    (state) => state.toggleArticleBookmark,
  );
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);
  const showToastNotification = useToastStore(
    (state) => state.showToastNotification,
  );
  const [preferences, setPreferences] = useState(readPreferences);
  const requestedSection = searchParams.get('section');
  const initialSection = CONFIG_NAV_ITEMS.some(
    (item) => item.id === requestedSection,
  )
    ? requestedSection
    : 'categories';
  const [activeSection, setActiveSection] = useState(initialSection);
  const { articlesList, isLoading: isLoadingFavorites } = useNewsFeed({
    navSelectedCategory: null,
    searchQuery: '',
    bookmarkedArticleIds,
  });

  const favoriteArticles = articlesList.filter((article) =>
    bookmarkedArticleIds.has(article.id),
  );

  useEffect(() => {
    localStorage.setItem(preferenceKey, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    if (CONFIG_NAV_ITEMS.some((item) => item.id === requestedSection)) {
      setActiveSection(requestedSection);
    }
  }, [requestedSection]);

  /**
   * Updates a specific user preference setting
   */
  const updatePreference = (key, value) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  /**
   * Toggles selection of preferred news categories
   */
  const toggleCategory = (category) => {
    const selected = preferences.preferredCategories.includes(category);
    updatePreference(
      'preferredCategories',
      selected
        ? preferences.preferredCategories.filter((item) => item !== category)
        : [...preferences.preferredCategories, category],
    );
  };

  /**
   * Clears local preferences and resets to defaults
   */
  const handleResetPreferences = () => {
    localStorage.removeItem(preferenceKey);
    setPreferences({ ...defaultPreferences });
    showToastNotification('Preferências restauradas.', 'info', '↺');
  };

  /**
   * Handles opening an article, tracking it as read, and navigating to its page
   */
  const handleOpenArticle = (article) => {
    markArticleAsRead(article.id);
    navigate(`/news?id=${article.id}`);
  };

  return (
    <div className="vh-100 d-flex flex-column overflow-hidden">
      <Navbar />
      <div
        id="sidebarOffcanvas"
        className="offcanvas offcanvas-start"
        tabIndex={-1}
        aria-labelledby="configSidebarOffcanvasLabel"
        style={{ width: 240 }}
      >
        <div
          className="offcanvas-header border-bottom py-2"
          style={{ backgroundColor: 'var(--nn-navbar-bg)' }}
        >
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-2 bg-primary"
              style={{ width: 28, height: 28 }}
            >
              <IconNews size={16} color="white" />
            </div>
            <span
              id="configSidebarOffcanvasLabel"
              className="fw-bold text-white"
              style={{
                fontSize: '0.95rem',
                letterSpacing: '-0.3px',
              }}
            >
              NEW <span className="text-primary">NEWS</span>
            </span>
          </div>
          <button
            type="button"
            className="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"
            aria-label="Fechar"
          />
        </div>
        <div className="offcanvas-body p-2 d-flex flex-column h-100 overflow-hidden">
          <p
            className="text-uppercase text-secondary fw-semibold px-2 pt-1 pb-1 mb-1"
            style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}
          >
            Menu de configurações
          </p>
          <nav
            className="sidebar-nav-scroll px-2 pb-2"
            aria-label="Seções de configurações"
          >
            <ConfigurationNavItems
              activeSection={activeSection}
              onSelect={setActiveSection}
              isOffcanvas
            />
          </nav>
          <div className="mt-auto px-2">
            <div className="sidebar-divider mx-2 my-2" />
            <button
              type="button"
              className="sidebar-item btn btn-link w-100 text-start d-flex align-items-center gap-2 rounded-3 px-3 py-2 text-decoration-none fw-medium text-secondary"
              onClick={() =>
                showToastNotification('Sessão encerrada.', 'info', '↪')
              }
            >
              <span style={{ width: 20, textAlign: 'center' }}>🚪</span>
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
      <div
        className="d-flex flex-grow-1 min-vh-0 overflow-hidden"
        style={{ backgroundColor: 'var(--bs-body-bg)' }}
      >
        <aside
          id="sidebar-desktop"
          className="sidebar d-none d-md-flex flex-column border-end"
          style={{ width: 220 }}
        >
          <p
            className="text-uppercase text-secondary fw-semibold px-3 pt-3 pb-1 mb-0 flex-shrink-0"
            style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}
          >
            Menu de configurações
          </p>
          <nav
            className="sidebar-nav-scroll px-2 pb-2"
            aria-label="Seções de configurações"
          >
            <ConfigurationNavItems
              activeSection={activeSection}
              onSelect={setActiveSection}
            />
          </nav>
          <div className="sidebar-bottom-section px-2 mt-auto flex-shrink-0">
            <div className="sidebar-divider mx-2 my-2" />
            <button
              type="button"
              className="sidebar-item btn btn-link w-100 text-start d-flex align-items-center gap-2 rounded-3 px-3 py-2 mb-1 text-decoration-none fw-medium text-secondary"
              onClick={() =>
                showToastNotification('Sessão encerrada.', 'info', '↪')
              }
            >
              <span style={{ width: 20, textAlign: 'center' }}>🚪</span>
              <span>Sair</span>
            </button>
            <a
              className="sidebar-item btn btn-link w-100 text-start d-flex align-items-center gap-2 rounded-3 px-3 py-2 mb-1 text-decoration-none fw-medium text-secondary"
              href="/"
            >
              <span style={{ width: 20, textAlign: 'center' }}>🏠</span>
              <span>Voltar ao início</span>
            </a>
          </div>
        </aside>
        <main
          id="config-page"
          className="flex-grow-1 overflow-y-auto p-4 d-flex flex-column"
          style={{ backgroundColor: 'var(--bs-body-bg)' }}
        >
          <section
            id="profile"
            className="rounded-3 p-4 mb-4 border text-body shadow-sm"
            style={{
              order: -1,
              backgroundColor: 'var(--bs-card-bg)',
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white fw-bold fs-4 flex-shrink-0"
                style={{ width: 58, height: 58 }}
              >
                {user?.avatarInitial || 'U'}
              </div>
              <div>
                <h2 className="h5 mb-1">{user?.name || 'Usuário'}</h2>
                <div className="small opacity-75">
                  {user?.email || 'usuario@exemplo.com'}
                </div>
              </div>
            </div>
          </section>

          <div className="row g-4">
            <div
              className="col-12"
              style={{
                display: activeSection === 'profile' ? 'block' : 'none',
              }}
            >
              <section
                id="profile-reading"
                className="overflow-hidden border rounded-3 shadow-sm"
                style={{ backgroundColor: 'var(--bs-card-bg)' }}
              >
                <div
                  className="d-flex align-items-start gap-3 p-3 border-bottom"
                  style={{
                    backgroundColor: 'var(--bs-card-bg)',
                  }}
                >
                  <IconUser size={19} className="text-primary" />
                  <div>
                    <h2 className="h6 mb-1">Perfil e leitura</h2>
                    <p className="text-secondary small mb-0">
                      Escolha como as notícias aparecem para você.
                    </p>
                  </div>
                </div>
                <div className="px-3">
                  <SettingRow
                    icon={<IconBookmark size={18} />}
                    title="Mostrar notícias já lidas"
                    description="Mantenha artigos lidos disponíveis no feed."
                  >
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={preferences.showReadArticles}
                      onChange={(event) =>
                        updatePreference(
                          'showReadArticles',
                          event.target.checked,
                        )
                      }
                      aria-label="Mostrar notícias já lidas"
                    />
                  </SettingRow>
                  <SettingRow
                    icon={<IconSettings size={18} />}
                    title="Visualização compacta"
                    description="Exiba mais manchetes em cada tela."
                  >
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={preferences.compactView}
                      onChange={(event) =>
                        updatePreference('compactView', event.target.checked)
                      }
                      aria-label="Visualização compacta"
                    />
                  </SettingRow>
                </div>
              </section>
            </div>

            <div
              className="col-12"
              style={{
                display: activeSection === 'settings' ? 'block' : 'none',
              }}
            >
              <section
                id="appearance"
                className="overflow-hidden border rounded-3 shadow-sm"
                style={{ backgroundColor: 'var(--bs-card-bg)' }}
              >
                <div
                  className="d-flex align-items-start gap-3 p-3 border-bottom"
                  style={{
                    backgroundColor: 'var(--bs-card-bg)',
                  }}
                >
                  {isDarkMode ? (
                    <IconMoon size={19} className="text-primary" />
                  ) : (
                    <IconSun size={19} className="text-primary" />
                  )}
                  <div>
                    <h2 className="h6 mb-1">Aparência</h2>
                    <p className="text-secondary small mb-0">
                      Ajuste o conforto visual da leitura.
                    </p>
                  </div>
                </div>
                <div className="px-3">
                  <SettingRow
                    icon={
                      isDarkMode ? (
                        <IconMoon size={18} />
                      ) : (
                        <IconSun size={18} />
                      )
                    }
                    title={isDarkMode ? 'Modo escuro' : 'Modo claro'}
                    description="Alterne o tema da interface."
                  >
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                      onClick={toggleDarkMode}
                    >
                      {isDarkMode ? 'Claro' : 'Escuro'}
                      <IconChevronRight size={15} />
                    </button>
                  </SettingRow>
                </div>
              </section>
            </div>

            <div
              className="col-12"
              style={{
                display: activeSection === 'settings' ? 'block' : 'none',
              }}
            >
              <section
                id="notifications"
                className="overflow-hidden border rounded-3 shadow-sm"
                style={{ backgroundColor: 'var(--bs-card-bg)' }}
              >
                <div
                  className="d-flex align-items-start gap-3 p-3 border-bottom"
                  style={{
                    backgroundColor: 'var(--bs-card-bg)',
                  }}
                >
                  <IconBell size={19} className="text-primary" />
                  <div>
                    <h2 className="h6 mb-1">Notificações</h2>
                    <p className="text-secondary small mb-0">
                      Decida quais alertas deseja receber.
                    </p>
                  </div>
                </div>
                <div className="px-3">
                  <SettingRow
                    icon={<IconBell size={18} />}
                    title="Resumo por e-mail"
                    description="Receba uma seleção diária das principais notícias."
                  >
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={(event) =>
                        updatePreference(
                          'emailNotifications',
                          event.target.checked,
                        )
                      }
                      aria-label="Resumo por e-mail"
                    />
                  </SettingRow>
                  <SettingRow
                    icon={<IconBell size={18} />}
                    title="Últimas notícias"
                    description="Seja avisado quando algo importante acontecer."
                  >
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={preferences.breakingNews}
                      onChange={(event) =>
                        updatePreference('breakingNews', event.target.checked)
                      }
                      aria-label="Últimas notícias"
                    />
                  </SettingRow>
                </div>
              </section>
            </div>

            <div
              className="col-12"
              style={{
                display: activeSection === 'categories' ? 'block' : 'none',
              }}
            >
              <section
                id="topics"
                className="overflow-hidden border rounded-3 shadow-sm"
                style={{ backgroundColor: 'var(--bs-card-bg)' }}
              >
                <div
                  className="d-flex align-items-start gap-3 p-3 border-bottom"
                  style={{
                    backgroundColor: 'var(--bs-card-bg)',
                  }}
                >
                  <IconBookmark size={19} className="text-primary" />
                  <div>
                    <h2 className="h6 mb-1">Categorias favoritas</h2>
                    <p className="text-secondary small mb-0">
                      Escolha os assuntos que deseja acompanhar.
                    </p>
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-2 px-3 pt-3 pb-3">
                  {categories.map((category) => {
                    const isSelected =
                      preferences.preferredCategories.includes(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        className="btn btn-sm rounded-pill"
                        style={{
                          color: categoryColors[category],
                          borderColor: categoryColors[category],
                          backgroundColor: isSelected
                            ? `${categoryColors[category]}18`
                            : 'transparent',
                        }}
                        onClick={() => toggleCategory(category)}
                      >
                        {isSelected && <IconCheck size={14} className="me-1" />}
                        {category}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            <div
              className="col-12"
              style={{
                display: activeSection === 'favorites' ? 'block' : 'none',
              }}
            >
              <section
                id="favorites"
                className="overflow-hidden border rounded-3 shadow-sm"
                style={{ backgroundColor: 'var(--bs-card-bg)' }}
              >
                <div
                  className="d-flex align-items-start gap-3 p-3 border-bottom"
                  style={{
                    backgroundColor: 'var(--bs-card-bg)',
                  }}
                >
                  <IconBookmark size={19} className="text-primary" />
                  <div>
                    <h2 className="h6 mb-1">Meus favoritos</h2>
                    <p className="text-secondary small mb-0">
                      Notícias que você salvou para ler depois.
                    </p>
                  </div>
                  <span className="badge text-bg-primary rounded-pill ms-auto">
                    {bookmarkedArticleIds.size}
                  </span>
                </div>
                <div className="p-3">
                  {isLoadingFavorites ? (
                    <div className="text-secondary small py-3">
                      Carregando favoritos...
                    </div>
                  ) : favoriteArticles.length === 0 ? (
                    <div className="config-empty-state text-center py-4">
                      <IconBookmark size={30} className="text-secondary mb-2" />
                      <p className="fw-semibold mb-1">Nenhum favorito ainda</p>
                      <p className="text-secondary small mb-0">
                        Salve uma notícia no feed para encontrá-la aqui.
                      </p>
                    </div>
                  ) : (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
                      {favoriteArticles.map((article) => (
                        <div className="col" key={article.id}>
                          <NewsCard
                            article={article}
                            isRead={readArticleIds.has(article.id)}
                            isBookmarked
                            onSelectArticle={handleOpenArticle}
                            onToggleBookmark={toggleArticleBookmark}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div
              className="col-12"
              style={{
                display: activeSection === 'privacy' ? 'block' : 'none',
              }}
            >
              <section
                id="privacy"
                className="overflow-hidden border rounded-3 shadow-sm"
                style={{ backgroundColor: 'var(--bs-card-bg)' }}
              >
                <div
                  className="d-flex align-items-start gap-3 p-3 border-bottom"
                  style={{
                    backgroundColor: 'var(--bs-card-bg)',
                  }}
                >
                  <IconLock size={19} className="text-primary" />
                  <div>
                    <h2 className="h6 mb-1">Privacidade e segurança</h2>
                    <p className="text-secondary small mb-0">
                      Controle sua conta e seus dados de leitura.
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between gap-3 px-3 pt-3 pb-3">
                  <div className="small text-secondary">
                    Seus dados de preferências ficam salvos neste dispositivo.
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handleResetPreferences}
                  >
                    Gerenciar dados
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
