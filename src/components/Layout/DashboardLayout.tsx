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
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

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

  return (
    <div className={`dashboard-root${collapsed ? ' sb-collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} menuItems={menuItems} basePath={basePath} />
      <Header onToggleSidebar={() => setCollapsed((c) => !c)} sidebarCollapsed={collapsed} />
      <div className="dashboard-body">
        <main className="dashboard-main">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
