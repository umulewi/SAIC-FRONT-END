import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, XCircle, MessageSquare, Paperclip, Users,
  Clock, Calendar, AlertCircle, Download, Loader2, Send, UserPlus,
  FileText, Image, FileSpreadsheet, Archive, Trash2, Pencil, X,
} from 'lucide-react';
import {
  getTask, updateTask, reviewTask, addComment, assignTask,
  removeAssignee, uploadTaskFiles,
} from '../../api/tasks';
import { adminGetStaff } from '../../api/role';
import type { EnhancedTask, TaskPriority, TaskStatus, TaskAssignment, StaffMember } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../shared/SharedPages.css';
import './AdminTasksPage.css';
import './AdminTaskDetailPage.css';

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'badge-low', medium: 'badge-medium', high: 'badge-high', urgent: 'badge-urgent',
};
const STATUS_COLORS: Record<TaskStatus, string> = {
  draft: 'badge-draft', assigned: 'badge-assigned', in_progress: 'badge-inprog',
  submitted: 'badge-submitted', approved: 'badge-approved', rejected: 'badge-rejected',
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
  if (bytes < 1024)     return `${bytes} B`;
  if (bytes < 1048576)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function AdminTaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const taskId = parseInt(id ?? '0', 10);

  const [task,    setTask]    = useState<EnhancedTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Review panel
  const [reviewOpen,    setReviewOpen]    = useState(false);
  const [reviewTarget,  setReviewTarget]  = useState<TaskAssignment | null>(null);
  const [decision,      setDecision]      = useState<'approved' | 'rejected'>('approved');
  const [feedback,      setFeedback]      = useState('');
  const [reviewing,     setReviewing]     = useState(false);
  const [reviewError,   setReviewError]   = useState('');

  // Comment
  const [comment,      setComment]      = useState('');
  const [commenting,   setCommenting]   = useState(false);

  // Assign users
  const [assignOpen,   setAssignOpen]   = useState(false);
  const [staff,        setStaff]        = useState<StaffMember[]>([]);
  const [newAssignees, setNewAssignees] = useState<number[]>([]);
  const [assigning,    setAssigning]    = useState(false);

  // File upload (attachments by admin)
  const [uploadFiles,  setUploadFiles]  = useState<FileList | null>(null);
  const [uploading,    setUploading]    = useState(false);

  // Edit panel
  const [editOpen,         setEditOpen]         = useState(false);
  const [editTitle,        setEditTitle]        = useState('');
  const [editDesc,         setEditDesc]         = useState('');
  const [editPriority,     setEditPriority]     = useState<TaskPriority>('medium');
  const [editInstructions, setEditInstructions] = useState('');
  const [editDeadline,     setEditDeadline]     = useState('');
  const [editAssignees,    setEditAssignees]    = useState<number[]>([]);
  const [editStaff,        setEditStaff]        = useState<StaffMember[]>([]);
  const [saving,           setSaving]           = useState(false);
  const [editError,        setEditError]        = useState('');

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
    if (!uploadFiles || uploadFiles.length === 0) return;
    setUploading(true);
    try {
      await uploadTaskFiles(taskId, Array.from(uploadFiles), 'attachment');
      setUploadFiles(null);
      reload();
    } catch { /* silent */ }
    finally { setUploading(false); }
  };

  const handleStatusChange = async (status: string) => {
    if (!confirm(`Change task status to "${status}"?`)) return;
    try { await updateTask(taskId, { status }); reload(); }
    catch { /* silent */ }
  };

  const openEdit = async () => {
    if (!task) return;
    setEditTitle(task.title);
    setEditDesc(task.description ?? '');
    setEditPriority(task.priority);
    setEditInstructions(task.instructions ?? '');
    setEditDeadline(task.deadline ? task.deadline.slice(0, 10) : '');
    setEditAssignees((task.assignees ?? []).map(a => a.users_id));
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
      });

      const currentIds = new Set((task!.assignees ?? []).map(a => a.users_id));
      const toAdd      = editAssignees.filter(id => !currentIds.has(id));
      const toRemove   = [...currentIds].filter(id => !editAssignees.includes(id));

      if (toAdd.length > 0) await assignTask(taskId, toAdd);
      for (const uid of toRemove) await removeAssignee(taskId, uid);

      setEditOpen(false);
      reload();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Save failed.';
      setEditError(msg);
    } finally { setSaving(false); }
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

  const assignedIds = (task.assignees ?? []).map(a => a.users_id);

  return (
    <div className="atd-root">

      {/* ── Header ── */}
      <div className="atd-topbar">
        <button className="atd-back-btn" onClick={() => nav('/dashboard/admin/tasks')}>
          <ArrowLeft size={16} /> All Tasks
        </button>
        <div className="atd-topbar-actions">
          <button className="btn-secondary" onClick={openEdit}>
            <Pencil size={14} /> Edit Task
          </button>
          <select
            className="atm-select"
            value={task.status}
            onChange={e => handleStatusChange(e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* ── Edit Task Drawer ── */}
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
              <textarea rows={3} value={editInstructions} onChange={e => setEditInstructions(e.target.value)} disabled={saving} placeholder="Step-by-step instructions…" />
            </div>
            <div className="form-group">
              <label><Calendar size={13} /> Due Date</label>
              <input type="date" value={editDeadline} onChange={e => setEditDeadline(e.target.value)} disabled={saving} />
            </div>
            <div className="form-group">
              <label><Users size={13} /> Assignees — click to add or remove</label>
              <div className="atm-staff-grid">
                {editStaff.map(s => {
                  const sel = editAssignees.includes(s.users_id);
                  return (
                    <button key={s.users_id} type="button"
                      className={`atm-staff-chip ${sel ? 'selected' : ''}`}
                      onClick={() => toggleEditAssignee(s.users_id)}
                      disabled={saving}
                    >
                      <span className="chip-avatar">{s.first_name[0]}{s.last_name[0]}</span>
                      <span className="chip-name">{s.first_name} {s.last_name}</span>
                      <span className="chip-role">{s.role_name ?? ''}</span>
                      {sel && <CheckCircle size={13} className="chip-check" />}
                    </button>
                  );
                })}
                {editStaff.length === 0 && <p style={{ fontSize: '0.8rem', color: '#9ab09a', margin: 0 }}>Loading staff…</p>}
              </div>
              {editAssignees.length > 0 && (
                <p className="atm-assign-count"><Users size={13} /> {editAssignees.length} person{editAssignees.length !== 1 ? 's' : ''} selected</p>
              )}
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

      {/* ── Layout: main + sidebar ── */}
      <div className="atd-layout">

        {/* ── Main ── */}
        <div className="atd-main">

          {/* Task info */}
          <div className="atd-card">
            <div className="atd-card-head">
              <h2 className="atd-task-title">{task.title}</h2>
              <div className="atd-badges">
                <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                <span className={`badge ${STATUS_COLORS[task.status]}`}>{task.status.replace('_', ' ')}</span>
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
              <span className="atd-meta-item"><Calendar size={13} /> Due: {fmtDate(task.deadline)}</span>
              <span className="atd-meta-item"><Clock size={13} /> Created: {fmtDate(task.created_at)}</span>
              {task.creator_email && <span className="atd-meta-item">By: {task.creator_email}</span>}
            </div>
          </div>

          {/* Assignees */}
          <div className="atd-card">
            <div className="atd-section-head">
              <h3><Users size={16} /> Assignees ({task.assignees?.length ?? 0})</h3>
              <button className="btn-secondary" onClick={openAssign}><UserPlus size={13} /> Add</button>
            </div>

            {assignOpen && (
              <div className="atd-assign-panel">
                <div className="atm-staff-grid">
                  {staff.filter(s => !assignedIds.includes(s.users_id)).map(s => {
                    const sel = newAssignees.includes(s.users_id);
                    return (
                      <button key={s.users_id} type="button"
                        className={`atm-staff-chip ${sel ? 'selected' : ''}`}
                        onClick={() => toggleNewAssignee(s.users_id)}
                      >
                        <span className="chip-avatar">{s.first_name[0]}{s.last_name[0]}</span>
                        <span className="chip-name">{s.first_name} {s.last_name}</span>
                        <span className="chip-role">{s.role_name ?? ''}</span>
                        {sel && <CheckCircle size={12} className="chip-check" />}
                      </button>
                    );
                  })}
                  {staff.filter(s => !assignedIds.includes(s.users_id)).length === 0 && (
                    <p style={{ fontSize: '0.8rem', color: '#9ab09a' }}>All staff already assigned.</p>
                  )}
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

            <div className="atd-assignees-list">
              {(task.assignees ?? []).length === 0 && (
                <p className="atd-empty-text">No assignees yet. Add staff to this task.</p>
              )}
              {(task.assignees ?? []).map(a => (
                <div key={a.assignment_id} className="atd-assignee-row">
                  <div className="atd-assignee-info">
                    <div className="chip-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                      {(a.first_name?.[0] ?? a.email[0]).toUpperCase()}
                      {(a.last_name?.[0] ?? '').toUpperCase()}
                    </div>
                    <div>
                      <p className="atd-name">
                        {a.first_name && a.last_name ? `${a.first_name} ${a.last_name}` : a.email}
                      </p>
                      <p className="atd-sub-text">{a.email}</p>
                    </div>
                  </div>
                  <div className="atd-assignee-status">
                    <span className={`badge ${STATUS_COLORS[a.assignment_status]}`}>{a.assignment_status.replace('_',' ')}</span>
                    {a.submitted_at && <span className="atd-sub-text">Submitted {fmtDate(a.submitted_at)}</span>}
                    {a.feedback && <span className="atd-feedback-preview">{a.feedback}</span>}
                  </div>
                  <div className="atd-assignee-actions">
                    {a.assignment_status === 'submitted' && (
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
            </div>
          </div>

          {/* Comments */}
          <div className="atd-card">
            <h3 className="atd-section-title"><MessageSquare size={16} /> Discussion ({task.comments?.length ?? 0})</h3>
            <div className="atd-comments-list">
              {(task.comments ?? []).length === 0 && (
                <p className="atd-empty-text">No comments yet. Start the conversation.</p>
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
                placeholder="Add a comment or feedback…"
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleComment(); }}
              />
              <button className="btn-primary" onClick={handleComment} disabled={commenting || !comment.trim()}>
                {commenting ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
                Post
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
              {(task.files ?? []).length === 0 && (
                <p className="atd-empty-text">No files attached.</p>
              )}
              {(task.files ?? []).map(f => (
                <a
                  key={f.id}
                  href={`/uploads/${f.file_name}`}
                  download={f.original_name}
                  className="atd-file-row"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="atd-file-icon">{fileIcon(f.mime_type)}</span>
                  <span className="atd-file-info">
                    <span className="atd-file-name">{f.original_name}</span>
                    <span className="atd-file-meta">
                      {fmtSize(f.file_size)} · {f.file_type} · {fmtDate(f.uploaded_at)}
                    </span>
                  </span>
                  <Download size={13} className="atd-file-dl" />
                </a>
              ))}
            </div>

            {/* Upload attachments */}
            <div className="atd-upload-area">
              <input
                type="file"
                id="atd-file-input"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.zip"
                style={{ display: 'none' }}
                onChange={e => setUploadFiles(e.target.files)}
              />
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
        </div>
      </div>

      {/* ── Review Modal ── */}
      {reviewOpen && reviewTarget && (
        <div className="atd-modal-overlay" onClick={e => e.target === e.currentTarget && setReviewOpen(false)}>
          <div className="atd-modal" role="dialog">
            <h3 className="atd-modal-title">
              {decision === 'approved'
                ? <><CheckCircle size={18} className="icon-green" /> Approve Submission</>
                : <><XCircle size={18} className="icon-red" /> Reject Submission</>
              }
            </h3>
            <p className="atd-modal-sub">
              {reviewTarget.first_name
                ? `${reviewTarget.first_name} ${reviewTarget.last_name}`
                : reviewTarget.email}
            </p>
            {reviewError && <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}>{reviewError}</div>}
            <div className="form-group">
              <label>Feedback {decision === 'rejected' ? '(required)' : '(optional)'}</label>
              <textarea rows={3} value={feedback} onChange={e => setFeedback(e.target.value)}
                placeholder={decision === 'approved' ? 'Great work! …' : 'Please revise: …'} />
            </div>
            <div className="atd-modal-actions">
              <button
                className={decision === 'approved' ? 'btn-approve' : 'btn-reject'}
                onClick={handleReview}
                disabled={reviewing || (decision === 'rejected' && !feedback.trim())}
              >
                {reviewing
                  ? <Loader2 size={14} className="spin" />
                  : decision === 'approved' ? <CheckCircle size={14} /> : <XCircle size={14} />
                }
                {decision === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
              <button className="btn-secondary" onClick={() => setReviewOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
