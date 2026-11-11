import { useState, type FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { resetPasswordApi } from '../../api/auth';
import './ResetPasswordPage.css';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword]           = useState('');
  const [confirm, setConfirm]             = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState(false);

  if (!token) {
    return (
      <div className="rp-root">
        <div className="rp-card">
          <div className="rp-status-icon rp-icon-error"><AlertCircle size={28} /></div>
          <h2 className="rp-heading">Invalid Link</h2>
          <p className="rp-text">This reset link is missing its token. Please request a new one from the login page.</p>
          <button className="rp-btn" onClick={() => navigate('/login')}>Back to Login</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) { setError('Please enter a new password.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true); setError('');
    try {
      await resetPasswordApi(token, password);
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to reset password. The link may have expired.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8)  s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/\d/.test(password))   s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][strength];
  const strengthClass = ['', 'rp-weak', 'rp-fair', 'rp-good', 'rp-strong', 'rp-strong'][strength];

  return (
    <div className="rp-root">
      <div className="rp-brand-strip">
        <img src="/logo.png" alt="SAIC" className="rp-brand-logo" />
        <span className="rp-brand-name">SAIC MIS</span>
      </div>

      <div className="rp-card">
        {success ? (
          <>
            <div className="rp-status-icon rp-icon-success"><CheckCircle size={28} /></div>
            <h2 className="rp-heading">Password Updated</h2>
            <p className="rp-text">Your password has been reset successfully. You can now sign in with your new password.</p>
            <button className="rp-btn" onClick={() => navigate('/login')}>Go to Login</button>
          </>
        ) : (
          <>
            <div className="rp-card-head">
              <div className="rp-lock-ring"><Lock size={20} /></div>
              <h2 className="rp-heading">Set New Password</h2>
              <p className="rp-text">Choose a strong password for your account.</p>
            </div>

            {error && (
              <div className="rp-error">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <form className="rp-form" onSubmit={handleSubmit} noValidate>
              {/* New password */}
              <div className="rp-field">
                <label className="rp-label" htmlFor="rp-pass">New Password</label>
                <div className="rp-input-box">
                  <Lock size={15} className="rp-icon" />
                  <input
                    id="rp-pass"
                    type={showPassword ? 'text' : 'password'}
                    className="rp-input rp-input-eye"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                  <button type="button" className="rp-eye" onClick={() => setShowPassword(p => !p)}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Strength meter */}
                {password && (
                  <div className="rp-strength">
                    <div className="rp-strength-bars">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`rp-bar ${i <= strength ? strengthClass : ''}`} />
                      ))}
                    </div>
                    <span className={`rp-strength-label ${strengthClass}`}>{strengthLabel}</span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="rp-field">
                <label className="rp-label" htmlFor="rp-confirm">Confirm Password</label>
                <div className="rp-input-box">
                  <Lock size={15} className="rp-icon" />
                  <input
                    id="rp-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    className={`rp-input rp-input-eye${confirm && confirm !== password ? ' rp-input-err' : ''}`}
                    placeholder="Repeat your new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    disabled={loading}
                  />
                  <button type="button" className="rp-eye" onClick={() => setShowConfirm(p => !p)}>
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirm && confirm !== password && (
                  <span className="rp-mismatch">Passwords do not match</span>
                )}
              </div>

              <button type="submit" className="rp-btn rp-btn-full" disabled={loading}>
                {loading
                  ? <><Loader2 size={15} className="spin" /> Resetting…</>
                  : 'Reset Password'
                }
              </button>
            </form>

            <button className="rp-back-link" onClick={() => navigate('/login')}>
              ← Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
