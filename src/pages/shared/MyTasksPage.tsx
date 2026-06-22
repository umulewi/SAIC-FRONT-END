import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, Calendar, AlertCircle, Eye, ArrowRight, Search, Filter,
  UserPlus, CheckCircle, XCircle, Users, Loader2, X, Inbox, Send as SendIcon,
} from 'lucide-react';
import { getTasks, assignToTeam, managerReviewTask } from '../../api/tasks';
import { getMyTeam } from '../../api/role';
import { useAuth } from '../../context/AuthContext';
import type { EnhancedTask, TaskPriority, TeamMember } from '../../types';
import { WORKFLOW_LABELS, WORKFLOW_BADGE } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './SharedPages.css';
import './MyTasksPage.css';

interface MyTasksPageProps { apiBase: string; }

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'badge-low', medium: 'badge-medium', high: 'badge-high', urgent: 'badge-urgent',
};

function fmtDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function daysLeft(deadline?: string) {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

// ── Task card shared component ────────────────────────────────────────────────
function TaskCard({
  task, roleSlug, onAssignToTeam, onReview,
}: {
  task: EnhancedTask;
  roleSlug: string;
  onAssignToTeam?: (task: EnhancedTask) => void;
  onReview?: (task: EnhancedTask) => void;
}) {
  const nav   = useNavigate();
  const days  = daysLeft(task.deadline);
  const stage = task.workflow_stage;

  const isOverdue   = days !== null && days < 0 && stage !== 'completed' && stage !== 'rejected_to_manager';
  const urgentSoon  = days !== null && days >= 0 && days <= 2 && !['completed','rejected_to_manager','pending_admin_review'].includes(stage ?? '');

  const stageBadge  = stage ? WORKFLOW_BADGE[stage] : 'badge-draft';
  const stageLabel  = stage ? WORKFLOW_LABELS[stage] : task.status.replace('_', ' ');

  return (
    <div className={`mt-task-card ${isOverdue ? 'card-overdue' : ''} ${urgentSoon ? 'card-urgent' : ''}`}>
      <div className="mt-task-main">
        <div className="mt-task-top">
          <h3 className="mt-task-title">{task.title}</h3>
          <div className="mt-badges">
            <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
            <span className={`badge ${stageBadge}`}>{stageLabel}</span>
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
      <div className="mt-task-actions">
        {onAssignToTeam && stage === 'pending_manager' && (
          <button className="mt-action-btn mt-action-assign" onClick={() => onAssignToTeam(task)}>
            <UserPlus size={13} /> Assign to Team
          </button>
        )}
        {onReview && stage === 'pending_manager_review' && (
          <button className="mt-action-btn mt-action-review" onClick={() => onReview(task)}>
            <CheckCircle size={13} /> Review Submission
          </button>
        )}
        <button className="mt-view-btn" onClick={() => nav(`/dashboard/${roleSlug}/tasks/${task.id}`)}>
          <Eye size={14} /> View <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MyTasksPage({ apiBase }: MyTasksPageProps) {
  const { user }    = useAuth();
  const roleSlug    = apiBase.replace(/^\//, '');
  const isManager   = (user?.role ?? '').endsWith('Manager');

  // ── Shared state ─────────────────────────────────────────────────────────
  const [tab,          setTab]          = useState<'received' | 'given'>('received');
  const [tasks,        setTasks]        = useState<EnhancedTask[]>([]);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const [filterStage,  setFilterStage]  = useState('');

  // ── Assign to Team modal ──────────────────────────────────────────────────
  const [assignTask,   setAssignTask]   = useState<EnhancedTask | null>(null);
  const [teamMembers,  setTeamMembers]  = useState<TeamMember[]>([]);
  const [teamLoading,  setTeamLoading]  = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<number[]>([]);
  const [assigning,    setAssigning]    = useState(false);
  const [assignError,  setAssignError]  = useState('');

  // ── Manager Review modal ──────────────────────────────────────────────────
  const [reviewTask,   setReviewTask]   = useState<EnhancedTask | null>(null);
  const [decision,     setDecision]     = useState<'approved' | 'rejected'>('approved');
  const [feedback,     setFeedback]     = useState('');
  const [reviewing,    setReviewing]    = useState(false);
  const [reviewError,  setReviewError]  = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const view = isManager ? tab : undefined;
      const res = await getTasks({
        view,
        workflow_stage: filterStage || undefined,
        search: search || undefined,
        limit: 50,
      });
      setTasks(res.tasks); setTotal(res.total);
    } catch {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tab, filterStage]);

  // ── Assign-to-team handlers ───────────────────────────────────────────────
  const openAssignModal = async (task: EnhancedTask) => {
    setAssignTask(task); setSelectedTeam([]); setAssignError('');
    if (teamMembers.length === 0) {
      setTeamLoading(true);
      try { setTeamMembers(await getMyTeam(apiBase)); }
      catch { setAssignError('Failed to load team members.'); }
      finally { setTeamLoading(false); }
    }
  };

  const toggleTeamMember = (uid: number) =>
    setSelectedTeam(prev => prev.includes(uid) ? prev.filter(x => x !== uid) : [...prev, uid]);

  const handleAssignToTeam = async () => {
    if (!assignTask || selectedTeam.length === 0) return;
    setAssigning(true); setAssignError('');
    try {
      await assignToTeam(assignTask.id, selectedTeam);
      setAssignTask(null); setSelectedTeam([]); load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to assign.';
      setAssignError(msg);
    } finally { setAssigning(false); }
  };

  // ── Manager review handlers ───────────────────────────────────────────────
  const openReviewModal = (task: EnhancedTask, dec: 'approved' | 'rejected' = 'approved') => {
    setReviewTask(task); setDecision(dec); setFeedback(''); setReviewError('');
  };

  const handleManagerReview = async () => {
    if (!reviewTask) return;
    setReviewing(true); setReviewError('');
    try {
      await managerReviewTask(reviewTask.id, decision, feedback || undefined);
      setReviewTask(null); setFeedback(''); load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Review failed.';
      setReviewError(msg);
    } finally { setReviewing(false); }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const activeCount    = tasks.filter(t => ['pending_team','pending_manager'].includes(t.workflow_stage ?? '')).length;
  const reviewCount    = tasks.filter(t => ['pending_manager_review','pending_admin_review'].includes(t.workflow_stage ?? '')).length;
  const completedCount = tasks.filter(t => t.workflow_stage === 'completed').length;
  const rejectedCount  = tasks.filter(t => t.workflow_stage === 'rejected_to_manager').length;

  return (
    <div>
      <PageHeader
        title={isManager ? 'Tasks' : 'My Tasks'}
        subtitle={`${total} task${total !== 1 ? 's' : ''}`}
      />

      {/* Stats row */}
      <div className="mt-stat-row">
        <div className="mt-stat pending">
          <span className="mt-stat-num">{activeCount}</span>
          <span className="mt-stat-lbl">Active</span>
        </div>
        <div className="mt-stat submitted">
          <span className="mt-stat-num">{reviewCount}</span>
          <span className="mt-stat-lbl">In Review</span>
        </div>
        <div className="mt-stat approved">
          <span className="mt-stat-num">{completedCount}</span>
          <span className="mt-stat-lbl">Completed</span>
        </div>
        <div className="mt-stat rejected">
          <span className="mt-stat-num">{rejectedCount}</span>
          <span className="mt-stat-lbl">Returned</span>
        </div>
      </div>

      {/* Manager tabs */}
      {isManager && (
        <div className="mt-tabs">
          <button
            className={`mt-tab ${tab === 'received' ? 'active' : ''}`}
            onClick={() => setTab('received')}
          >
            <Inbox size={14} /> From Admin
            {tab !== 'received' && tasks.filter(t => t.workflow_stage === 'pending_manager').length > 0 && (
              <span className="mt-tab-badge">{tasks.filter(t => t.workflow_stage === 'pending_manager').length}</span>
            )}
          </button>
          <button
            className={`mt-tab ${tab === 'given' ? 'active' : ''}`}
            onClick={() => setTab('given')}
          >
            <Users size={14} /> Team Tasks
            {tab !== 'given' && (
              <span className="mt-tab-badge" style={{ background: 'transparent', color: '#9ab09a' }}></span>
            )}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mt-filters">
        <div className="atm-search-box" style={{ flex: 1, maxWidth: 300 }}>
          <Search size={14} className="atm-search-icon" />
          <input className="atm-search-input" placeholder="Search tasks…"
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') load(); }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={13} style={{ color: '#9ab09a' }} />
          <select className="atm-select" value={filterStage} onChange={e => setFilterStage(e.target.value)}>
            <option value="">All Stages</option>
            {isManager && tab === 'received' && (
              <>
                <option value="pending_manager">Awaiting My Action</option>
                <option value="pending_admin_review">Sent to Admin</option>
                <option value="rejected_to_manager">Returned</option>
                <option value="completed">Completed</option>
              </>
            )}
            {isManager && tab === 'given' && (
              <>
                <option value="pending_team">In Progress</option>
                <option value="pending_manager_review">Needs My Review</option>
                <option value="pending_admin_review">Sent to Admin</option>
                <option value="completed">Completed</option>
              </>
            )}
            {!isManager && (
              <>
                <option value="pending_team">In Progress</option>
                <option value="pending_manager_review">Submitted</option>
                <option value="completed">Completed</option>
                <option value="rejected_to_manager">Rejected</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Task list */}
      {loading ? <LoadingSpinner message="Loading tasks…" /> : error ? (
        <div className="page-error"><AlertCircle size={16} />{error}</div>
      ) : tasks.length === 0 ? (
        <div className="mt-empty">
          <ClipboardList size={42} />
          <p>
            {isManager && tab === 'received' ? 'No tasks from Admin yet.' :
             isManager && tab === 'given'    ? 'No team tasks yet.' :
             'No tasks assigned to you yet.'}
          </p>
          <span>
            {isManager && tab === 'received' ? 'Tasks assigned by the Admin will appear here.' :
             isManager && tab === 'given'    ? 'Tasks you assign to your team will appear here.' :
             'Tasks assigned by your manager will appear here.'}
          </span>
        </div>
      ) : (
        <div className="mt-task-list">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              roleSlug={roleSlug}
              onAssignToTeam={isManager && tab === 'received' ? openAssignModal : undefined}
              onReview={isManager && tab === 'given' ? openReviewModal : undefined}
            />
          ))}
        </div>
      )}

      {/* ── Assign to Team Modal ── */}
      {assignTask && (
        <div className="atd-modal-overlay" onClick={e => e.target === e.currentTarget && setAssignTask(null)}>
          <div className="atd-modal" role="dialog" style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3 className="atd-modal-title"><UserPlus size={18} className="icon-green" /> Assign to Team</h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ab09a' }} onClick={() => setAssignTask(null)}><X size={18} /></button>
            </div>
            <p className="atd-modal-sub" style={{ marginBottom: '0.75rem' }}>
              Task: <strong>{assignTask.title}</strong>
            </p>
            {assignError && <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}>{assignError}</div>}
            {teamLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
                <Loader2 size={22} className="spin" style={{ color: '#2D5016' }} />
              </div>
            ) : teamMembers.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#9ab09a', textAlign: 'center', padding: '1rem' }}>
                No team members found.
              </p>
            ) : (
              <div className="atm-staff-grid" style={{ maxHeight: 240 }}>
                {teamMembers.map(m => {
                  const sel = selectedTeam.includes(m.users_id);
                  return (
                    <button key={m.users_id} type="button"
                      className={`atm-staff-chip ${sel ? 'selected' : ''}`}
                      onClick={() => toggleTeamMember(m.users_id)}>
                      <span className="chip-avatar">{m.first_name[0]}{m.last_name[0]}</span>
                      <span className="chip-name">{m.first_name} {m.last_name}</span>
                      {m.role_name && <span className="chip-role">{m.role_name}</span>}
                      {sel && <CheckCircle size={12} className="chip-check" />}
                    </button>
                  );
                })}
              </div>
            )}
            {selectedTeam.length > 0 && (
              <p style={{ fontSize: '0.78rem', color: '#2D5016', fontWeight: 600, margin: '0.5rem 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users size={13} /> {selectedTeam.length} member{selectedTeam.length !== 1 ? 's' : ''} selected
              </p>
            )}
            <div className="atd-modal-actions" style={{ marginTop: '1rem' }}>
              <button className="btn-approve" onClick={handleAssignToTeam}
                disabled={assigning || selectedTeam.length === 0}>
                {assigning ? <Loader2 size={14} className="spin" /> : <SendIcon size={14} />}
                Assign {selectedTeam.length > 0 ? `(${selectedTeam.length})` : ''}
              </button>
              <button className="btn-secondary" onClick={() => setAssignTask(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Manager Review Modal ── */}
      {reviewTask && (
        <div className="atd-modal-overlay" onClick={e => e.target === e.currentTarget && setReviewTask(null)}>
          <div className="atd-modal" role="dialog">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3 className="atd-modal-title">
                {decision === 'approved'
                  ? <><CheckCircle size={18} className="icon-green" /> Approve Submission</>
                  : <><XCircle size={18} className="icon-red" /> Reject Submission</>
                }
              </h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ab09a' }} onClick={() => setReviewTask(null)}><X size={18} /></button>
            </div>
            <p className="atd-modal-sub" style={{ marginBottom: '1rem' }}>
              Task: <strong>{reviewTask.title}</strong>
            </p>

            {/* Decision toggle */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                className={decision === 'approved' ? 'btn-approve' : 'btn-secondary'}
                onClick={() => setDecision('approved')} style={{ flex: 1 }}>
                <CheckCircle size={13} /> Approve
              </button>
              <button
                className={decision === 'rejected' ? 'btn-reject' : 'btn-secondary'}
                onClick={() => setDecision('rejected')} style={{ flex: 1 }}>
                <XCircle size={13} /> Reject
              </button>
            </div>

            {reviewError && <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}>{reviewError}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2D5016', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Feedback {decision === 'rejected' ? '(required)' : '(optional)'}
              </label>
              <textarea rows={3}
                style={{ border: '1.5px solid #d4e4d4', borderRadius: 9, padding: '0.6rem 0.85rem', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical' }}
                value={feedback} onChange={e => setFeedback(e.target.value)}
                placeholder={decision === 'approved' ? 'Great work! …' : 'Please revise: …'}
              />
            </div>
            <div className="atd-modal-actions" style={{ marginTop: '1rem' }}>
              <button
                className={decision === 'approved' ? 'btn-approve' : 'btn-reject'}
                onClick={handleManagerReview}
                disabled={reviewing || (decision === 'rejected' && !feedback.trim())}
              >
                {reviewing
                  ? <Loader2 size={14} className="spin" />
                  : decision === 'approved' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {decision === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
              <button className="btn-secondary" onClick={() => setReviewTask(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
