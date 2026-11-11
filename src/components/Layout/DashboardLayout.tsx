import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../../context/AuthContext';
import type { MenuItem } from '../../types';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  menuItems: MenuItem[];
  basePath: string;
}

export default function DashboardLayout({ menuItems, basePath }: DashboardLayoutProps) {
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [isMobile,    setIsMobile]    = useState(window.innerWidth < 768);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const role = user?.role ?? 'Portal';
    const segment = location.pathname.replace(basePath + '/', '');
    const matched = menuItems.find(item =>
      segment === item.path || segment.startsWith(item.path + '/')
    );
    document.title = matched
      ? `${role} — ${matched.label}`
      : `${role} — Dashboard`;
  }, [location.pathname, menuItems, basePath, user?.role]);

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen(v => !v);
    } else {
      setCollapsed(c => !c);
    }
  };

  const sidebarCollapsedForHeader = isMobile ? !mobileOpen : collapsed;

  return (
    <div className={`dashboard-root${collapsed && !isMobile ? ' sb-collapsed' : ''}`}>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div className="sb-mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <Sidebar
        collapsed={isMobile ? false : collapsed}
        mobileOpen={mobileOpen}
        isMobile={isMobile}
        menuItems={menuItems}
        basePath={basePath}
        onNavClick={() => isMobile && setMobileOpen(false)}
      />

      <Header
        onToggleSidebar={handleToggle}
        sidebarCollapsed={sidebarCollapsedForHeader}
      />

      <div className="dashboard-body">
        <main className="dashboard-main">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
