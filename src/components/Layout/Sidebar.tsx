import {
  LayoutDashboard, User, ClipboardList, ClipboardCheck, Send,
  CalendarOff, CalendarCheck, CalendarDays, UserCog, Monitor,
  Scale, Handshake, Megaphone, BarChart3, Banknote, Calculator,
  GraduationCap, BookOpen, Leaf, Sprout, Beef, TrendingUp,
  Briefcase, Receipt, Car, Mail, DollarSign,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import type { MenuItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  LayoutDashboard, User, ClipboardList, ClipboardCheck, Send,
  CalendarOff, CalendarCheck, CalendarDays, UserCog, Monitor,
  Scale, Handshake, Megaphone, BarChart3, Banknote, Calculator,
  GraduationCap, BookOpen, Leaf, Sprout, Beef, TrendingUp,
  Briefcase, Receipt, Car, Mail, DollarSign,
};

const ADMIN_GROUPS = [
  { label: 'Management',            items: ['overview', 'tasks', 'assigned-tasks', 'leave-management', 'petty-cash'] },
  { label: 'Administration Office', items: ['admin-manager', 'it-officer', 'legal-officer', 'partnership-off', 'marketing-officer', 'mel-officer'] },
  { label: 'Finance',               items: ['finance-manager', 'accountant'] },
  { label: 'Training',              items: ['training-manager', 'training-officer'] },
  { label: 'Farm & Carbon Credits', items: ['farm-manager', 'crop-officer', 'livestock-officer'] },
  { label: 'Transaction Advisory',  items: ['transaction-mgr', 'business-dev'] },
  { label: 'Supporting Staff',      items: ['cashier', 'driver', 'messenger'] },
];

interface SidebarProps {
  collapsed: boolean;
  menuItems: MenuItem[];
  basePath: string;
}

export default function Sidebar({ collapsed, menuItems, basePath }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'Admin';

  const renderItem = (item: MenuItem) => {
    const IconComponent = ICON_MAP[item.icon] ?? LayoutDashboard;
    const to = `${basePath}/${item.path}`;
    const isActive = location.pathname === to || location.pathname.startsWith(to + '/');

    return (
      <NavLink key={item.id} to={to} className={`sb-item${isActive ? ' active' : ''}`} title={collapsed ? item.label : undefined}>
        <span className="sb-icon"><IconComponent size={17} /></span>
        {!collapsed && <span className="sb-label">{item.label}</span>}
        {!collapsed && isActive && <span className="sb-active-dot" />}
      </NavLink>
    );
  };

  const renderGrouped = () =>
    ADMIN_GROUPS.map((group) => {
      const groupItems = menuItems.filter((m) => group.items.includes(m.id));
      if (groupItems.length === 0) return null;
      return (
        <div key={group.label} className="sb-group">
          {!collapsed
            ? <span className="sb-group-label">{group.label}</span>
            : <div className="sb-group-divider" />
          }
          {groupItems.map(renderItem)}
        </div>
      );
    });

  return (
    <aside className={`saic-sidebar${collapsed ? ' collapsed' : ''}`}>

      {/* Logo section */}
      <div className="sb-logo-area">
        <div className="sb-logo-card">
          <img src="/logo.png" alt="SAIC" className="sb-logo-img" />
        </div>
        {!collapsed && (
          <div className="sb-logo-text">
            <span className="sb-logo-title">SAIC MIS</span>
            <span className="sb-logo-sub">Management Portal</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sb-nav">
        {isAdmin ? renderGrouped() : (
          <div className="sb-group">
            {!collapsed && <span className="sb-group-label">Navigation</span>}
            {menuItems.map(renderItem)}
          </div>
        )}
      </nav>

      {/* Bottom footer */}
      <div className="sb-bottom">
        {!collapsed && (
          <p className="sb-copyright">© {new Date().getFullYear()} SAIC</p>
        )}
      </div>
    </aside>
  );
}
