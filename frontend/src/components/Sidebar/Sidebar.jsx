import { useNavigationStore, useBookmarksStore, useUserStore } from '@/stores';
import { SidebarDesktopView } from './SidebarDesktopView';
import { SidebarOffcanvasView } from './SidebarOffcanvasView';
import './Sidebar.css';

export { SidebarNavItems } from './SidebarNavItems';
export { SidebarDesktopView } from './SidebarDesktopView';
export { SidebarOffcanvasView } from './SidebarOffcanvasView';

/**
 * Builds the navigation items list, ensuring 'inicio' is present as the first item
 * followed by categories returned by the API.
 */
function buildNavigationItems(rawItems = []) {
  const hasInicio = rawItems.some((item) => String(item.id).toLowerCase() === 'inicio');
  const normalizedItems = rawItems.map((item) => ({
    id: item.id,
    label: item.label || item.name,
    name: item.name || item.label,
    icon: item.icon || 'bi bi-newspaper',
    badge: item.badge || 0,
    category: item.name || item.category || null,
  }));

  if (hasInicio) {
    return normalizedItems;
  }

  return [
    {
      id: 'inicio',
      label: 'Início',
      name: 'Início',
      icon: '🏠',
      badge: 0,
      category: null,
    },
    ...normalizedItems,
  ];
}

/**
 * Desktop Sidebar component.
 */
export function Sidebar({
  navigationItems: propsNavItems,
  activeNavId: propsActiveNavId,
  onSelectNavItem: propsOnSelectNavItem,
  bookmarkedArticlesCount: propsBookmarkedCount,
}) {
  const storeNavigationItems = useNavigationStore((state) => state.navigationItems);
  const storeActiveNavId = useNavigationStore((state) => state.activeNavId);
  const storeSetActiveNavId = useNavigationStore((state) => state.setActiveNavId);
  const storeBookmarkedCount = useBookmarksStore((state) => state.bookmarkedArticleIds.size);
  const user = useUserStore((state) => state.user);

  const rawNavigationItems = propsNavItems ?? storeNavigationItems ?? [];
  const navigationItems = buildNavigationItems(rawNavigationItems);
  const activeNavId = propsActiveNavId ?? storeActiveNavId ?? 'inicio';
  const onSelectNavItem = propsOnSelectNavItem ?? storeSetActiveNavId;
  const bookmarkedArticlesCount = propsBookmarkedCount ?? storeBookmarkedCount ?? 0;

  const mainNavItems = navigationItems.filter(
    (item) => item.id !== 'salvos' && item.id !== 'favoritos',
  );

  const bottomNavItems = user
    ? [
        {
          id: 'salvos',
          label: 'Meus favoritos',
          icon: '🔖',
          badge: bookmarkedArticlesCount,
        },
      ]
    : [];

  return (
    <SidebarDesktopView
      mainNavItems={mainNavItems}
      bottomNavItems={bottomNavItems}
      activeNavId={activeNavId}
      onSelectNavItem={onSelectNavItem}
    />
  );
}

/**
 * Mobile Offcanvas Sidebar component.
 */
export function SidebarOffcanvas({
  navigationItems: propsNavItems,
  activeNavId: propsActiveNavId,
  onSelectNavItem: propsOnSelectNavItem,
  bookmarkedArticlesCount: propsBookmarkedCount,
}) {
  const storeNavigationItems = useNavigationStore((state) => state.navigationItems);
  const storeActiveNavId = useNavigationStore((state) => state.activeNavId);
  const storeSetActiveNavId = useNavigationStore((state) => state.setActiveNavId);
  const storeBookmarkedCount = useBookmarksStore((state) => state.bookmarkedArticleIds.size);
  const user = useUserStore((state) => state.user);

  const rawNavigationItems = propsNavItems ?? storeNavigationItems ?? [];
  const navigationItems = buildNavigationItems(rawNavigationItems);
  const activeNavId = propsActiveNavId ?? storeActiveNavId ?? 'inicio';
  const onSelectNavItem = propsOnSelectNavItem ?? storeSetActiveNavId;
  const bookmarkedArticlesCount = propsBookmarkedCount ?? storeBookmarkedCount ?? 0;

  const mainNavItems = navigationItems.filter(
    (item) => item.id !== 'salvos' && item.id !== 'favoritos',
  );

  const bottomNavItems = user
    ? [
        {
          id: 'salvos',
          label: 'Meus favoritos',
          icon: '🔖',
          badge: bookmarkedArticlesCount,
        },
        {
          id: 'perfil',
          label: 'Meu perfil',
          icon: '👤',
        },
        {
          id: 'configuracoes',
          label: 'Configurações',
          icon: '⚙️',
        },
      ]
    : [];

  return (
    <SidebarOffcanvasView
      mainNavItems={mainNavItems}
      bottomNavItems={bottomNavItems}
      activeNavId={activeNavId}
      onSelectNavItem={onSelectNavItem}
    />
  );
}
