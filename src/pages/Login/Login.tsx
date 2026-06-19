import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Loader2, ShieldCheck, X, Check, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { loginApi, forgotPasswordApi } from '../../api/auth';
import { getDashboardPath } from '../../config/rbac';
import './Login.css';

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Login state
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  // Forgot password state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [fpEmail, setFpEmail]       = useState('');
  const [fpLoading, setFpLoading]   = useState(false);
  const [fpError, setFpError]       = useState('');
  const [fpSent, setFpSent]         = useState(false);

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await loginApi({ email: email.trim(), password });
      login(res.token, res.user);
      navigate(getDashboardPath(res.user.role), { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid credentials. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    if (!fpEmail.trim()) { setFpError('Please enter your email address.'); return; }
    setFpLoading(true); setFpError('');
    try {
      await forgotPasswordApi(fpEmail.trim());
      setFpSent(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not send reset email. Please try again.';
      setFpError(msg);
    } finally {
      setFpLoading(false);
    }
  };

  const closeForgot = () => {
    setForgotOpen(false);
    setFpEmail(''); setFpError(''); setFpSent(false);
  };

  return (
    <>
      <div className="lp-root">

        {/* ── Left: brand panel ── */}
        <div className="lp-left">
          <div className="lp-shape lp-shape-1" />
          <div className="lp-shape lp-shape-2" />
          <div className="lp-shape lp-shape-3" />
          <div className="lp-shape lp-shape-4" />

          <div className="lp-left-content">
            <div className="lp-logo-card">
              <img src="/logo.png" alt="SAIC Logo" className="lp-logo" />
            </div>
            <div className="lp-divider" />
            <h1 className="lp-org-name">
              Stewardship Agribusiness<br />Incubation Center
            </h1>
            <p className="lp-org-subtitle">Management Information System</p>
            <span className="lp-tagline-pill">
              Transforming Agriculture Through Innovation
            </span>
          </div>
        </div>

        {/* ── Right: form panel ── */}
        <div className="lp-right">
          <div className="lp-form-container">

            <div className="lp-form-head">
              <div className="lp-lock-ring"><Lock size={20} /></div>
              <h2 className="lp-form-title">Welcome Back</h2>
              <p className="lp-form-sub">Sign in to access your dashboard</p>
            </div>

            {error && <div className="lp-error-alert" role="alert">{error}</div>}

            <form className="lp-form" onSubmit={handleSubmit} noValidate>
              <div className="lp-field-group">
                <label className="lp-label" htmlFor="lp-email">Email Address</label>
                <div className="lp-input-box">
                  <Mail size={15} className="lp-field-icon" />
                  <input
                    id="lp-email"
                    type="email"
                    className="lp-input"
                    placeholder="you@stewardincubation.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="lp-field-group">
                <div className="lp-label-row">
                  <label className="lp-label" htmlFor="lp-password">Password</label>
                  <button type="button" className="lp-forgot-link" onClick={() => setForgotOpen(true)}>
                    Forgot password?
                  </button>
                </div>
                <div className="lp-input-box">
                  <Lock size={15} className="lp-field-icon" />
                  <input
                    id="lp-password"
                    type={showPassword ? 'text' : 'password'}
                    className="lp-input lp-input-has-eye"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="lp-eye-btn"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="lp-submit-btn" disabled={loading}>
                {loading
                  ? <><Loader2 size={16} className="spin" /> Signing in…</>
                  : 'Sign In'
                }
              </button>
            </form>

            <p className="lp-security-note">
              <ShieldCheck size={12} />
              Authorized SAIC personnel only
            </p>
          </div>
        </div>
      </div>

      {/* ── Forgot Password Modal ── */}
      {forgotOpen && (
        <div className="fp-overlay" onClick={(e) => e.target === e.currentTarget && closeForgot()}>
          <div className="fp-modal" role="dialog" aria-modal="true" aria-labelledby="fp-title">

            <div className="fp-modal-head">
              <div className="fp-icon-ring"><KeyRound size={18} /></div>
              <div>
                <h3 id="fp-title" className="fp-title">Reset Password</h3>
                <p className="fp-subtitle">
                  {fpSent ? 'Email sent successfully' : 'Enter your email to receive a reset link'}
                </p>
              </div>
              <button className="fp-close" onClick={closeForgot} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {fpSent ? (
              /* ── Email sent confirmation ── */
              <div className="fp-success">
                <div className="fp-success-icon">
                  <Check size={24} />
                </div>
                <p className="fp-success-msg">
                  A password reset link has been sent to <strong>{fpEmail}</strong>.
                  Check your inbox and follow the instructions.
                </p>
                <p className="fp-expire-note">
                  The link expires in <strong>1 hour</strong> and can only be used once.
                </p>
                <button className="lp-submit-btn fp-done-btn" onClick={closeForgot}>
                  Done
                </button>
              </div>
            ) : (
              /* ── Email input form ── */
              <>
                {fpError && <div className="fp-error">{fpError}</div>}
                <form className="fp-form" onSubmit={handleForgot} noValidate>
                  <div className="lp-field-group">
                    <label className="lp-label" htmlFor="fp-email">Email Address</label>
                    <div className="lp-input-box">
                      <Mail size={15} className="lp-field-icon" />
                      <input
                        id="fp-email"
                        type="email"
                        className="lp-input"
                        placeholder="your.email@stewardincubation.com"
                        value={fpEmail}
                        onChange={(e) => setFpEmail(e.target.value)}
                        disabled={fpLoading}
                        autoFocus
                      />
                    </div>
                  </div>
                  <button type="submit" className="lp-submit-btn" disabled={fpLoading}>
                    {fpLoading
                      ? <><Loader2 size={15} className="spin" /> Sending email…</>
                      : 'Send Reset Link'
                    }
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
