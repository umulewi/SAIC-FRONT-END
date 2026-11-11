import { useEffect, useState } from 'react';
import {
  ClipboardList, ClipboardCheck, Users, CalendarDays,
  BarChart3, TrendingUp, CheckCircle, XCircle, Clock,
  AlertTriangle, RefreshCw, Download, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { adminGetTasks, adminGetAssignedTasks, adminGetStaff, adminGetLeaveRequests } from '../../api/role';
import { getAnalytics } from '../../api/tasks';
import type { AnalyticsData } from '../../types';
import { StatCard } from '../../components/Common/Card';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import '../shared/SharedPages.css';
import './AdminAnalyticsPage.css';
import './AdminOverviewPage.css';

const STATUS_META = [
  { key: 'draft',       label: 'Draft',       color: '#9e9e9e', bg: '#f5f5f5' },
  { key: 'assigned',    label: 'Assigned',     color: '#1565c0', bg: '#e3f2fd' },
  { key: 'in_progress', label: 'In Progress',  color: '#283593', bg: '#e8eaf6' },
  { key: 'submitted',   label: 'Submitted',    color: '#f57f17', bg: '#fff8e1' },
  { key: 'approved',    label: 'Approved',     color: '#2e7d32', bg: '#e8f5e9' },
  { key: 'rejected',    label: 'Rejected',     color: '#c62828', bg: '#fce4ec' },
] as const;

export default function AdminOverviewPage() {
  const { user } = useAuth();

  // Quick-stat counts
  const [taskCount,     setTaskCount]     = useState(0);
  const [assignedCount, setAssignedCount] = useState(0);
  const [staffCount,    setStaffCount]    = useState(0);
  const [leaveCount,    setLeaveCount]    = useState(0);
  const [statsLoading,  setStatsLoading]  = useState(true);

  // Analytics
  const [analytics,    setAnalytics]    = useState<AnalyticsData | null>(null);
  const [anLoading,    setAnLoading]    = useState(true);
  const [anError,      setAnError]      = useState('');

  const PAGE_SIZE = 5;
  const [perfPage,  setPerfPage]  = useState(1);
  const [tasksPage, setTasksPage] = useState(1);
  const loadAnalytics = async () => {
    setAnLoading(true); setAnError('');
    try   { setAnalytics(await getAnalytics()); }
    catch { setAnError('Failed to load analytics data.'); }
    finally { setAnLoading(false); }
  };

  useEffect(() => {
    Promise.allSettled([
      adminGetTasks(),
      adminGetAssignedTasks(),
      adminGetStaff(),
      adminGetLeaveRequests(),
    ]).then(([tasks, assigned, staff, leaves]) => {
      if (tasks.status    === 'fulfilled') setTaskCount(tasks.value.length);
      if (assigned.status === 'fulfilled') setAssignedCount(assigned.value.length);
      if (staff.status    === 'fulfilled') setStaffCount(staff.value.length);
      if (leaves.status   === 'fulfilled') {
        setLeaveCount(leaves.value.filter(l => !l.status || l.status === 'pending').length);
      }
      setStatsLoading(false);
    });
    loadAnalytics();
  }, []);

  if (statsLoading) return <LoadingSpinner message="Loading admin dashboard…" />;

  const maxBar = analytics
    ? Math.max(...STATUS_META.map(m => analytics.by_status[m.key as keyof typeof analytics.by_status] || 0), 1)
    : 1;

  return (
    <div className="ao-root">
      <PageHeader
        title={`Welcome, ${user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.email ?? 'Admin'}!`}
        subtitle="System Administrator — Full access to all modules"
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={loadAnalytics}>
              <RefreshCw size={14} /> Refresh
            </button>
            
          </div>
        }
      />

      {/* ── Quick Stats ── */}
      <div className="stats-grid">
        <StatCard label="Total Tasks"      value={taskCount}     icon={<ClipboardList size={20} />}  color="green" />
        <StatCard label="Task Assignments" value={assignedCount} icon={<ClipboardCheck size={20} />} color="blue" />
        <StatCard label="Total Staff"      value={staffCount}    icon={<Users size={20} />}           color="amber" />
        <StatCard label="Pending Leaves"   value={leaveCount}    icon={<CalendarDays size={20} />}    color="green" />
      </div>

      {/* ── Section divider ── */}
      <div className="ao-section-divider">
        <BarChart3 size={15} />
        Analytics &amp; Performance
      </div>

      {anLoading ? (
        <LoadingSpinner message="Loading analytics…" />
      ) : anError ? (
        <div className="alert alert-error">{anError}</div>
      ) : analytics && (
        <>
          {/* ── KPI row ── */}
          <div className="an-kpi-grid">
            <div className="an-kpi-card an-kpi-total">
              <div className="an-kpi-icon"><ClipboardList size={22} /></div>
              <div><p className="an-kpi-value">{analytics.total_tasks}</p><p className="an-kpi-label">Total Tasks</p></div>
            </div>
            <div className="an-kpi-card an-kpi-approved">
              <div className="an-kpi-icon"><CheckCircle size={22} /></div>
              <div><p className="an-kpi-value">{analytics.by_status.approved}</p><p className="an-kpi-label">Approved</p></div>
            </div>
            <div className="an-kpi-card an-kpi-submitted">
              <div className="an-kpi-icon"><Clock size={22} /></div>
              <div><p className="an-kpi-value">{analytics.by_status.submitted}</p><p className="an-kpi-label">Awaiting Review</p></div>
            </div>
            <div className="an-kpi-card an-kpi-rejected">
              <div className="an-kpi-icon"><XCircle size={22} /></div>
              <div><p className="an-kpi-value">{analytics.by_status.rejected}</p><p className="an-kpi-label">Rejected</p></div>
            </div>
            <div className="an-kpi-card an-kpi-overdue">
              <div className="an-kpi-icon"><AlertTriangle size={22} /></div>
              <div><p className="an-kpi-value">{analytics.overdue}</p><p className="an-kpi-label">Overdue</p></div>
            </div>
            <div className="an-kpi-card an-kpi-rate">
              <div className="an-kpi-icon"><TrendingUp size={22} /></div>
              <div><p className="an-kpi-value">{analytics.completion_rate}%</p><p className="an-kpi-label">Completion Rate</p></div>
            </div>
          </div>

          {/* ── Charts row ── */}
          <div className="an-charts-row">
            <div className="an-chart-card">
              <h3 className="an-card-title"><BarChart3 size={16} /> Tasks by Status</h3>
              <div className="an-bar-chart">
                {STATUS_META.map(m => {
                  const val = analytics.by_status[m.key as keyof typeof analytics.by_status] || 0;
                  const pct = maxBar > 0 ? Math.round((val / maxBar) * 100) : 0;
                  return (
                    <div key={m.key} className="an-bar-row">
                      <span className="an-bar-label">{m.label}</span>
                      <div className="an-bar-track">
                        <div className="an-bar-fill" style={{ width: `${pct}%`, background: m.color }} />
                      </div>
                      <span className="an-bar-count" style={{ color: m.color, background: m.bg }}>{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="an-chart-card">
              <h3 className="an-card-title"><Download size={16} /> Tasks by Priority</h3>
              <div className="an-priority-grid">
                {analytics.by_priority.map(p => {
                  const pct = analytics.total_tasks > 0 ? Math.round((p.count / analytics.total_tasks) * 100) : 0;
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
                {analytics.by_priority.length === 0 && (
                  <p style={{ color: '#a0b8a0', fontSize: '0.82rem' }}>No data.</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Staff Performance ── */}
          {(() => {
            const perfTotal = analytics.user_performance.length;
            const perfPages = Math.ceil(perfTotal / PAGE_SIZE);
            const perfSlice = analytics.user_performance.slice((perfPage - 1) * PAGE_SIZE, perfPage * PAGE_SIZE);
            return (
              <div className="an-table-card">
                <h3 className="an-card-title"><Users size={16} /> Staff Task Performance</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="saic-table">
                    <thead>
                      <tr>
                        <th>#</th><th>Name</th><th>Email</th>
                        <th>Assigned</th><th>In Progress</th><th>Submitted</th>
                        <th>Approved</th><th>Rejected</th><th>Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perfTotal === 0 && (
                        <tr><td colSpan={9} style={{ textAlign: 'center', color: '#a0b8a0', padding: '1.5rem' }}>No assignment data yet.</td></tr>
                      )}
                      {perfSlice.map((u, i) => {
                        const rate = u.total_assigned > 0 ? Math.round((u.approved / u.total_assigned) * 100) : 0;
                        return (
                          <tr key={u.users_id}>
                            <td style={{ color: '#a0b8a0', fontSize: '0.78rem' }}>{(perfPage - 1) * PAGE_SIZE + i + 1}</td>
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
                {perfPages > 1 && (
                  <div className="atm-pagination">
                    <button className="atm-pg-btn" disabled={perfPage <= 1} onClick={() => setPerfPage(p => p - 1)}>
                      <ChevronLeft size={15} />
                    </button>
                    <span className="atm-pg-info">Page {perfPage} of {perfPages} ({perfTotal} staff)</span>
                    <button className="atm-pg-btn" disabled={perfPage >= perfPages} onClick={() => setPerfPage(p => p + 1)}>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Recent Tasks ── */}
          {(() => {
            const tasksTotal = analytics.recent_tasks.length;
            const tasksPages = Math.ceil(tasksTotal / PAGE_SIZE);
            const tasksSlice = analytics.recent_tasks.slice((tasksPage - 1) * PAGE_SIZE, tasksPage * PAGE_SIZE);
            return (
              <div className="an-table-card">
                <h3 className="an-card-title"><ClipboardList size={16} /> Recent Tasks</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="saic-table">
                    <thead>
                      <tr><th>Title</th><th>Priority</th><th>Status</th><th>Due</th><th>Created</th></tr>
                    </thead>
                    <tbody>
                      {tasksTotal === 0 && (
                        <tr><td colSpan={5} style={{ textAlign: 'center', color: '#a0b8a0', padding: '1.5rem' }}>No tasks yet.</td></tr>
                      )}
                      {tasksSlice.map(t => (
                        <tr key={t.id}>
                          <td><strong>{t.title}</strong></td>
                          <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
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
                {tasksPages > 1 && (
                  <div className="atm-pagination">
                    <button className="atm-pg-btn" disabled={tasksPage <= 1} onClick={() => setTasksPage(p => p - 1)}>
                      <ChevronLeft size={15} />
                    </button>
                    <span className="atm-pg-info">Page {tasksPage} of {tasksPages} ({tasksTotal} tasks)</span>
                    <button className="atm-pg-btn" disabled={tasksPage >= tasksPages} onClick={() => setTasksPage(p => p + 1)}>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
