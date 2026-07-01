import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, Calendar, AlertCircle, Eye, ArrowRight, Search, Filter,
  UserPlus, CheckCircle, XCircle, Users, Loader2, X, Inbox, Send as SendIcon,
  Plus, Clock, User, Paperclip, BookOpen, AlignLeft, FileText,
} from 'lucide-react';
import { getTasks, assignToTeam, managerReviewTask, createTask, getTask, removeAssignee, uploadTaskFiles } from '../../api/tasks';
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
        {task.assignee_names && (
          <div className="mt-task-meta" style={{ marginTop: '0.3rem', flexWrap: 'wrap', gap: '0.35rem' }}>
            <User size={12} style={{ color: '#6a8c6a', flexShrink: 0 }} />
            {task.assignee_names.split('|').map((name, i) => (
              <span key={i} style={{ fontSize: '0.74rem', background: '#f0f7ee', border: '1px solid #c4ddc4', borderRadius: 6, padding: '1px 7px', color: '#2D5016', fontWeight: 500 }}>
                {name.trim()}
              </span>
            ))}
            {(task.assignee_count ?? 0) > task.assignee_names.split('|').length && (
              <span style={{ fontSize: '0.72rem', color: '#9ab09a' }}>+{(task.assignee_count ?? 0) - task.assignee_names.split('|').length} more</span>
            )}
          </div>
        )}
      </div>
      <div className="mt-task-actions">
        {onAssignToTeam && ['pending_manager', 'pending_team', 'rejected_to_manager'].includes(stage ?? '') && (
          <button className="mt-action-btn mt-action-assign" onClick={() => onAssignToTeam(task)}>
            <UserPlus size={13} /> {stage === 'pending_manager' ? 'Assign to Team' : 'Manage Team'}
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
  const [assignTask,          setAssignTask]          = useState<EnhancedTask | null>(null);
  const [teamMembers,         setTeamMembers]         = useState<TeamMember[]>([]);
  const [teamLoading,         setTeamLoading]         = useState(false);
  const [selectedTeam,        setSelectedTeam]        = useState<number[]>([]);
  const [assigning,           setAssigning]           = useState(false);
  const [assignError,         setAssignError]         = useState('');
  const [existingAssigneeIds, setExistingAssigneeIds] = useState<number[]>([]);

  // ── Manager Review modal ──────────────────────────────────────────────────
  const [reviewTask,   setReviewTask]   = useState<EnhancedTask | null>(null);
  const [decision,     setDecision]     = useState<'approved' | 'rejected'>('approved');
  const [feedback,     setFeedback]     = useState('');
  const [reviewing,    setReviewing]    = useState(false);
  const [reviewError,  setReviewError]  = useState('');

  // ── Create Task modal (managers only) ─────────────────────────────────────
  const [showCreate,    setShowCreate]    = useState(false);
  const [cTitle,        setCTitle]        = useState('');
  const [cDescription,  setCDescription]  = useState('');
  const [cPriority,     setCPriority]     = useState<TaskPriority>('medium');
  const [cInstructions, setCInstructions] = useState('');
  const [cDeadline,     setCDeadline]     = useState('');
  const [cDeadlineTime, setCDeadlineTime] = useState('');
  const [cAssignees,    setCAssignees]    = useState<number[]>([]);
  const [cAttachments,  setCAttachments]  = useState<FileList | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError,   setCreateError]   = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

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
    setAssignTask(task); setSelectedTeam([]); setAssignError(''); setExistingAssigneeIds([]);
    setTeamLoading(true);
    try {
      const [teamData, taskDetail] = await Promise.all([
        teamMembers.length > 0 ? Promise.resolve(teamMembers) : getMyTeam(apiBase),
        getTask(task.id),
      ]);
      if (teamMembers.length === 0) setTeamMembers(teamData);
      const alreadyAssigned = (taskDetail.assignees ?? [])
        .filter(a => a.assigned_by_role === 'manager')
        .map(a => a.users_id);
      setExistingAssigneeIds(alreadyAssigned);
      setSelectedTeam(alreadyAssigned); // pre-select existing assignees
    } catch { setAssignError('Failed to load team members.'); }
    finally { setTeamLoading(false); }
  };

  const toggleTeamMember = (uid: number) =>
    setSelectedTeam(prev => prev.includes(uid) ? prev.filter(x => x !== uid) : [...prev, uid]);

  const handleAssignToTeam = async () => {
    if (!assignTask) return;
    const toAdd    = selectedTeam.filter(uid => !existingAssigneeIds.includes(uid));
    const toRemove = existingAssigneeIds.filter(uid => !selectedTeam.includes(uid));
    if (toAdd.length === 0 && toRemove.length === 0) { setAssignTask(null); return; }
    setAssigning(true); setAssignError('');
    try {
      if (toAdd.length > 0) await assignToTeam(assignTask.id, toAdd);
      for (const uid of toRemove) await removeAssignee(assignTask.id, uid);
      setAssignTask(null); setSelectedTeam([]); load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update assignment.';
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

  // ── Create task handlers (managers only) ─────────────────────────────────
  const resetCreate = () => {
    setCTitle(''); setCDescription(''); setCPriority('medium');
    setCInstructions(''); setCDeadline(''); setCDeadlineTime('');
    setCAssignees([]); setCAttachments(null); setCreateError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const openCreate = async () => {
    resetCreate(); setShowCreate(true);
    if (teamMembers.length === 0) {
      setTeamLoading(true);
      try { setTeamMembers(await getMyTeam(apiBase)); }
      catch { /* ignore */ }
      finally { setTeamLoading(false); }
    }
  };

  const handleCreate = async () => {
    if (!cTitle.trim()) { setCreateError('Title is required.'); return; }
    setCreateLoading(true); setCreateError('');
    try {
      const res = await createTask({
        title: cTitle.trim(),
        description: cDescription.trim() || undefined,
        priority: cPriority,
        instructions: cInstructions.trim() || undefined,
        deadline: cDeadline || undefined,
        deadline_time: cDeadlineTime || undefined,
        assign_to: cAssignees,
      });
      if (cAttachments && cAttachments.length > 0 && res.task_id) {
        await uploadTaskFiles(res.task_id, Array.from(cAttachments), 'attachment');
      }
      setShowCreate(false);
      resetCreate();
      if (tab !== 'given') setTab('given');
      else load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create task.';
      setCreateError(msg);
    } finally { setCreateLoading(false); }
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
        actions={isManager ? (
          <button className="btn-primary" onClick={() => showCreate ? (setShowCreate(false), resetCreate()) : openCreate()}>
            {showCreate ? <><X size={15} /> Cancel</> : <><Plus size={15} /> New Task</>}
          </button>
        ) : undefined}
      />

      {/* ── Create task panel (managers only) ── */}
      {showCreate && isManager && (
        <div className="atm-panel">
          <div className="atm-panel-header">
            <div className="atm-panel-header-left">
              <div className="atm-panel-icon"><ClipboardList size={19} /></div>
              <div>
                <h3 className="atm-panel-title">Create New Task</h3>
                <p className="atm-panel-sub">This task is internal to your department — you are the final approver</p>
              </div>
            </div>
            <button className="atm-panel-close" onClick={() => { setShowCreate(false); resetCreate(); }} type="button"><X size={18} /></button>
          </div>
          <div className="atm-panel-body">
            {createError && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={14} /> {createError}
              </div>
            )}
            <form onSubmit={e => { e.preventDefault(); handleCreate(); }}>
              <div className="atm-field-grid">

                <div className="atm-field atm-field-full">
                  <label className="atm-flabel"><FileText size={12} /> Task Title *</label>
                  <input className="atm-finput" value={cTitle}
                    onChange={e => { setCTitle(e.target.value); setCreateError(''); }}
                    placeholder="e.g. Prepare quarterly report" disabled={createLoading} />
                </div>

                <div className="atm-field atm-field-full">
                  <label className="atm-flabel">Priority Level</label>
                  <div className="atm-priority-pills">
                    {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map(p => (
                      <button key={p} type="button"
                        className={`atm-priority-pill atm-p-${p}${cPriority === p ? ' active' : ''}`}
                        onClick={() => setCPriority(p)} disabled={createLoading}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="atm-field">
                  <label className="atm-flabel"><Calendar size={12} /> Due Date</label>
                  <input type="date" className="atm-finput" value={cDeadline}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setCDeadline(e.target.value)} disabled={createLoading} />
                </div>
                <div className="atm-field">
                  <label className="atm-flabel"><Clock size={12} /> Due Time <span className="atm-flabel-opt">(optional)</span></label>
                  <input type="time" className="atm-finput" value={cDeadlineTime}
                    onChange={e => setCDeadlineTime(e.target.value)} disabled={createLoading} />
                </div>

                <div className="atm-field atm-field-full">
                  <label className="atm-flabel"><AlignLeft size={12} /> Description</label>
                  <textarea className="atm-finput atm-ftextarea" rows={2} value={cDescription}
                    onChange={e => setCDescription(e.target.value)}
                    placeholder="Brief overview of what this task is about…" disabled={createLoading} />
                </div>

                <div className="atm-field atm-field-full">
                  <label className="atm-flabel"><BookOpen size={12} /> Instructions / Details</label>
                  <textarea className="atm-finput atm-ftextarea" rows={3} value={cInstructions}
                    onChange={e => setCInstructions(e.target.value)}
                    placeholder="Step-by-step instructions for the assignee…" disabled={createLoading} />
                </div>

                <div className="atm-field atm-field-full">
                  <label className="atm-flabel"><UserPlus size={12} /> Assign to Team Member</label>
                  <div className="atm-staff-grid">
                    {teamLoading
                      ? <p style={{ fontSize: '0.8rem', color: '#9ab09a', margin: 0 }}>Loading team…</p>
                      : teamMembers.length === 0
                        ? <p style={{ fontSize: '0.8rem', color: '#9ab09a', margin: 0 }}>No team members found.</p>
                        : teamMembers.map(m => {
                            const sel = cAssignees.includes(m.users_id);
                            return (
                              <button key={m.users_id} type="button"
                                className={`atm-staff-chip${sel ? ' selected' : ''}`}
                                onClick={() => setCAssignees(prev => prev.includes(m.users_id) ? prev.filter(x => x !== m.users_id) : [...prev, m.users_id])}
                                disabled={createLoading}>
                                <span className="chip-avatar">{m.first_name[0]}{m.last_name[0]}</span>
                                <span className="chip-name">{m.first_name} {m.last_name}</span>
                                {m.role_name && <span className="chip-role">{m.role_name}</span>}
                                {sel && <CheckCircle size={13} className="chip-check" />}
                              </button>
                            );
                          })
                    }
                  </div>
                  {cAssignees.length > 0 && (
                    <p className="atm-assign-count">
                      <Users size={13} /> {cAssignees.length} member{cAssignees.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>

                <div className="atm-field atm-field-full">
                  <label className="atm-flabel"><Paperclip size={12} /> Attach Files <span className="atm-flabel-opt">(optional)</span></label>
                  <input ref={fileRef} type="file" multiple className="atm-finput"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt,.zip"
                    onChange={e => setCAttachments(e.target.files)}
                    disabled={createLoading}
                    style={{ padding: '0.45rem 0.75rem', cursor: 'pointer' }} />
                  {cAttachments && cAttachments.length > 0 && (
                    <p style={{ fontSize: '0.78rem', color: '#2D5016', margin: '0.3rem 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Paperclip size={12} /> {cAttachments.length} file{cAttachments.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>

              </div>

              <div className="atm-panel-footer">
                <button type="submit" className="atm-submit-btn" disabled={createLoading}>
                  {createLoading
                    ? <><Loader2 size={15} className="spin" /> Creating…</>
                    : <><CheckCircle size={15} /> Create &amp; Assign</>
                  }
                </button>
                <button type="button" className="atm-cancel-btn" onClick={() => { setShowCreate(false); resetCreate(); }} disabled={createLoading}>
                  <X size={15} /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <h3 className="atd-modal-title"><UserPlus size={18} className="icon-green" /> {existingAssigneeIds.length > 0 ? 'Manage Team Assignment' : 'Assign to Team'}</h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ab09a' }} onClick={() => setAssignTask(null)}><X size={18} /></button>
            </div>
            <p className="atd-modal-sub" style={{ marginBottom: '0.75rem' }}>
              Task: <strong>{assignTask.title}</strong>
            </p>
            {assignError && <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}>{assignError}</div>}
            {existingAssigneeIds.length > 0 && (
              <p style={{ fontSize: '0.78rem', color: '#6a8c6a', margin: '0 0 0.6rem', background: '#f0f7ee', padding: '5px 10px', borderRadius: 6, border: '1px solid #c4ddc4' }}>
                Tick to keep assigned · Untick to remove · Add new members below
              </p>
            )}
            {teamLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
                <Loader2 size={22} className="spin" style={{ color: '#2D5016' }} />
              </div>
            ) : teamMembers.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#9ab09a', textAlign: 'center', padding: '1rem' }}>
                No team members found.
              </p>
            ) : (
              <div className="atm-staff-grid" style={{ maxHeight: 260 }}>
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
            {(() => {
              const toAdd    = selectedTeam.filter(uid => !existingAssigneeIds.includes(uid));
              const toRemove = existingAssigneeIds.filter(uid => !selectedTeam.includes(uid));
              return (toAdd.length > 0 || toRemove.length > 0) ? (
                <p style={{ fontSize: '0.78rem', color: '#2D5016', fontWeight: 600, margin: '0.5rem 0 0', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {toAdd.length > 0 && <span style={{ color: '#2D5016' }}>+{toAdd.length} to add</span>}
                  {toRemove.length > 0 && <span style={{ color: '#c0392b' }}>−{toRemove.length} to remove</span>}
                </p>
              ) : null;
            })()}
            <div className="atd-modal-actions" style={{ marginTop: '1rem' }}>
              {(() => {
                const toAdd    = selectedTeam.filter(uid => !existingAssigneeIds.includes(uid));
                const toRemove = existingAssigneeIds.filter(uid => !selectedTeam.includes(uid));
                const hasChanges = toAdd.length > 0 || toRemove.length > 0;
                return (
                  <button className="btn-approve" onClick={handleAssignToTeam} disabled={assigning || !hasChanges}>
                    {assigning ? <Loader2 size={14} className="spin" /> : <SendIcon size={14} />}
                    {existingAssigneeIds.length > 0 ? 'Save Changes' : `Assign${selectedTeam.length > 0 ? ` (${selectedTeam.length})` : ''}`}
                  </button>
                );
              })()}
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
