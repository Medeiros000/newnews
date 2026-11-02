import { Component } from 'react';
import { SidebarNavItems } from './SidebarNavItems';

/**
 * SidebarOffcanvasView Class Component.
 * Pure UI presentation for mobile offcanvas drawer.
 */
export class SidebarOffcanvasView extends Component {
  render() {
    const {
      mainNavItems = [],
      bottomNavItems = [],
      activeNavId,
      onSelectNavItem,
    } = this.props;

    return (
      <div
        id="sidebarOffcanvas"
        className="offcanvas offcanvas-start"
        tabIndex={-1}
        aria-labelledby="sidebarOffcanvasLabel"
        style={{ width: 240 }}
      >
        {/* Brand header with logo and close button */}
        <div
          className="offcanvas-header border-bottom py-2"
          style={{
            backgroundColor: 'var(--nn-navbar-bg)',
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-2 bg-primary"
              style={{
                width: 28,
                height: 28,
              }}
            >
              <svg width="16" height="16" fill="white" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                  clipRule="evenodd"
                />
                <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
              </svg>
            </div>

            <span
              id="sidebarOffcanvasLabel"
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

        {/* Offcanvas body with nav items */}
        <div className="offcanvas-body p-2 d-flex flex-column h-100 overflow-hidden">
          <p
            className="text-uppercase text-secondary fw-semibold px-2 pt-1 pb-1 mb-1"
            style={{
              fontSize: '0.68rem',
              letterSpacing: '0.08em',
            }}
          >
            Menu Principal
          </p>

          <nav className="sidebar-nav-scroll px-2 pb-2">
            <SidebarNavItems
              items={mainNavItems}
              activeNavId={activeNavId}
              onSelectNavItem={onSelectNavItem}
              isOffcanvas
            />
          </nav>

          {/* Bottom section rendered only when user is logged in */}
          {bottomNavItems.length > 0 && (
            <div className="sidebar-bottom-section flex-shrink-0">
              <div className="sidebar-divider mx-2 my-2" />

              <SidebarNavItems
                items={bottomNavItems}
                activeNavId={activeNavId}
                onSelectNavItem={onSelectNavItem}
                isOffcanvas
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

