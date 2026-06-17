import {
  LayoutDashboard, User, ClipboardList, ClipboardCheck, Send,
  CalendarOff, CalendarCheck, CalendarDays, UserCog, Monitor,
  Scale, Handshake, Megaphone, BarChart3, Banknote, Calculator,
  GraduationCap, BookOpen, Leaf, Sprout, Beef, TrendingUp,
  Briefcase, Receipt, Car, Mail, ChevronRight,
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
  Briefcase, Receipt, Car, Mail,
};

const ADMIN_GROUPS = [
  {
    label: 'Management',
    items: ['overview', 'tasks', 'assigned-tasks', 'leave-management'],
  },
  {
    label: 'Administration Office',
    items: ['admin-manager', 'it-officer', 'legal-officer', 'partnership-officer', 'marketing-officer', 'mel-officer'],
  },
  {
    label: 'Finance',
    items: ['finance-manager', 'accountant'],
  },
  {
    label: 'Training',
    items: ['training-manager', 'training-officer'],
  },
  {
    label: 'Farm & Carbon Credits',
    items: ['farm-manager', 'crop-officer', 'livestock-officer'],
  },
  {
    label: 'Transaction Advisory',
    items: ['transaction-manager', 'business-dev'],
  },
  {
    label: 'Supporting Staff',
    items: ['cashier', 'driver', 'messenger'],
  },
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
      <NavLink key={item.id} to={to} className={`sidebar-item ${isActive ? 'active' : ''}`}>
        <span className="item-icon">
          <IconComponent size={17} />
        </span>
        {!collapsed && <span className="item-label">{item.label}</span>}
        {!collapsed && isActive && <ChevronRight size={13} className="item-chevron" />}
      </NavLink>
    );
  };

  const renderGrouped = () => {
    return ADMIN_GROUPS.map((group) => {
      const groupItems = menuItems.filter((m) => group.items.includes(m.id));
      if (groupItems.length === 0) return null;
      return (
        <div key={group.label} className="sidebar-group">
          {!collapsed && <span className="group-label">{group.label}</span>}
          {collapsed && <div className="group-divider" />}
          {groupItems.map(renderItem)}
        </div>
      );
    });
  };

  return (
    <aside className={`saic-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-inner">
        {isAdmin ? renderGrouped() : (
          <div className="sidebar-group">
            {!collapsed && <span className="group-label">Navigation</span>}
            {menuItems.map(renderItem)}
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        {!collapsed && (
          <p className="sidebar-brand">
            © {new Date().getFullYear()} SAIC
          </p>
        )}
      </div>
    </aside>
  );
}
