import { useEffect, useState } from 'react';
import {
  BarChart3, TrendingUp, CheckCircle, XCircle, Clock, AlertTriangle,
  Download, FileSpreadsheet, RefreshCw, Users, ClipboardList,
} from 'lucide-react';
import { getAnalytics, downloadExport } from '../../api/tasks';
import type { AnalyticsData } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../shared/SharedPages.css';
import './AdminTasksPage.css';
import './AdminAnalyticsPage.css';

const STATUS_META = [
  { key: 'draft',       label: 'Draft',       color: '#9e9e9e', bg: '#f5f5f5' },
  { key: 'assigned',    label: 'Assigned',     color: '#1565c0', bg: '#e3f2fd' },
  { key: 'in_progress', label: 'In Progress',  color: '#283593', bg: '#e8eaf6' },
  { key: 'submitted',   label: 'Submitted',    color: '#f57f17', bg: '#fff8e1' },
  { key: 'approved',    label: 'Approved',     color: '#2e7d32', bg: '#e8f5e9' },
  { key: 'rejected',    label: 'Rejected',     color: '#c62828', bg: '#fce4ec' },
] as const;

export default function AdminAnalyticsPage() {
  const [data,        setData]        = useState<AnalyticsData | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [exporting,   setExporting]   = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try   { setData(await getAnalytics()); }
    catch { setError('Failed to load analytics.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleExport = async () => {
    setExporting(true);
    try   { await downloadExport(); }
    catch { alert('Export failed. Please try again.'); }
    finally { setExporting(false); }
  };

  if (loading) return <LoadingSpinner message="Loading analytics…" />;
  if (error || !data) return <div className="page-error">{error || 'Failed to load.'}</div>;

  const maxBar = Math.max(...STATUS_META.map(m => data.by_status[m.key as keyof typeof data.by_status] || 0), 1);

  return (
    <div>
      <PageHeader
        title="Analytics & Reports"
        subtitle="Task performance overview across all staff"
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={load}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button className="btn-primary" onClick={handleExport} disabled={exporting}>
              {exporting ? <RefreshCw size={14} className="spin" /> : <FileSpreadsheet size={14} />}
              Export Excel
            </button>
          </div>
        }
      />

      {/* ── KPI row ── */}
      <div className="an-kpi-grid">
        <div className="an-kpi-card an-kpi-total">
          <div className="an-kpi-icon"><ClipboardList size={22} /></div>
          <div>
            <p className="an-kpi-value">{data.total_tasks}</p>
            <p className="an-kpi-label">Total Tasks</p>
          </div>
        </div>
        <div className="an-kpi-card an-kpi-approved">
          <div className="an-kpi-icon"><CheckCircle size={22} /></div>
          <div>
            <p className="an-kpi-value">{data.by_status.approved}</p>
            <p className="an-kpi-label">Approved</p>
          </div>
        </div>
        <div className="an-kpi-card an-kpi-submitted">
          <div className="an-kpi-icon"><Clock size={22} /></div>
          <div>
            <p className="an-kpi-value">{data.by_status.submitted}</p>
            <p className="an-kpi-label">Awaiting Review</p>
          </div>
        </div>
        <div className="an-kpi-card an-kpi-rejected">
          <div className="an-kpi-icon"><XCircle size={22} /></div>
          <div>
            <p className="an-kpi-value">{data.by_status.rejected}</p>
            <p className="an-kpi-label">Rejected</p>
          </div>
        </div>
        <div className="an-kpi-card an-kpi-overdue">
          <div className="an-kpi-icon"><AlertTriangle size={22} /></div>
          <div>
            <p className="an-kpi-value">{data.overdue}</p>
            <p className="an-kpi-label">Overdue</p>
          </div>
        </div>
        <div className="an-kpi-card an-kpi-rate">
          <div className="an-kpi-icon"><TrendingUp size={22} /></div>
          <div>
            <p className="an-kpi-value">{data.completion_rate}%</p>
            <p className="an-kpi-label">Completion Rate</p>
          </div>
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="an-charts-row">

        {/* Status breakdown bar chart */}
        <div className="an-chart-card">
          <h3 className="an-card-title"><BarChart3 size={16} /> Tasks by Status</h3>
          <div className="an-bar-chart">
            {STATUS_META.map(m => {
              const val = data.by_status[m.key as keyof typeof data.by_status] || 0;
              const pct = maxBar > 0 ? Math.round((val / maxBar) * 100) : 0;
              return (
                <div key={m.key} className="an-bar-row">
                  <span className="an-bar-label">{m.label}</span>
                  <div className="an-bar-track">
                    <div
                      className="an-bar-fill"
                      style={{ width: `${pct}%`, background: m.color }}
                    />
                  </div>
                  <span className="an-bar-count" style={{ color: m.color, background: m.bg }}>
                    {val}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority distribution */}
        <div className="an-chart-card">
          <h3 className="an-card-title"><Download size={16} /> Tasks by Priority</h3>
          <div className="an-priority-grid">
            {data.by_priority.map(p => {
              const pct = data.total_tasks > 0
                ? Math.round((p.count / data.total_tasks) * 100)
                : 0;
              const colors: Record<string, { color: string; bg: string }> = {
                low:    { color: '#2e7d32', bg: '#e8f5e9' },
                medium: { color: '#f57f17', bg: '#fff8e1' },
                high:   { color: '#e65100', bg: '#fff3e0' },
                urgent: { color: '#c62828', bg: '#fce4ec' },
              };
              const c = colors[p.priority] ?? { color: '#6a8c6a', bg: '#f0f7f0' };
              return (
                <div key={p.priority} className="an-priority-card" style={{ borderColor: c.color, background: c.bg }}>
                  <p className="an-priority-count" style={{ color: c.color }}>{p.count}</p>
                  <p className="an-priority-label" style={{ color: c.color }}>{p.priority}</p>
                  <p className="an-priority-pct">{pct}%</p>
                </div>
              );
            })}
            {data.by_priority.length === 0 && (
              <p style={{ color: '#a0b8a0', fontSize: '0.82rem' }}>No data.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── User Performance ── */}
      <div className="an-table-card">
        <h3 className="an-card-title"><Users size={16} /> Staff Performance</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="saic-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Assigned</th>
                <th>In Progress</th>
                <th>Submitted</th>
                <th>Approved</th>
                <th>Rejected</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.user_performance.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: '#a0b8a0', padding: '1.5rem' }}>
                    No assignment data yet.
                  </td>
                </tr>
              )}
              {data.user_performance.map((u, i) => {
                const rate = u.total_assigned > 0
                  ? Math.round((u.approved / u.total_assigned) * 100)
                  : 0;
                return (
                  <tr key={u.users_id}>
                    <td style={{ color: '#a0b8a0', fontSize: '0.78rem' }}>{i + 1}</td>
                    <td><strong>{u.full_name}</strong></td>
                    <td style={{ color: '#6a8c6a', fontSize: '0.82rem' }}>{u.email}</td>
                    <td>{u.total_assigned}</td>
                    <td><span style={{ color: '#283593', fontWeight: 600 }}>{u.in_progress}</span></td>
                    <td><span style={{ color: '#f57f17', fontWeight: 600 }}>{u.submitted}</span></td>
                    <td><span style={{ color: '#2e7d32', fontWeight: 600 }}>{u.approved}</span></td>
                    <td><span style={{ color: '#c62828', fontWeight: 600 }}>{u.rejected}</span></td>
                    <td>
                      <div className="an-rate-bar-wrap">
                        <div className="an-rate-bar" style={{ width: `${rate}%` }} />
                        <span className="an-rate-text">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Recent Tasks ── */}
      <div className="an-table-card">
        <h3 className="an-card-title"><ClipboardList size={16} /> Recent Tasks</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="saic-table">
            <thead>
              <tr><th>Title</th><th>Priority</th><th>Status</th><th>Due</th><th>Created</th></tr>
            </thead>
            <tbody>
              {data.recent_tasks.map(t => (
                <tr key={t.id}>
                  <td><strong>{t.title}</strong></td>
                  <td>
                    <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${t.status === 'in_progress' ? 'inprog' : t.status}`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#6a8c6a' }}>
                    {t.deadline ? new Date(t.deadline).toLocaleDateString('en-GB') : '—'}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#6a8c6a' }}>
                    {t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
