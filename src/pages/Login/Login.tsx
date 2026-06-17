import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { loginApi } from '../../api/auth';
import { getDashboardPath } from '../../config/rbac';
import './Login.css';

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="brand-logo">SAIC</div>
          <h1 className="brand-name">Stewardship Agribusiness<br />Incubation Center</h1>
          <p className="brand-tagline">Transforming Agriculture Through Innovation</p>
        </div>
        <div className="login-illustration">
          <div className="illustration-card">
            <div className="ill-icon">🌱</div>
            <p>Empowering Communities Since 2020</p>
          </div>
          <div className="illustration-card">
            <div className="ill-icon">📊</div>
            <p>Enterprise Management Information System</p>
          </div>
          <div className="illustration-card">
            <div className="ill-icon">🤝</div>
            <p>Connecting Farmers, Advisors & Partners</p>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-avatar">
              <Lock size={22} />
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to your SAIC EMIS account</p>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@stewardincubation.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="login-footer-note">
            Access is restricted to authorized SAIC personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
