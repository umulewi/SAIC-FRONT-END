import { LogOut, ChevronDown, PanelLeftClose, PanelLeftOpen, KeyRound, Eye, EyeOff, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationsPanel from '../Common/NotificationsPanel';
import client from '../../api/client';
import './Header.css';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export default function Header({ onToggleSidebar, sidebarCollapsed }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Change password modal state
  const [cpOpen,    setCpOpen]    = useState(false);
  const [cpCurrent, setCpCurrent] = useState('');
  const [cpNew,     setCpNew]     = useState('');
  const [cpConfirm, setCpConfirm] = useState('');
  const [showCur,   setShowCur]   = useState(false);
  const [showNew,   setShowNew]   = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [cpSaving,  setCpSaving]  = useState(false);
  const [cpError,   setCpError]   = useState('');
  const [cpSuccess, setCpSuccess] = useState('');

  const handleLogout = () => { logout(); navigate('/login'); };

  const openChangePw = () => {
    setDropdownOpen(false);
    setCpCurrent(''); setCpNew(''); setCpConfirm('');
    setCpError(''); setCpSuccess(''); setCpSaving(false);
    setCpOpen(true);
  };

  const handleChangePw = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setCpError(''); setCpSuccess('');
    if (!cpCurrent.trim())        { setCpError('Current password is required.'); return; }
    if (cpNew.length < 6)         { setCpError('New password must be at least 6 characters.'); return; }
    if (cpNew !== cpConfirm)      { setCpError('New passwords do not match.'); return; }
    if (cpNew === cpCurrent)      { setCpError('New password must differ from current password.'); return; }

    setCpSaving(true);
    try {
      await client.put('/change-password', { current_password: cpCurrent, new_password: cpNew });
      setCpSuccess('Password changed successfully!');
      setCpCurrent(''); setCpNew(''); setCpConfirm('');
      setTimeout(() => { setCpOpen(false); setCpSuccess(''); }, 1800);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to change password.';
      setCpError(msg);
    } finally { setCpSaving(false); }
  };

  const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : 'US';


  return (
    <>
      <header className="saic-header">
        <div className="hdr-left">
          <button className="hdr-toggle" onClick={onToggleSidebar}
            aria-label="Toggle sidebar" title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {sidebarCollapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
          </button>
         
        </div>

        <div className="hdr-right">
          <NotificationsPanel />

          <div className="hdr-user-wrap">
            <button className="hdr-user-btn" onClick={() => setDropdownOpen(p => !p)} aria-expanded={dropdownOpen}>
              <div className="hdr-avatar">{initials}</div>
              <div className="hdr-user-info">
                <span className="hdr-user-email">{user?.email}</span>
                <span className="hdr-user-role">{user?.role}</span>
              </div>
              <ChevronDown size={14} className={`hdr-chevron${dropdownOpen ? ' open' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                <div className="hdr-dropdown-backdrop" onClick={() => setDropdownOpen(false)} />
                <div className="hdr-dropdown">
                  <div className="hdr-drop-profile">
                    <div className="hdr-avatar lg">{initials}</div>
                    <div>
                      <p className="hdr-drop-email">{user?.email}</p>
                      <p className="hdr-drop-role">{user?.role}</p>
                    </div>
                  </div>
                  <div className="hdr-drop-divider" />
                  <button className="hdr-drop-item hdr-drop-change-pw" onClick={openChangePw}>
                    <KeyRound size={15} />
                    Change Password
                  </button>
                  <button className="hdr-drop-item hdr-drop-logout" onClick={handleLogout}>
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Change Password Modal ── */}
      {cpOpen && (
        <div className="cp-overlay" onClick={e => e.target === e.currentTarget && setCpOpen(false)}>
          <div className="cp-modal">
            {/* Header */}
            <div className="cp-modal-header">
              <div className="cp-modal-icon"><KeyRound size={20} /></div>
              <div>
                <h3 className="cp-modal-title">Change Password</h3>
                <p className="cp-modal-sub">Keep your account secure</p>
              </div>
              <button className="cp-close-btn" onClick={() => setCpOpen(false)} type="button"><X size={18} /></button>
            </div>

            <div className="cp-modal-body">
              {cpSuccess && (
                <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                  <CheckCircle size={14} /> {cpSuccess}
                </div>
              )}
              {cpError && (
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                  <AlertCircle size={14} /> {cpError}
                </div>
              )}

              <form onSubmit={handleChangePw}>
                {/* Current password */}
                <div className="cp-field">
                  <label className="cp-label">Current Password</label>
                  <div className="cp-input-wrap">
                    <input
                      className="cp-input"
                      type={showCur ? 'text' : 'password'}
                      value={cpCurrent}
                      onChange={e => { setCpCurrent(e.target.value); setCpError(''); }}
                      placeholder="Enter current password"
                      disabled={cpSaving}
                    />
                    <button type="button" className="cp-eye" onClick={() => setShowCur(p => !p)} tabIndex={-1}>
                      {showCur ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div className="cp-field">
                  <label className="cp-label">New Password</label>
                  <div className="cp-input-wrap">
                    <input
                      className="cp-input"
                      type={showNew ? 'text' : 'password'}
                      value={cpNew}
                      onChange={e => { setCpNew(e.target.value); setCpError(''); }}
                      placeholder="At least 6 characters"
                      disabled={cpSaving}
                    />
                    <button type="button" className="cp-eye" onClick={() => setShowNew(p => !p)} tabIndex={-1}>
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {cpNew && (
                    <div className="cp-strength">
                      <div className={`cp-strength-bar ${cpNew.length >= 10 ? 'strong' : cpNew.length >= 6 ? 'medium' : 'weak'}`} />
                      <span className="cp-strength-label">
                        {cpNew.length >= 10 ? 'Strong' : cpNew.length >= 6 ? 'Medium' : 'Weak'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm new password */}
                <div className="cp-field">
                  <label className="cp-label">Confirm New Password</label>
                  <div className="cp-input-wrap">
                    <input
                      className={`cp-input${cpConfirm && cpNew !== cpConfirm ? ' cp-input-err' : ''}`}
                      type={showConf ? 'text' : 'password'}
                      value={cpConfirm}
                      onChange={e => { setCpConfirm(e.target.value); setCpError(''); }}
                      placeholder="Repeat new password"
                      disabled={cpSaving}
                    />
                    <button type="button" className="cp-eye" onClick={() => setShowConf(p => !p)} tabIndex={-1}>
                      {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {cpConfirm && cpNew !== cpConfirm && (
                    <p className="cp-mismatch">Passwords do not match</p>
                  )}
                </div>

                <div className="cp-modal-footer">
                  <button type="submit" className="cp-submit-btn" disabled={cpSaving}>
                    {cpSaving
                      ? <><Loader2 size={14} className="spin" /> Changing…</>
                      : <><KeyRound size={14} /> Change Password</>
                    }
                  </button>
                  <button type="button" className="cp-cancel-btn" onClick={() => setCpOpen(false)} disabled={cpSaving}>
                    <X size={14} /> Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
