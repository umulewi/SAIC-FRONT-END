import { Menu, LogOut, Bell, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.email?.substring(0, 2).toUpperCase() ?? 'US';

  return (
    <header className="saic-header">
      <div className="header-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <Menu size={20} />
        </button>
        <div className="header-logo">
          <div className="logo-mark">SAIC</div>
          <div className="logo-text">
            <span className="logo-title">Stewardship Agribusiness</span>
            <span className="logo-sub">Incubation Center</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        <button className="header-icon-btn" aria-label="Notifications">
          <Bell size={18} />
        </button>

        <div className="user-menu">
          <button
            className="user-btn"
            onClick={() => setDropdownOpen((p) => !p)}
            aria-expanded={dropdownOpen}
          >
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <span className="user-email">{user?.email}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <ChevronDown size={14} className={dropdownOpen ? 'chevron-open' : ''} />
          </button>

          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="user-avatar large">{initials}</div>
                <div>
                  <p className="dropdown-email">{user?.email}</p>
                  <p className="dropdown-role">{user?.role}</p>
                </div>
              </div>
              <hr className="dropdown-divider" />
              <button className="dropdown-item logout" onClick={handleLogout}>
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
