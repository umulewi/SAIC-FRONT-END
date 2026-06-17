import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import type { MenuItem } from '../../types';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  menuItems: MenuItem[];
  basePath: string;
}

export default function DashboardLayout({ menuItems, basePath }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dashboard-root">
      <Header onToggleSidebar={() => setCollapsed((c) => !c)} sidebarCollapsed={collapsed} />
      <Sidebar collapsed={collapsed} menuItems={menuItems} basePath={basePath} />
      <div className={`dashboard-body ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <main className="dashboard-main">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
