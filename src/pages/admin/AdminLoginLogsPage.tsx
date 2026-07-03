import { useEffect, useState } from 'react';
import { RefreshCw, Search, X, AlertCircle, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminGetLoginLogs } from '../../api/role';
import type { LoginLog } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../shared/SharedPages.css';

const PAGE_SIZE = 20;

function fmtDatetime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function initials(name?: string | null, email?: string) {
  if (name && name.trim() !== ' ') return name.trim().split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  return (email?.[0] ?? '?').toUpperCase();
}

export default function AdminLoginLogsPage() {
  const [logs,    setLogs]    = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [from,    setFrom]    = useState('');
  const [to,      setTo]      = useState('');
  const [page,    setPage]    = useState(1);

  const load = async (s = search, f = from, t = to) => {
    setLoading(true); setError('');
    try {
      const data = await adminGetLoginLogs({
        search: s || undefined,
        from_date: f || undefined,
        to_date: t || undefined,
      });
      setLogs(data); setPage(1);
    } catch {
      setError('Failed to load login logs.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const totalPages = Math.ceil(logs.length / PAGE_SIZE);
  const paged = logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="alm-root">
      <PageHeader
        title="Login Activity"
        subtitle="Track when users accessed the system"
        actions={
          <button className="btn-secondary" onClick={() => load()}>
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}><AlertCircle size={14} />{error}</div>}

      {/* Filters */}
      <div className="alm-filters" style={{ marginBottom: '1rem' }}>
        <div className="atm-search-box" style={{ flex: 1, minWidth: 200, maxWidth: 360 }}>
          <Search size={15} className="atm-search-icon" />
          <input className="atm-search-input" placeholder="Search by email or role…"
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(search, from, to)} />
          {search && <button className="atm-search-clear" onClick={() => { setSearch(''); load('', from, to); }}><X size={13} /></button>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: '#6a8c6a' }}>From</span>
          <input type="date" className="atm-select" value={from} max={to || undefined}
            onChange={e => setFrom(e.target.value)} />
          <span style={{ fontSize: '0.8rem', color: '#6a8c6a' }}>To</span>
          <input type="date" className="atm-select" value={to} min={from || undefined}
            onChange={e => setTo(e.target.value)} />
          <button className="btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
            onClick={() => load(search, from, to)}>
            <Search size={13} /> Apply
          </button>
          {(search || from || to) && (
            <button className="btn-secondary" onClick={() => { setSearch(''); setFrom(''); setTo(''); load('', '', ''); }}>
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '0.5rem', fontSize: '0.82rem', color: '#6a8c6a' }}>
        {logs.length} login event{logs.length !== 1 ? 's' : ''} found
      </div>

      {loading ? <LoadingSpinner message="Loading login activity…" /> : (
        <>
          <div className="table-card">
            <div style={{ overflowX: 'auto' }}>
              <table className="saic-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Login Time</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 && (
                    <tr><td colSpan={5}>
                      <div className="empty-state"><Shield size={38} /><p>No login records found.</p></div>
                    </td></tr>
                  )}
                  {paged.map((log, i) => (
                    <tr key={log.id}>
                      <td className="col-num">{(page - 1) * PAGE_SIZE + i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: '#2D5016', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                          }}>
                            {initials(log.full_name, log.email)}
                          </div>
                          <div>
                            {log.full_name && log.full_name.trim() !== '' && (
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e3a1e' }}>{log.full_name}</div>
                            )}
                            <div style={{ fontSize: '0.78rem', color: '#6a8c6a' }}>{log.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {log.role ? (
                          <span style={{
                            display: 'inline-block', padding: '0.2rem 0.55rem',
                            background: '#e8f5e9', color: '#2D5016',
                            borderRadius: 4, fontSize: '0.76rem', fontWeight: 600,
                          }}>{log.role}</span>
                        ) : <span style={{ color: '#b0c8b0' }}>—</span>}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#4a5568', whiteSpace: 'nowrap' }}>
                        {fmtDatetime(log.login_time)}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#6a8c6a', fontFamily: 'monospace' }}>
                        {log.ip_address ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="atm-pagination">
              <button className="atm-pg-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={15} />
              </button>
              <span className="atm-pg-info">Page {page} of {totalPages} ({logs.length} records)</span>
              <button className="atm-pg-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
