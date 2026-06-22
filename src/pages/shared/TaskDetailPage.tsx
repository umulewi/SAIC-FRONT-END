import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, MessageSquare, Paperclip, Send,
  Loader2, CheckCircle, AlertCircle, Upload, Download, FileText,
  Image, FileSpreadsheet, Archive, PlayCircle, ThumbsUp, ThumbsDown,
  Pencil, CalendarClock, X, Users,
} from 'lucide-react';
import { getTask, updateTaskStatus, submitTask, addComment, managerReviewTask, updateTask, extendDeadline, assignTask, removeAssignee } from '../../api/tasks';
import { getMyTeam } from '../../api/role';
import type { EnhancedTask, TaskPriority, TaskStatus, TaskAssignment, TeamMember } from '../../types';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../shared/SharedPages.css';
import './TaskDetailPage.css';

interface TaskDetailPageProps { apiBase: string; }

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'badge-low', medium: 'badge-medium', high: 'badge-high', urgent: 'badge-urgent',
};
const STATUS_COLORS: Record<TaskStatus, string> = {
  draft: 'badge-draft', assigned: 'badge-assigned', in_progress: 'badge-inprog',
  submitted: 'badge-submitted', approved: 'badge-approved', rejected: 'badge-rejected',
};

const NON_ADMIN_MGR_ROLES = [
  'Admin Manager', 'Finance Manager', 'Training Department Manager',
  'Farm and Carbon Credit Department Manager', 'Transaction Advisory Department Manager',
];

function fmtDate(d?: string, withTime = false) {
  if (!d) return '—';
  const opts: Intl.DateTimeFormatOptions = withTime
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' };
  return new Date(d).toLocaleString('en-GB', opts);
}

function fileIcon(mime?: string) {
  if (!mime) return <FileText size={15} />;
  if (mime.startsWith('image/')) return <Image size={15} />;
  if (mime.includes('sheet') || mime.includes('excel')) return <FileSpreadsheet size={15} />;
  if (mime.includes('zip')) return <Archive size={15} />;
  return <FileText size={15} />;
}

function fmtSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function TaskDetailPage({ apiBase }: TaskDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { user } = useAuth();
  const taskId = parseInt(id ?? '0', 10);
  const roleSlug = apiBase.replace(/^\//, '');

  const isManager = NON_ADMIN_MGR_ROLES.includes(user?.role ?? '');

  const [task,    setTask]    = useState<EnhancedTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // My assignment
  const [myAssignment, setMyAssignment] = useState<TaskAssignment | null>(null);

  // Comment
  const [comment,    setComment]    = useState('');
  const [commenting, setCommenting] = useState(false);
  const [commentOk,  setCommentOk]  = useState(false);

  // Submit
  const [submitOpen,  setSubmitOpen]  = useState(false);
  const [submitNote,  setSubmitNote]  = useState('');
  const [submitFiles, setSubmitFiles] = useState<FileList | null>(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitOk,    setSubmitOk]    = useState(false);

  // Status: start progress
  const [starting, setStarting] = useState(false);

  // Manager review (team_only tasks)
  const [reviewOpen,     setReviewOpen]     = useState(false);
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected' | ''>('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewing,      setReviewing]      = useState(false);
  const [reviewError,    setReviewError]    = useState('');
  const [reviewOk,       setReviewOk]       = useState(false);

  // Edit task (manager's own team tasks)
  const [editOpen,         setEditOpen]         = useState(false);
  const [editTitle,        setEditTitle]        = useState('');
  const [editDesc,         setEditDesc]         = useState('');
  const [editPriority,     setEditPriority]     = useState<TaskPriority>('medium');
  const [editInstructions, setEditInstructions] = useState('');
  const [editDeadline,     setEditDeadline]     = useState('');
  const [editDeadlineTime, setEditDeadlineTime] = useState('');
  const [editTeamMembers,  setEditTeamMembers]  = useState<TeamMember[]>([]);
  const [editAssignees,    setEditAssignees]    = useState<number[]>([]);
  const [saving,           setSaving]           = useState(false);
  const [editError,        setEditError]        = useState('');

  // Extend deadline (manager's own team tasks)
  const [extendOpen,      setExtendOpen]      = useState(false);
  const [newDeadline,     setNewDeadline]     = useState('');
  const [newDeadlineTime, setNewDeadlineTime] = useState('');
  const [extendReason,    setExtendReason]    = useState('');
  const [extending,       setExtending]       = useState(false);
  const [extendError,     setExtendError]     = useState('');

  const reload = async () => {
    setLoading(true); setError('');
    try {
      const t = await getTask(taskId);
      setTask(t);
      const mine = (t.assignees ?? []).find(a => a.users_id === user?.id) ?? null;
      setMyAssignment(mine);
    } catch {
      setError('Failed to load task.');
    } finally { setLoading(false); }
  };

  useEffect(() => { reload(); }, [taskId]);

  const handleStart = async () => {
    setStarting(true);
    try { await updateTaskStatus(taskId, 'in_progress'); reload(); }
    catch { /* silent */ }
    finally { setStarting(false); }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setCommenting(true); setCommentOk(false);
    try {
      await addComment(taskId, comment.trim());
      setComment(''); setCommentOk(true);
      setTimeout(() => setCommentOk(false), 2000);
      reload();
    } catch { /* silent */ }
    finally { setCommenting(false); }
  };

  const handleSubmit = async () => {
    setSubmitting(true); setSubmitError('');
    try {
      await submitTask(taskId, submitFiles ? Array.from(submitFiles) : [], submitNote);
      setSubmitOpen(false); setSubmitNote(''); setSubmitFiles(null); setSubmitOk(true);
      reload();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Submission failed.';
      setSubmitError(msg);
    } finally { setSubmitting(false); }
  };

  const handleManagerReview = async () => {
    if (!reviewDecision) return;
    setReviewing(true); setReviewError('');
    try {
      const teamAsgn = (task?.assignees ?? []).find(a => a.assigned_by_role === 'manager');
      await managerReviewTask(taskId, reviewDecision, reviewFeedback || undefined, teamAsgn?.assignment_id);
      setReviewOpen(false); setReviewDecision(''); setReviewFeedback(''); setReviewOk(true);
      reload();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Review failed.';
      setReviewError(msg);
    } finally { setReviewing(false); }
  };

  const openEdit = async () => {
    if (!task) return;
    setEditTitle(task.title);
    setEditDesc(task.description ?? '');
    setEditPriority(task.priority);
    setEditInstructions(task.instructions ?? '');
    setEditDeadline(task.deadline ? task.deadline.slice(0, 10) : '');
    setEditDeadlineTime(task.deadline_time ?? '');
    setEditAssignees(
      (task.assignees ?? []).filter(a => a.assigned_by_role === 'manager').map(a => a.users_id)
    );
    setEditError('');
    setEditOpen(true);
    if (editTeamMembers.length === 0) {
      try { setEditTeamMembers(await getMyTeam(apiBase)); } catch { /* ignore */ }
    }
  };

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

      // Sync assignees: add new, remove dropped
      const currentIds = new Set(
        (task!.assignees ?? []).filter(a => a.assigned_by_role === 'manager').map(a => a.users_id)
      );
      const toAdd    = editAssignees.filter(uid => !currentIds.has(uid));
      const toRemove = [...currentIds].filter(uid => !editAssignees.includes(uid));
      if (toAdd.length > 0) await assignTask(taskId, toAdd);
      for (const uid of toRemove) await removeAssignee(taskId, uid);

      setEditOpen(false);
      reload();
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
      setExtendOpen(false);
      reload();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to extend deadline.';
      setExtendError(msg);
    } finally { setExtending(false); }
  };

  if (loading) return <LoadingSpinner message="Loading task…" />;
  if (error || !task) return (
    <div className="page-error">
      <AlertCircle size={16} /> {error || 'Task not found.'}
    </div>
  );

  const isRejectedByAdmin = task.workflow_stage === 'rejected_to_manager';
  const isTeamOnly = task.scope === 'team_only';
  const isMyTeamTask = isManager && isTeamOnly && task.created_by === user?.id;

  const canStart   = myAssignment?.assignment_status === 'assigned' && !isRejectedByAdmin;
  // Allow resubmit when admin rejected, even if assignment was previously approved
  const canSubmit  = myAssignment && (
    ['assigned', 'in_progress', 'rejected'].includes(myAssignment.assignment_status) ||
    isRejectedByAdmin
  );
  const isApproved = myAssignment?.assignment_status === 'approved' && !isRejectedByAdmin;
  const isRejected = myAssignment?.assignment_status === 'rejected';

  // Manager can review their own team_only tasks when pending_manager_review
  const canManagerReview = isManager && isTeamOnly &&
    task.workflow_stage === 'pending_manager_review' &&
    task.created_by === user?.id;

  return (
    <div className="tdp-root">

      {/* ── Back + Manager actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button className="atd-back-btn" style={{ margin: 0 }} onClick={() => nav(`/dashboard/${roleSlug}/tasks`)}>
          <ArrowLeft size={15} /> My Tasks
        </button>
        {isMyTeamTask && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={openEdit}>
              <Pencil size={14} /> Edit Task
            </button>
            <button className="btn-secondary" onClick={openExtend}>
              <CalendarClock size={14} /> Extend Deadline
            </button>
          </div>
        )}
      </div>

      {/* ── Edit Task panel (manager's own team tasks) ── */}
      {isMyTeamTask && editOpen && (
        <div className="atd-card" style={{ marginBottom: '1rem', border: '1.5px solid #d4e4d4' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#2D5016', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Pencil size={15} /> Edit Task
            </h3>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ab09a' }} onClick={() => setEditOpen(false)}><X size={18} /></button>
          </div>
          {editError && <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}><AlertCircle size={14} /> {editError}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
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
              <div className="form-group">
                <label><Calendar size={12} /> Due Date</label>
                <input type="date" value={editDeadline} onChange={e => setEditDeadline(e.target.value)} disabled={saving} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label><Clock size={12} /> Due Time</label>
                <input type="time" value={editDeadlineTime} onChange={e => setEditDeadlineTime(e.target.value)} disabled={saving} />
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
            <div className="form-group">
              <label><Users size={12} /> Assign to Team Members</label>
              {editTeamMembers.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: '#9ab09a', margin: '0.25rem 0 0' }}>Loading team…</p>
              ) : (
                <div className="atm-staff-grid">
                  {editTeamMembers.map(m => {
                    const sel = editAssignees.includes(m.users_id);
                    return (
                      <button key={m.users_id} type="button"
                        className={`atm-staff-chip ${sel ? 'selected' : ''}`}
                        onClick={() => setEditAssignees(prev =>
                          prev.includes(m.users_id) ? prev.filter(x => x !== m.users_id) : [...prev, m.users_id]
                        )}
                        disabled={saving}>
                        <span className="chip-avatar">{m.first_name[0]}{m.last_name[0]}</span>
                        <span className="chip-name">{m.first_name} {m.last_name}</span>
                        {m.role_name && <span className="chip-role">{m.role_name}</span>}
                        {sel && <CheckCircle size={12} className="chip-check" />}
                      </button>
                    );
                  })}
                </div>
              )}
              {editAssignees.length > 0 && (
                <p style={{ fontSize: '0.78rem', color: '#2D5016', fontWeight: 600, margin: '0.35rem 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users size={13} /> {editAssignees.length} member{editAssignees.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-primary" onClick={handleEditSave} disabled={saving}>
                {saving ? <><Loader2 size={14} className="spin" /> Saving…</> : <><CheckCircle size={14} /> Save Changes</>}
              </button>
              <button className="btn-secondary" onClick={() => setEditOpen(false)} disabled={saving}><X size={14} /> Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header card ── */}
      <div className="tdp-header-card">
        <div className="tdp-header-top">
          <div>
            <h2 className="tdp-title">{task.title}</h2>
            <div className="atd-meta-row" style={{ marginTop: '0.5rem' }}>
              <span className="atd-meta-item"><Calendar size={12} /> Due: {fmtDate(task.deadline)}</span>
              <span className="atd-meta-item"><Clock size={12} /> Created: {fmtDate(task.created_at)}</span>
              {isTeamOnly && (
                <span className="atd-meta-item" style={{ color: '#7b5ea7', fontWeight: 600, background: '#f3eeff', padding: '1px 8px', borderRadius: 10, border: '1px solid #d4bbff' }}>
                  Team Task
                </span>
              )}
            </div>
          </div>
          <div className="tdp-badges">
            <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
            <span className={`badge ${STATUS_COLORS[task.status]}`}>{task.status.replace('_',' ')}</span>
          </div>
        </div>

        {/* Admin rejection banner */}
        {isRejectedByAdmin && (
          <div className="tdp-feedback-banner" style={{ borderColor: '#c0392b', background: '#fff5f5' }}>
            <AlertCircle size={15} />
            <div>
              <strong>Returned for Revision:</strong> Admin rejected this submission. You may upload a revised document below.
            </div>
          </div>
        )}

        {/* Feedback banner (if rejected by manager) */}
        {isRejected && !isRejectedByAdmin && myAssignment?.feedback && (
          <div className="tdp-feedback-banner">
            <AlertCircle size={15} />
            <div>
              <strong>Rejected:</strong> {myAssignment.feedback}
            </div>
          </div>
        )}

        {/* Approved banner */}
        {isApproved && (
          <div className="tdp-approved-banner">
            <CheckCircle size={15} />
            <strong>Your submission has been approved!</strong>
          </div>
        )}

        {/* Review success */}
        {reviewOk && (
          <div className="tdp-approved-banner">
            <CheckCircle size={15} />
            Review submitted successfully.
          </div>
        )}

        {/* Submit success */}
        {submitOk && (
          <div className="tdp-success-banner">
            <CheckCircle size={15} />
            {isRejectedByAdmin ? 'Resubmission sent for review.' : 'Task submitted for review. You will be notified once reviewed.'}
          </div>
        )}

        {/* Action buttons */}
        <div className="tdp-actions">
          {canStart && (
            <button className="btn-primary" onClick={handleStart} disabled={starting}>
              {starting ? <Loader2 size={14} className="spin" /> : <PlayCircle size={14} />}
              Start Working
            </button>
          )}
          {canSubmit && !isApproved && (
            <button className="btn-submit" onClick={() => setSubmitOpen(true)}>
              <Upload size={14} /> {isRejectedByAdmin ? 'Resubmit Document' : 'Submit for Review'}
            </button>
          )}
          {canManagerReview && (
            <button className="btn-primary" onClick={() => setReviewOpen(true)}
              style={{ background: 'linear-gradient(135deg, #7b5ea7 0%, #5c3d82 100%)' }}>
              <ThumbsUp size={14} /> Review Submission
            </button>
          )}
        </div>
      </div>

      <div className="tdp-layout">
        <div className="tdp-main">

          {/* Description & Instructions */}
          {(task.description || task.instructions) && (
            <div className="atd-card">
              {task.description && (
                <div style={{ marginBottom: task.instructions ? '1rem' : 0 }}>
                  <p style={{ fontSize: '0.9rem', color: '#4a6a4a', lineHeight: 1.65, margin: 0 }}>{task.description}</p>
                </div>
              )}
              {task.instructions && (
                <div className="atd-instructions">
                  <h4>Instructions from Manager</h4>
                  <p>{task.instructions}</p>
                </div>
              )}
            </div>
          )}

          {/* Manager review form (team_only tasks) */}
          {reviewOpen && (
            <div className="tdp-submit-card" style={{ borderColor: '#7b5ea7' }}>
              <h3 className="tdp-submit-title" style={{ color: '#5c3d82' }}>
                <ThumbsUp size={16} /> Review Team Submission
              </h3>
              {reviewError && <div className="alert alert-error"><AlertCircle size={14} />{reviewError}</div>}
              <div className="form-group">
                <label>Decision</label>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <button type="button"
                    onClick={() => setReviewDecision('approved')}
                    className={reviewDecision === 'approved' ? 'btn-submit' : 'btn-secondary'}
                    style={{ flex: 1 }}>
                    <ThumbsUp size={14} /> Approve &amp; Complete
                  </button>
                  <button type="button"
                    onClick={() => setReviewDecision('rejected')}
                    style={{ flex: 1, ...(reviewDecision === 'rejected' ? { background: '#c0392b', color: '#fff', border: 'none' } : {}) }}
                    className={reviewDecision === 'rejected' ? '' : 'btn-secondary'}>
                    <ThumbsDown size={14} /> Request Revision
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Feedback {reviewDecision === 'rejected' ? '(required)' : '(optional)'}</label>
                <textarea rows={3} value={reviewFeedback} onChange={e => setReviewFeedback(e.target.value)}
                  placeholder={reviewDecision === 'rejected' ? 'Explain what needs to be revised…' : 'Add any notes for the team member…'}
                  disabled={reviewing}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn-submit"
                  onClick={handleManagerReview}
                  disabled={reviewing || !reviewDecision || (reviewDecision === 'rejected' && !reviewFeedback.trim())}
                  style={reviewDecision === 'rejected' ? { background: '#c0392b' } : {}}
                >
                  {reviewing ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                  {reviewing ? 'Submitting…' : 'Confirm Review'}
                </button>
                <button className="btn-secondary" onClick={() => setReviewOpen(false)} disabled={reviewing}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Submit form */}
          {submitOpen && (
            <div className="tdp-submit-card">
              <h3 className="tdp-submit-title"><Upload size={16} /> {isRejectedByAdmin ? 'Resubmit Your Work' : 'Submit Your Work'}</h3>
              {isRejectedByAdmin && (
                <p style={{ fontSize: '0.82rem', color: '#9b2226', margin: '0 0 1rem', background: '#fff5f5', padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid #f8d7da' }}>
                  Upload the revised document to address admin feedback.
                </p>
              )}
              {submitError && <div className="alert alert-error"><AlertCircle size={14} />{submitError}</div>}
              <div className="form-group">
                <label>Submission Note (optional)</label>
                <textarea rows={3} value={submitNote} onChange={e => setSubmitNote(e.target.value)}
                  placeholder="Describe what you've completed, any notes for the reviewer…"
                  disabled={submitting}
                />
              </div>
              <div className="form-group">
                <label><Paperclip size={13} /> Attach Files (optional)</label>
                <input type="file" multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt,.zip"
                  onChange={e => setSubmitFiles(e.target.files)}
                  disabled={submitting}
                  style={{ fontSize: '0.82rem' }}
                />
                {submitFiles && submitFiles.length > 0 && (
                  <p style={{ fontSize: '0.78rem', color: '#2D5016', margin: '0.35rem 0 0' }}>
                    {submitFiles.length} file(s) selected
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-submit" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                  {submitting ? 'Submitting…' : 'Confirm Submission'}
                </button>
                <button className="btn-secondary" onClick={() => setSubmitOpen(false)} disabled={submitting}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="atd-card">
            <h3 className="atd-section-title"><MessageSquare size={15} /> Discussion ({task.comments?.length ?? 0})</h3>
            <div className="atd-comments-list">
              {(task.comments ?? []).length === 0 && (
                <p className="atd-empty-text">No messages yet. Ask your manager a question here.</p>
              )}
              {(task.comments ?? []).map(c => (
                <div key={c.id} className={`atd-comment ${c.comment.startsWith('[APPROVED]') ? 'comment-approved' : c.comment.startsWith('[REJECTED]') ? 'comment-rejected' : ''}`}>
                  <div className="atd-comment-head">
                    <span className="atd-comment-author">
                      {c.first_name && c.last_name ? `${c.first_name} ${c.last_name}` : c.author_email}
                    </span>
                    <span className="atd-comment-time">{fmtDate(c.created_at, true)}</span>
                  </div>
                  <p className="atd-comment-body">{c.comment}</p>
                </div>
              ))}
            </div>
            <div className="atd-comment-input">
              <textarea
                rows={2}
                placeholder="Ask a question or provide an update… (Ctrl+Enter to send)"
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleComment(); }}
              />
              <button className={`btn-primary ${commentOk ? 'btn-ok' : ''}`}
                onClick={handleComment}
                disabled={commenting || !comment.trim()}>
                {commenting
                  ? <Loader2 size={14} className="spin" />
                  : commentOk ? <CheckCircle size={14} /> : <Send size={14} />
                }
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: files */}
        <div className="tdp-sidebar">
          <div className="atd-card">
            <h3 className="atd-section-title"><Paperclip size={14} /> Files ({task.files?.length ?? 0})</h3>
            <div className="atd-files-list">
              {(task.files ?? []).length === 0 && (
                <p className="atd-empty-text">No files attached yet.</p>
              )}
              {(task.files ?? []).map(f => (
                <a key={f.id} href={`/uploads/${f.file_name}`} download={f.original_name}
                  className="atd-file-row" target="_blank" rel="noreferrer">
                  <span className="atd-file-icon" style={{ color: '#2D5016' }}>{fileIcon(f.mime_type)}</span>
                  <span className="atd-file-info">
                    <span className="atd-file-name">{f.original_name}</span>
                    <span className="atd-file-meta">{fmtSize(f.file_size)} · {f.file_type}</span>
                  </span>
                  <Download size={12} style={{ color: '#9ab09a', flexShrink: 0 }} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Extend Deadline Modal (manager's own team tasks) ── */}
      {extendOpen && (
        <div className="atd-modal-overlay" onClick={e => e.target === e.currentTarget && setExtendOpen(false)}>
          <div className="atd-modal" role="dialog">
            <h3 className="atd-modal-title"><CalendarClock size={18} className="icon-green" /> Extend Deadline</h3>
            <p className="atd-modal-sub">Current: {fmtDate(task.deadline)}{task.deadline_time ? ` at ${task.deadline_time.slice(0, 5)}` : ''}</p>
            {extendError && <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}>{extendError}</div>}
            <div className="form-group">
              <label><Calendar size={13} /> New Deadline Date *</label>
              <input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} />
            </div>
            <div className="form-group">
              <label><Clock size={13} /> New Deadline Time <span style={{ fontSize: '0.78rem', color: '#9ab09a' }}>(optional)</span></label>
              <input type="time" value={newDeadlineTime} onChange={e => setNewDeadlineTime(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Reason <span style={{ fontSize: '0.78rem', color: '#9ab09a' }}>(optional)</span></label>
              <textarea rows={2} value={extendReason} onChange={e => setExtendReason(e.target.value)} placeholder="Reason for extension…" />
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
