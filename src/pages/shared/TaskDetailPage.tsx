import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, MessageSquare, Paperclip, Send,
  Loader2, CheckCircle, AlertCircle, Upload, Download, FileText,
  Image, FileSpreadsheet, Archive, PlayCircle,
} from 'lucide-react';
import { getTask, updateTaskStatus, submitTask, addComment, uploadTaskFiles } from '../../api/tasks';
import type { EnhancedTask, TaskPriority, TaskStatus, TaskAssignment } from '../../types';
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

  if (loading) return <LoadingSpinner message="Loading task…" />;
  if (error || !task) return (
    <div className="page-error">
      <AlertCircle size={16} /> {error || 'Task not found.'}
    </div>
  );

  const canStart  = myAssignment?.assignment_status === 'assigned';
  const canSubmit = myAssignment && ['assigned','in_progress','rejected'].includes(myAssignment.assignment_status);
  const isApproved = myAssignment?.assignment_status === 'approved';
  const isRejected = myAssignment?.assignment_status === 'rejected';

  return (
    <div className="tdp-root">

      {/* ── Back ── */}
      <button className="atd-back-btn" onClick={() => nav(`/dashboard/${roleSlug}/tasks`)}>
        <ArrowLeft size={15} /> My Tasks
      </button>

      {/* ── Header card ── */}
      <div className="tdp-header-card">
        <div className="tdp-header-top">
          <div>
            <h2 className="tdp-title">{task.title}</h2>
            <div className="atd-meta-row" style={{ marginTop: '0.5rem' }}>
              <span className="atd-meta-item"><Calendar size={12} /> Due: {fmtDate(task.deadline)}</span>
              <span className="atd-meta-item"><Clock size={12} /> Created: {fmtDate(task.created_at)}</span>
            </div>
          </div>
          <div className="tdp-badges">
            <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
            <span className={`badge ${STATUS_COLORS[task.status]}`}>{task.status.replace('_',' ')}</span>
          </div>
        </div>

        {/* Feedback banner (if rejected) */}
        {isRejected && myAssignment?.feedback && (
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

        {/* Submit success */}
        {submitOk && (
          <div className="tdp-success-banner">
            <CheckCircle size={15} />
            Task submitted for review. You will be notified once reviewed.
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
              <Upload size={14} /> Submit for Review
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

          {/* Submit form */}
          {submitOpen && (
            <div className="tdp-submit-card">
              <h3 className="tdp-submit-title"><Upload size={16} /> Submit Your Work</h3>
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
    </div>
  );
}
