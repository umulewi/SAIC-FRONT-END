import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Calendar, AlertCircle, Eye, ArrowRight, Search, Filter } from 'lucide-react';
import { getTasks } from '../../api/tasks';
import type { EnhancedTask, TaskPriority, TaskStatus } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './SharedPages.css';
import './MyTasksPage.css';

interface MyTasksPageProps { apiBase: string; }

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'badge-low', medium: 'badge-medium', high: 'badge-high', urgent: 'badge-urgent',
};
const STATUS_COLORS: Record<TaskStatus, string> = {
  draft: 'badge-draft', assigned: 'badge-assigned', in_progress: 'badge-inprog',
  submitted: 'badge-submitted', approved: 'badge-approved', rejected: 'badge-rejected',
};

function fmtDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysLeft(deadline?: string) {
  if (!deadline) return null;
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  return diff;
}

export default function MyTasksPage({ apiBase }: MyTasksPageProps) {
  const nav = useNavigate();

  const [tasks,    setTasks]    = useState<EnhancedTask[]>([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const roleSlug = apiBase.replace(/^\//, '');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await getTasks({ search, status: filterStatus, limit: 50 });
      setTasks(res.tasks); setTotal(res.total);
    } catch {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterStatus]);

  const pending   = tasks.filter(t => ['assigned','in_progress'].includes(t.status)).length;
  const submitted = tasks.filter(t => t.status === 'submitted').length;
  const approved  = tasks.filter(t => t.status === 'approved').length;
  const rejected  = tasks.filter(t => t.status === 'rejected').length;

  return (
    <div>
      <PageHeader
        title="My Tasks"
        subtitle={`${total} task${total !== 1 ? 's' : ''} assigned to you`}
      />

      {/* Stats row */}
      <div className="mt-stat-row">
        <div className="mt-stat pending"><span className="mt-stat-num">{pending}</span><span className="mt-stat-lbl">Pending</span></div>
        <div className="mt-stat submitted"><span className="mt-stat-num">{submitted}</span><span className="mt-stat-lbl">Submitted</span></div>
        <div className="mt-stat approved"><span className="mt-stat-num">{approved}</span><span className="mt-stat-lbl">Approved</span></div>
        <div className="mt-stat rejected"><span className="mt-stat-num">{rejected}</span><span className="mt-stat-lbl">Rejected</span></div>
      </div>

      {/* Filters */}
      <div className="mt-filters">
        <div className="atm-search-box" style={{ flex: 1, maxWidth: 300 }}>
          <Search size={14} className="atm-search-icon" />
          <input className="atm-search-input" placeholder="Search tasks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') load(); }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={13} style={{ color: '#9ab09a' }} />
          <select className="atm-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? <LoadingSpinner message="Loading tasks…" /> : error ? (
        <div className="page-error"><AlertCircle size={16} />{error}</div>
      ) : tasks.length === 0 ? (
        <div className="mt-empty">
          <ClipboardList size={42} />
          <p>No tasks assigned to you yet.</p>
          <span>Tasks assigned by your manager will appear here.</span>
        </div>
      ) : (
        <div className="mt-task-list">
          {tasks.map(task => {
            const days = daysLeft(task.deadline);
            const isOverdue = days !== null && days < 0 && !['approved','rejected'].includes(task.status);
            const urgentSoon = days !== null && days >= 0 && days <= 2 && !['approved','rejected','submitted'].includes(task.status);
            return (
              <div key={task.id} className={`mt-task-card ${isOverdue ? 'card-overdue' : ''} ${urgentSoon ? 'card-urgent' : ''}`}>
                <div className="mt-task-main">
                  <div className="mt-task-top">
                    <h3 className="mt-task-title">{task.title}</h3>
                    <div className="mt-badges">
                      <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                      <span className={`badge ${STATUS_COLORS[task.status]}`}>{task.status.replace('_',' ')}</span>
                    </div>
                  </div>
                  {task.description && <p className="mt-task-desc">{task.description}</p>}
                  <div className="mt-task-meta">
                    <span className="mt-meta-item">
                      <Calendar size={12} />
                      {task.deadline
                        ? isOverdue
                          ? <span style={{ color: '#c0392b', fontWeight: 600 }}>Overdue · {fmtDate(task.deadline)}</span>
                          : urgentSoon
                            ? <span style={{ color: '#e65100', fontWeight: 600 }}>Due soon · {fmtDate(task.deadline)}</span>
                            : fmtDate(task.deadline)
                        : 'No deadline'
                      }
                    </span>
                    <span className="mt-meta-item" style={{ color: '#a0b8a0', fontSize: '0.74rem' }}>
                      {task.comment_count ?? 0} comment{task.comment_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <button
                  className="mt-view-btn"
                  onClick={() => nav(`/dashboard/${roleSlug}/tasks/${task.id}`)}
                >
                  <Eye size={14} /> View <ArrowRight size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
