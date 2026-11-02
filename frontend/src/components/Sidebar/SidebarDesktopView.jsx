import { Component } from 'react';
import { SidebarNavItems } from './SidebarNavItems';

/**
 * SidebarDesktopView Class Component.
 * Pure UI presentation for desktop sidebar.
 */
export class SidebarDesktopView extends Component {
  render() {
    const {
      mainNavItems = [],
      bottomNavItems = [],
      activeNavId,
      onSelectNavItem,
    } = this.props;

    return (
      <aside
        id="sidebar-desktop"
        className="sidebar d-none d-md-flex flex-column border-end"
        style={{ width: 220 }}
      >
        <p
          className="text-uppercase text-secondary fw-semibold px-3 pt-3 pb-1 mb-0 flex-shrink-0"
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
          />
        </nav>

        {/* Bottom section rendered only when user is logged in */}
        {bottomNavItems.length > 0 && (
          <div className="sidebar-bottom-section px-2 mt-auto flex-shrink-0">
            <div className="sidebar-divider mx-2 my-2" />

            <SidebarNavItems
              items={bottomNavItems}
              activeNavId={activeNavId}
              onSelectNavItem={onSelectNavItem}
            />
          </div>
        )}
      </aside>
    );
  }
}

