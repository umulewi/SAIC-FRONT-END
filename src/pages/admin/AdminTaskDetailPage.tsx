import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, XCircle, MessageSquare, Paperclip, Users,
  Clock, Calendar, AlertCircle, Download, Loader2, Send, UserPlus,
  FileText, Image, FileSpreadsheet, Archive, Trash2, Pencil, X,
  CalendarClock, History, ShieldCheck,
} from 'lucide-react';
import {
  getTask, updateTask, reviewTask, addComment, assignTask,
  removeAssignee, uploadTaskFiles, extendDeadline,
} from '../../api/tasks';
import { adminGetStaff } from '../../api/role';
import type { EnhancedTask, TaskPriority, TaskAssignment, StaffMember, DeadlineExtension } from '../../types';
import { WORKFLOW_LABELS, WORKFLOW_BADGE } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../shared/SharedPages.css';
import './AdminTasksPage.css';
import './AdminTaskDetailPage.css';

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'badge-low', medium: 'badge-medium', high: 'badge-high', urgent: 'badge-urgent',
};

function fmtDate(d?: string, withTime = false) {
  if (!d) return '—';
  const opts: Intl.DateTimeFormatOptions = withTime
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' };
  return new Date(d).toLocaleString('en-GB', opts);
}

function fileIcon(mime?: string) {
  if (!mime) return <FileText size={16} />;
  if (mime.startsWith('image/')) return <Image size={16} />;
  if (mime.includes('sheet') || mime.includes('excel')) return <FileSpreadsheet size={16} />;
  if (mime.includes('zip')) return <Archive size={16} />;
  return <FileText size={16} />;
}

function fmtSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024)    return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function AdminTaskDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const nav     = useNavigate();
  const taskId  = parseInt(id ?? '0', 10);

  const [task,    setTask]    = useState<EnhancedTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // ── Admin final review panel ──────────────────────────────────────────────
  const [reviewOpen,   setReviewOpen]   = useState(false);
  const [reviewTarget, setReviewTarget] = useState<TaskAssignment | null>(null);
  const [decision,     setDecision]     = useState<'approved' | 'rejected'>('approved');
  const [feedback,     setFeedback]     = useState('');
  const [reviewing,    setReviewing]    = useState(false);
  const [reviewError,  setReviewError]  = useState('');

  // ── Comment ───────────────────────────────────────────────────────────────
  const [comment,    setComment]    = useState('');
  const [commenting, setCommenting] = useState(false);

  // ── Assign extra managers ─────────────────────────────────────────────────
  const [assignOpen,   setAssignOpen]   = useState(false);
  const [staff,        setStaff]        = useState<StaffMember[]>([]);
  const [newAssignees, setNewAssignees] = useState<number[]>([]);
  const [assigning,    setAssigning]    = useState(false);

  // ── File upload ───────────────────────────────────────────────────────────
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [uploading,   setUploading]   = useState(false);

  // ── Edit panel ────────────────────────────────────────────────────────────
  const [editOpen,         setEditOpen]         = useState(false);
  const [editTitle,        setEditTitle]        = useState('');
  const [editDesc,         setEditDesc]         = useState('');
  const [editPriority,     setEditPriority]     = useState<TaskPriority>('medium');
  const [editInstructions, setEditInstructions] = useState('');
  const [editDeadline,     setEditDeadline]     = useState('');
  const [editDeadlineTime, setEditDeadlineTime] = useState('');
  const [editAssignees,    setEditAssignees]    = useState<number[]>([]);
  const [editStaff,        setEditStaff]        = useState<StaffMember[]>([]);
  const [saving,           setSaving]           = useState(false);
  const [editError,        setEditError]        = useState('');

  // ── Extend deadline modal ─────────────────────────────────────────────────
  const [extendOpen,      setExtendOpen]      = useState(false);
  const [newDeadline,     setNewDeadline]     = useState('');
  const [newDeadlineTime, setNewDeadlineTime] = useState('');
  const [extendReason,    setExtendReason]    = useState('');
  const [extending,       setExtending]       = useState(false);
  const [extendError,     setExtendError]     = useState('');

  // ── Extension history toggle ──────────────────────────────────────────────
  const [showHistory, setShowHistory] = useState(false);

  const reload = async () => {
    setLoading(true); setError('');
    try { setTask(await getTask(taskId)); }
    catch { setError('Failed to load task.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { reload(); }, [taskId]);

  const openReview = (asgn: TaskAssignment, dec: 'approved' | 'rejected') => {
    setReviewTarget(asgn); setDecision(dec); setFeedback('');
    setReviewError(''); setReviewOpen(true);
  };

  const handleReview = async () => {
    setReviewing(true); setReviewError('');
    try {
      await reviewTask(taskId, decision, feedback, reviewTarget?.assignment_id);
      setReviewOpen(false); setReviewTarget(null); setFeedback('');
      reload();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Review failed.';
      setReviewError(msg);
    } finally { setReviewing(false); }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setCommenting(true);
    try { await addComment(taskId, comment.trim()); setComment(''); reload(); }
    catch { /* silent */ }
    finally { setCommenting(false); }
  };

  const openAssign = async () => {
    setAssignOpen(true); setNewAssignees([]);
    if (staff.length === 0) {
      try { setStaff(await adminGetStaff()); } catch { /* ignore */ }
    }
  };

  const toggleNewAssignee = (uid: number) =>
    setNewAssignees(prev => prev.includes(uid) ? prev.filter(x => x !== uid) : [...prev, uid]);

  const handleAssign = async () => {
    if (newAssignees.length === 0) return;
    setAssigning(true);
    try { await assignTask(taskId, newAssignees); setAssignOpen(false); reload(); }
    catch { /* silent */ }
    finally { setAssigning(false); }
  };

  const handleRemoveAssignee = async (userId: number) => {
    if (!confirm('Remove this assignee?')) return;
    try { await removeAssignee(taskId, userId); reload(); }
    catch { /* silent */ }
  };

  const handleUpload = async () => {
    if (!uploadFiles?.length) return;
    setUploading(true);
    try { await uploadTaskFiles(taskId, Array.from(uploadFiles), 'attachment'); setUploadFiles(null); reload(); }
    catch { /* silent */ }
    finally { setUploading(false); }
  };

  const openEdit = async () => {
    if (!task) return;
    setEditTitle(task.title);
    setEditDesc(task.description ?? '');
    setEditPriority(task.priority);
    setEditInstructions(task.instructions ?? '');
    setEditDeadline(task.deadline ? task.deadline.slice(0, 10) : '');
    setEditDeadlineTime(task.deadline_time ?? '');
    setEditAssignees((task.assignees ?? []).filter(a => a.assigned_by_role === 'admin').map(a => a.users_id));
    setEditError('');
    setEditOpen(true);
    if (editStaff.length === 0) {
      try { setEditStaff(await adminGetStaff()); } catch { /* ignore */ }
    }
  };

  const toggleEditAssignee = (uid: number) =>
    setEditAssignees(prev => prev.includes(uid) ? prev.filter(x => x !== uid) : [...prev, uid]);

  const handleEditSave = async () => {
    if (!editTitle.trim()) { setEditError('Title is required.'); return; }
    setSaving(true); setEditError('');
    try {
      await updateTask(taskId, {
        title: editTitle.trim(),
        description: editDesc.trim() || undefined,
        priority: editPriority,
        instructions: editInstructions.trim() || undefined,
        deadline: editDeadline || undefined,
        deadline_time: editDeadlineTime || undefined,
      });

      const currentIds = new Set(
        (task!.assignees ?? []).filter(a => a.assigned_by_role === 'admin').map(a => a.users_id)
      );
      const toAdd    = editAssignees.filter(uid => !currentIds.has(uid));
      const toRemove = [...currentIds].filter(uid => !editAssignees.includes(uid));
      if (toAdd.length > 0) await assignTask(taskId, toAdd);
      for (const uid of toRemove) await removeAssignee(taskId, uid);

      setEditOpen(false); reload();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Save failed.';
      setEditError(msg);
    } finally { setSaving(false); }
  };

  const openExtend = () => {
    if (!task) return;
    setNewDeadline(task.deadline ? task.deadline.slice(0, 10) : '');
    setNewDeadlineTime(task.deadline_time ?? '');
    setExtendReason('');
    setExtendError('');
    setExtendOpen(true);
  };

  const handleExtend = async () => {
    if (!newDeadline) { setExtendError('New deadline date is required.'); return; }
    setExtending(true); setExtendError('');
    try {
      await extendDeadline(taskId, newDeadline, extendReason || undefined, newDeadlineTime || undefined);
      setExtendOpen(false); reload();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to extend deadline.';
      setExtendError(msg);
    } finally { setExtending(false); }
  };

  if (loading) return <LoadingSpinner message="Loading task…" />;
  if (error || !task) return (
    <div className="page-error">
      <AlertCircle size={20} /> {error || 'Task not found.'}
      <button className="btn-secondary" onClick={() => nav(-1)} style={{ marginTop: '1rem' }}>
        <ArrowLeft size={14} /> Back
      </button>
    </div>
  );

  const stage            = task.workflow_stage;
  const stageBadge       = stage ? WORKFLOW_BADGE[stage] : 'badge-draft';
  const stageLabel       = stage ? WORKFLOW_LABELS[stage] : task.status.replace('_', ' ');
  const isTeamOnly       = task.scope === 'team_only';
  const needsAdminReview = stage === 'pending_admin_review' && !isTeamOnly;

  const adminAssignees = (task.assignees ?? []).filter(a => a.assigned_by_role === 'admin');
  const teamAssignees  = (task.assignees ?? []).filter(a => a.assigned_by_role === 'manager');
  const otherAssignees = (task.assignees ?? []).filter(a => !a.assigned_by_role);
  const assignedIds    = (task.assignees ?? []).map(a => a.users_id);
  const extensions     = task.deadline_extensions ?? [];

  return (
    <div className="atd-root">

      {/* ── Header ── */}
      <div className="atd-topbar">
        <button className="atd-back-btn" onClick={() => nav('/dashboard/admin/tasks')}>
          <ArrowLeft size={16} /> All Tasks
        </button>
        {!isTeamOnly && (
          <div className="atd-topbar-actions">
            <button className="btn-secondary" onClick={openEdit}>
              <Pencil size={14} /> Edit Task
            </button>
            <button className="btn-secondary" onClick={openExtend}>
              <CalendarClock size={14} /> Extend Deadline
            </button>
          </div>
        )}
      </div>

      {/* ── Edit Task Inline Panel ── */}
      {editOpen && (
        <div className="atm-drawer" style={{ marginBottom: '1rem' }}>
          <div className="atm-drawer-head">
            <h3 className="atm-drawer-title"><Pencil size={16} /> Edit Task</h3>
            <button className="atm-close-btn" onClick={() => setEditOpen(false)}><X size={18} /></button>
          </div>
          {editError && <div className="alert alert-error"><AlertCircle size={14} />{editError}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="atm-form-row">
              <div className="form-group">
                <label>Title *</label>
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} disabled={saving} placeholder="Task title" />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={editPriority} onChange={e => setEditPriority(e.target.value as TaskPriority)} disabled={saving}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={2} value={editDesc} onChange={e => setEditDesc(e.target.value)} disabled={saving} placeholder="Brief overview" />
            </div>
            <div className="form-group">
              <label>Instructions / Details</label>
              <textarea rows={3} value={editInstructions} onChange={e => setEditInstructions(e.target.value)} disabled={saving} />
            </div>
            <div className="atm-form-row">
              <div className="form-group">
                <label><Calendar size={13} /> Due Date</label>
                <input type="date" value={editDeadline}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setEditDeadline(e.target.value)} disabled={saving} />
              </div>
              <div className="form-group">
                <label><Clock size={13} /> Due Time</label>
                <input type="time" value={editDeadlineTime} onChange={e => setEditDeadlineTime(e.target.value)} disabled={saving} />
              </div>
            </div>
            <div className="form-group">
              <label><Users size={13} /> Assigned Managers</label>
              <div className="atm-staff-grid">
                {editStaff.filter(s => (s.role_name ?? '').endsWith('Manager')).map(s => {
                  const sel = editAssignees.includes(s.users_id);
                  return (
                    <button key={s.users_id} type="button"
                      className={`atm-staff-chip ${sel ? 'selected' : ''}`}
                      onClick={() => toggleEditAssignee(s.users_id)} disabled={saving}>
                      <span className="chip-avatar">{s.first_name[0]}{s.last_name[0]}</span>
                      <span className="chip-name">{s.first_name} {s.last_name}</span>
                      <span className="chip-role">{s.role_name ?? ''}</span>
                      {sel && <CheckCircle size={13} className="chip-check" />}
                    </button>
                  );
                })}
                {editStaff.length === 0 && <p style={{ fontSize: '0.8rem', color: '#9ab09a', margin: 0 }}>Loading staff…</p>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-primary" onClick={handleEditSave} disabled={saving}>
                {saving ? <><Loader2 size={15} className="spin" /> Saving…</> : <><CheckCircle size={15} /> Save Changes</>}
              </button>
              <button className="btn-secondary" onClick={() => setEditOpen(false)} disabled={saving}>
                <X size={15} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main + Sidebar layout ── */}
      <div className="atd-layout">
        <div className="atd-main">

          {/* ── Team task notice ── */}
          {isTeamOnly && (
            <div className="atd-card" style={{ borderLeft: '4px solid #7b5ea7', background: '#faf7ff', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={16} style={{ color: '#7b5ea7', flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: '#5c3d82', fontSize: '0.88rem' }}>Department-Managed Task</p>
                  <p style={{ margin: '0.15rem 0 0', color: '#7b5ea7', fontSize: '0.82rem' }}>
                    This task was created by a department manager for their team. The manager is the final approver — admin can view progress but cannot approve or reject.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Task info card ── */}
          <div className="atd-card">
            <div className="atd-card-head">
              <h2 className="atd-task-title">{task.title}</h2>
              <div className="atd-badges">
                <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                <span className={`badge ${stageBadge}`}>{stageLabel}</span>
                {isTeamOnly && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7b5ea7', background: '#f3eeff', padding: '2px 8px', borderRadius: 10, border: '1px solid #d4bbff' }}>
                    Team Task
                  </span>
                )}
              </div>
            </div>
            {task.description && <p className="atd-description">{task.description}</p>}
            {task.instructions && (
              <div className="atd-instructions">
                <h4>Instructions</h4>
                <p>{task.instructions}</p>
              </div>
            )}
            <div className="atd-meta-row">
              <span className="atd-meta-item">
                <Calendar size={13} />
                Due: {fmtDate(task.deadline)}
                {task.deadline_time && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={11} /> {task.deadline_time.slice(0, 5)}
                  </span>
                )}
              </span>
              <span className="atd-meta-item"><Clock size={13} /> Created: {fmtDate(task.created_at)}</span>
              {task.creator_email && <span className="atd-meta-item">By: {task.creator_email}</span>}
            </div>
          </div>

          {/* ── Admin Final Review (pending_admin_review only) ── */}
          {needsAdminReview && (
            <div className="atd-card atd-review-card">
              <div className="atd-section-head">
                <h3 style={{ color: '#2D5016', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={16} /> Admin Final Review Required
                </h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#4a5568', margin: '0 0 1rem' }}>
                The department manager has approved this submission. Please complete your final review.
              </p>

              {/* Show submitted team members */}
              {teamAssignees.filter(a => a.assignment_status === 'submitted').map(a => (
                <div key={a.assignment_id} className="atd-assignee-row" style={{ marginBottom: '0.5rem' }}>
                  <div className="atd-assignee-info">
                    <div className="chip-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                      {(a.first_name?.[0] ?? a.email[0]).toUpperCase()}
                      {(a.last_name?.[0] ?? '').toUpperCase()}
                    </div>
                    <div>
                      <p className="atd-name">{a.first_name && a.last_name ? `${a.first_name} ${a.last_name}` : a.email}</p>
                      <p className="atd-sub-text">{a.email}</p>
                      {a.manager_feedback && (
                        <p className="atd-sub-text" style={{ color: '#2D5016' }}>
                          Manager note: {a.manager_feedback}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="atd-assignee-actions">
                    <button className="btn-approve" onClick={() => openReview(a, 'approved')}>
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button className="btn-reject" onClick={() => openReview(a, 'rejected')}>
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </div>
              ))}

              {/* Fallback if no submitted team member found */}
              {teamAssignees.filter(a => a.assignment_status === 'submitted').length === 0 && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn-approve"
                    onClick={() => openReview(teamAssignees[0] ?? adminAssignees[0], 'approved')}>
                    <CheckCircle size={13} /> Final Approve
                  </button>
                  <button className="btn-reject"
                    onClick={() => openReview(teamAssignees[0] ?? adminAssignees[0], 'rejected')}>
                    <XCircle size={13} /> Final Reject
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Assignees ── */}
          <div className="atd-card">
            <div className="atd-section-head">
              <h3><Users size={16} /> Assignees</h3>
              {!isTeamOnly && (
                <button className="btn-secondary" onClick={openAssign}><UserPlus size={13} /> Add Manager</button>
              )}
            </div>

            {assignOpen && (
              <div className="atd-assign-panel">
                <div className="atm-staff-grid">
                  {staff.filter(s => (s.role_name ?? '').endsWith('Manager') && !assignedIds.includes(s.users_id)).map(s => {
                    const sel = newAssignees.includes(s.users_id);
                    return (
                      <button key={s.users_id} type="button"
                        className={`atm-staff-chip ${sel ? 'selected' : ''}`}
                        onClick={() => toggleNewAssignee(s.users_id)}>
                        <span className="chip-avatar">{s.first_name[0]}{s.last_name[0]}</span>
                        <span className="chip-name">{s.first_name} {s.last_name}</span>
                        <span className="chip-role">{s.role_name ?? ''}</span>
                        {sel && <CheckCircle size={12} className="chip-check" />}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button className="btn-primary" onClick={handleAssign} disabled={assigning || newAssignees.length === 0}>
                    {assigning ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                    Assign {newAssignees.length > 0 && `(${newAssignees.length})`}
                  </button>
                  <button className="btn-secondary" onClick={() => setAssignOpen(false)}>Cancel</button>
                </div>
              </div>
            )}

            {/* Admin-assigned managers */}
            {adminAssignees.length > 0 && (
              <>
                <p className="atd-group-label">Department Managers</p>
                {adminAssignees.map(a => (
                  <div key={a.assignment_id} className="atd-assignee-row">
                    <div className="atd-assignee-info">
                      <div className="chip-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                        {(a.first_name?.[0] ?? a.email[0]).toUpperCase()}
                        {(a.last_name?.[0] ?? '').toUpperCase()}
                      </div>
                      <div>
                        <p className="atd-name">{a.first_name && a.last_name ? `${a.first_name} ${a.last_name}` : a.email}</p>
                        <p className="atd-sub-text">{a.email}</p>
                      </div>
                    </div>
                    <span className="badge badge-assigned" style={{ marginLeft: 'auto', marginRight: '0.5rem' }}>Manager</span>
                    <button className="btn-icon-danger" onClick={() => handleRemoveAssignee(a.users_id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </>
            )}

            {/* Manager-assigned team members */}
            {teamAssignees.length > 0 && (
              <>
                <p className="atd-group-label" style={{ marginTop: '0.75rem' }}>Team Members</p>
                {teamAssignees.map(a => (
                  <div key={a.assignment_id} className="atd-assignee-row">
                    <div className="atd-assignee-info">
                      <div className="chip-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                        {(a.first_name?.[0] ?? a.email[0]).toUpperCase()}
                        {(a.last_name?.[0] ?? '').toUpperCase()}
                      </div>
                      <div>
                        <p className="atd-name">{a.first_name && a.last_name ? `${a.first_name} ${a.last_name}` : a.email}</p>
                        <p className="atd-sub-text">{a.email}</p>
                        {a.submitted_at && <span className="atd-sub-text">Submitted {fmtDate(a.submitted_at)}</span>}
                        {a.manager_feedback && <span className="atd-feedback-preview">Mgr note: {a.manager_feedback}</span>}
                        {a.feedback && <span className="atd-feedback-preview">{a.feedback}</span>}
                      </div>
                    </div>
                    <span className={`badge badge-${a.assignment_status === 'submitted' ? 'submitted' : a.assignment_status === 'approved' ? 'approved' : 'inprog'}`}
                      style={{ marginLeft: 'auto' }}>
                      {a.assignment_status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </>
            )}

            {/* Legacy assignments (no role set) */}
            {otherAssignees.length > 0 && (
              <>
                {otherAssignees.map(a => (
                  <div key={a.assignment_id} className="atd-assignee-row">
                    <div className="atd-assignee-info">
                      <div className="chip-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                        {(a.first_name?.[0] ?? a.email[0]).toUpperCase()}
                        {(a.last_name?.[0] ?? '').toUpperCase()}
                      </div>
                      <div>
                        <p className="atd-name">{a.first_name && a.last_name ? `${a.first_name} ${a.last_name}` : a.email}</p>
                        <p className="atd-sub-text">{a.email}</p>
                        {a.submitted_at && <span className="atd-sub-text">Submitted {fmtDate(a.submitted_at)}</span>}
                        {a.feedback && <span className="atd-feedback-preview">{a.feedback}</span>}
                      </div>
                    </div>
                    <span className={`badge badge-${a.assignment_status}`} style={{ marginLeft: 'auto', marginRight: '0.5rem' }}>
                      {a.assignment_status.replace('_', ' ')}
                    </span>
                    <div className="atd-assignee-actions">
                      {a.assignment_status === 'submitted' && !needsAdminReview && (
                        <>
                          <button className="btn-approve" onClick={() => openReview(a, 'approved')}>
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button className="btn-reject" onClick={() => openReview(a, 'rejected')}>
                            <XCircle size={13} /> Reject
                          </button>
                        </>
                      )}
                      <button className="btn-icon-danger" onClick={() => handleRemoveAssignee(a.users_id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {(task.assignees ?? []).length === 0 && (
              <p className="atd-empty-text">No assignees yet.</p>
            )}
          </div>

          {/* ── Comments ── */}
          <div className="atd-card">
            <h3 className="atd-section-title"><MessageSquare size={16} /> Discussion ({task.comments?.length ?? 0})</h3>
            <div className="atd-comments-list">
              {(task.comments ?? []).length === 0 && <p className="atd-empty-text">No comments yet.</p>}
              {(task.comments ?? []).map(c => {
                const isApproval = c.comment.startsWith('[ADMIN APPROVED]') || c.comment.startsWith('[MANAGER APPROVED]');
                const isRejection = c.comment.startsWith('[ADMIN REJECTED]') || c.comment.startsWith('[MANAGER REJECTED]');
                return (
                  <div key={c.id} className={`atd-comment ${isApproval ? 'comment-approved' : isRejection ? 'comment-rejected' : ''}`}>
                    <div className="atd-comment-head">
                      <span className="atd-comment-author">
                        {c.first_name && c.last_name ? `${c.first_name} ${c.last_name}` : c.author_email}
                      </span>
                      <span className="atd-comment-time">{fmtDate(c.created_at, true)}</span>
                    </div>
                    <p className="atd-comment-body">{c.comment}</p>
                  </div>
                );
              })}
            </div>
            <div className="atd-comment-input">
              <textarea rows={2} placeholder="Add a comment or feedback… (Ctrl+Enter to post)"
                value={comment} onChange={e => setComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleComment(); }} />
              <button className="btn-primary" onClick={handleComment} disabled={commenting || !comment.trim()}>
                {commenting ? <Loader2 size={14} className="spin" /> : <Send size={14} />} Post
              </button>
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="atd-sidebar">

          {/* Files */}
          <div className="atd-card">
            <h3 className="atd-section-title"><Paperclip size={15} /> Files ({task.files?.length ?? 0})</h3>
            <div className="atd-files-list">
              {(task.files ?? []).length === 0 && <p className="atd-empty-text">No files attached.</p>}
              {(task.files ?? []).map(f => (
                <a key={f.id} href={`/uploads/${f.file_name}`} download={f.original_name}
                  className="atd-file-row" target="_blank" rel="noreferrer">
                  <span className="atd-file-icon">{fileIcon(f.mime_type)}</span>
                  <span className="atd-file-info">
                    <span className="atd-file-name">{f.original_name}</span>
                    <span className="atd-file-meta">{fmtSize(f.file_size)} · {f.file_type} · {fmtDate(f.uploaded_at)}</span>
                  </span>
                  <Download size={13} className="atd-file-dl" />
                </a>
              ))}
            </div>
            <div className="atd-upload-area">
              <input type="file" id="atd-file-input" multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.zip"
                style={{ display: 'none' }}
                onChange={e => setUploadFiles(e.target.files)} />
              <label htmlFor="atd-file-input" className="atd-upload-label">
                <Paperclip size={13} /> Choose files
              </label>
              {uploadFiles && uploadFiles.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#6a8c6a' }}>{uploadFiles.length} file(s) selected</span>
                  <button className="btn-primary" style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem' }}
                    onClick={handleUpload} disabled={uploading}>
                    {uploading ? <Loader2 size={12} className="spin" /> : <><Download size={12} /> Upload</>}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Deadline Extension History */}
          {extensions.length > 0 && (
            <div className="atd-card">
              <div className="atd-section-head" style={{ cursor: 'pointer' }}
                onClick={() => setShowHistory(h => !h)}>
                <h3 className="atd-section-title">
                  <History size={15} /> Extension History ({extensions.length})
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#6a8c6a' }}>{showHistory ? 'Hide' : 'Show'}</span>
              </div>
              {showHistory && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                  {extensions.map((ext: DeadlineExtension) => (
                    <div key={ext.id} className="atd-ext-item">
                      <div className="atd-ext-dates">
                        {ext.old_deadline && <span className="atd-ext-old">{fmtDate(ext.old_deadline)}</span>}
                        {ext.old_deadline && <span style={{ color: '#9ab09a' }}>→</span>}
                        <span className="atd-ext-new">{fmtDate(ext.new_deadline)}</span>
                      </div>
                      {ext.reason && <p className="atd-ext-reason">{ext.reason}</p>}
                      <p className="atd-ext-by">
                        By {ext.first_name ? `${ext.first_name} ${ext.last_name}` : ext.extended_by_email}
                        {' · '}{fmtDate(ext.created_at, true)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Admin Final Review Modal ── */}
      {reviewOpen && (
        <div className="atd-modal-overlay" onClick={e => e.target === e.currentTarget && setReviewOpen(false)}>
          <div className="atd-modal" role="dialog">
            <h3 className="atd-modal-title">
              {decision === 'approved'
                ? <><CheckCircle size={18} className="icon-green" /> Final Approval</>
                : <><XCircle size={18} className="icon-red" /> Final Rejection</>
              }
            </h3>
            {reviewTarget && (
              <p className="atd-modal-sub">
                {reviewTarget.first_name
                  ? `${reviewTarget.first_name} ${reviewTarget.last_name}`
                  : reviewTarget.email}
              </p>
            )}
            {reviewError && <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}>{reviewError}</div>}
            <div className="form-group">
              <label>Feedback {decision === 'rejected' ? '(required)' : '(optional)'}</label>
              <textarea rows={3} value={feedback} onChange={e => setFeedback(e.target.value)}
                placeholder={decision === 'approved' ? 'Well done! …' : 'Please revise: …'} />
            </div>
            <div className="atd-modal-actions">
              <button
                className={decision === 'approved' ? 'btn-approve' : 'btn-reject'}
                onClick={handleReview}
                disabled={reviewing || (decision === 'rejected' && !feedback.trim())}
              >
                {reviewing
                  ? <Loader2 size={14} className="spin" />
                  : decision === 'approved' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {decision === 'approved' ? 'Confirm Final Approval' : 'Confirm Rejection'}
              </button>
              <button className="btn-secondary" onClick={() => setReviewOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Extend Deadline Modal ── */}
      {extendOpen && (
        <div className="atd-modal-overlay" onClick={e => e.target === e.currentTarget && setExtendOpen(false)}>
          <div className="atd-modal" role="dialog">
            <h3 className="atd-modal-title"><CalendarClock size={18} className="icon-green" /> Extend Deadline</h3>
            <p className="atd-modal-sub">Current: {fmtDate(task.deadline)}{task.deadline_time ? ` at ${task.deadline_time.slice(0, 5)}` : ''}</p>
            {extendError && <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}>{extendError}</div>}
            <div className="form-group">
              <label><Calendar size={13} /> New Deadline Date *</label>
              <input type="date" value={newDeadline}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setNewDeadline(e.target.value)} />
            </div>
            <div className="form-group">
              <label><Clock size={13} /> New Deadline Time <span style={{ fontSize: '0.78rem', color: '#9ab09a' }}>(optional)</span></label>
              <input type="time" value={newDeadlineTime} onChange={e => setNewDeadlineTime(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Reason <span style={{ fontSize: '0.78rem', color: '#9ab09a' }}>(optional)</span></label>
              <textarea rows={2} value={extendReason} onChange={e => setExtendReason(e.target.value)}
                placeholder="Reason for extension…" />
            </div>
            <div className="atd-modal-actions">
              <button className="btn-approve" onClick={handleExtend} disabled={extending || !newDeadline}>
                {extending ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                Extend Deadline
              </button>
              <button className="btn-secondary" onClick={() => setExtendOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
