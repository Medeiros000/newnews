import { Component } from 'react';

/**
 * SidebarNavItems Class Component.
 * Renders a list of navigation items as interactive buttons for the sidebar.
 */
export class SidebarNavItems extends Component {
  render() {
    const {
      items = [],
      activeNavId,
      onSelectNavItem,
      isOffcanvas = false,
    } = this.props;

    const normalizedActiveNavId = String(activeNavId || '').toLowerCase();

    return items.map((item) => {
      const isItemActive =
        String(item.id || '').toLowerCase() === normalizedActiveNavId ||
        String(item.name || '').toLowerCase() === normalizedActiveNavId;

      return (
        <button
          key={item.id}
          id={`nav-${item.id}`}
          {...(isOffcanvas ? { 'data-bs-dismiss': 'offcanvas' } : {})}
          onClick={() => onSelectNavItem?.(item.id)}
          className={`sidebar-item btn btn-link w-100 text-start d-flex align-items-center gap-2 rounded-3 px-3 py-2 mb-1 text-decoration-none fw-medium ${
            isItemActive
              ? 'active bg-primary text-white'
              : 'text-secondary'
          }`}
        >
          <span
            style={{
              fontSize: '1rem',
              width: 20,
              textAlign: 'center',
            }}
          >
            {item.icon && (item.icon.startsWith('bi ') || item.icon.startsWith('fa')) ? (
              <i className={item.icon} />
            ) : (
              item.icon || '📰'
            )}
          </span>

          <span style={{ fontSize: '1rem' }}>{item.label || item.name}</span>

          {/* Badge counter shown for items like bookmarks */}
          {item.badge > 0 && (
            <span
              className={`badge ms-auto ${
                isItemActive ? 'text-bg-light' : 'text-bg-primary'
              }`}
              style={{ fontSize: '0.5rem' }}
            >
              {item.badge}
            </span>
          )}

          {/* Active indicator dot shown in desktop sidebar when no badge is present */}
          {!isOffcanvas && isItemActive && !item.badge && (
            <span className="ms-auto sidebar-indicator rounded-pill bg-white opacity-75" />
          )}
        </button>
      );
    });
  }
}
