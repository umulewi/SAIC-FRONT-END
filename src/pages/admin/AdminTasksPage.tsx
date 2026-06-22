import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Filter, ChevronLeft, ChevronRight, Eye,
  Trash2, X, CheckCircle, Loader2, Users, Calendar, AlertCircle,
  ClipboardList, UserPlus, FileText, AlignLeft, BookOpen, Clock,
} from 'lucide-react';
import { getTasks, createTask, deleteTask } from '../../api/tasks';
import { adminGetStaff } from '../../api/role';
import type { EnhancedTask, TaskPriority, StaffMember, WorkflowStage } from '../../types';
import { WORKFLOW_LABELS, WORKFLOW_BADGE } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../shared/SharedPages.css';
import './AdminTasksPage.css';

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'badge-low', medium: 'badge-medium', high: 'badge-high', urgent: 'badge-urgent',
};

function fmtDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function isOverdue(deadline?: string, stage?: WorkflowStage) {
  if (!deadline || stage === 'completed') return false;
  return new Date(deadline) < new Date();
}

export default function AdminTasksPage() {
  const nav = useNavigate();

  const [tasks,   setTasks]   = useState<EnhancedTask[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const [search,         setSearch]         = useState('');
  const [filterStage,    setFilterStage]    = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const LIMIT = 10;

  const [showCreate,   setShowCreate]   = useState(false);
  const [title,        setTitle]        = useState('');
  const [description,  setDescription]  = useState('');
  const [priority,     setPriority]     = useState<TaskPriority>('medium');
  const [instructions, setInstructions] = useState('');
  const [deadline,     setDeadline]     = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [selectedUsers,setSelectedUsers]= useState<number[]>([]);
  const [staff,        setStaff]        = useState<StaffMember[]>([]);
  const [submitting,   setSubmitting]   = useState(false);
  const [createError,  setCreateError]  = useState('');

  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  // Only show Department Managers in the assignee list (admin tasks go to managers first)
  const managerStaff = staff.filter(s => (s.role_name ?? '').endsWith('Manager'));

  const load = async (p = page) => {
    setLoading(true); setError('');
    try {
      const res = await getTasks({ workflow_stage: filterStage, priority: filterPriority, search, page: p, limit: LIMIT });
      setTasks(res.tasks); setTotal(res.total);
    } catch {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); setPage(1); }, [filterStage, filterPriority]);
  useEffect(() => { load(page); }, [page]);

  const openCreate = async () => {
    setShowCreate(true);
    if (staff.length === 0) {
      try { setStaff(await adminGetStaff()); } catch { /* ignore */ }
    }
  };

  const resetCreate = () => {
    setShowCreate(false); setTitle(''); setDescription(''); setPriority('medium');
    setInstructions(''); setDeadline(''); setDeadlineTime(''); setSelectedUsers([]); setCreateError('');
  };

  const toggleUser = (uid: number) =>
    setSelectedUsers(prev => prev.includes(uid) ? prev.filter(x => x !== uid) : [...prev, uid]);

  const handleCreate = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!title.trim()) { setCreateError('Title is required.'); return; }
    setSubmitting(true); setCreateError('');
    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        instructions: instructions.trim() || undefined,
        deadline: deadline || undefined,
        deadline_time: deadlineTime || undefined,
        assign_to: selectedUsers,
      });
      resetCreate(); load(1); setPage(1);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create task.';
      setCreateError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await deleteTask(deleteTarget.id); setDeleteTarget(null); load(page); }
    catch { setError('Failed to delete task.'); setDeleteTarget(null); }
    finally { setDeleting(false); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="atm-root">
      <PageHeader
        title="Task Management"
        subtitle={`${total} total task${total !== 1 ? 's' : ''}`}
        actions={<button className="btn-primary" onClick={openCreate}><Plus size={15} /> New Task</button>}
      />

      {/* ── Filters ── */}
      <div className="atm-filters">
        <div className="atm-search-box">
          <Search size={15} className="atm-search-icon" />
          <input className="atm-search-input" placeholder="Search tasks…" value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { load(1); setPage(1); } }} />
          {search && (
            <button className="atm-search-clear" onClick={() => { setSearch(''); load(1); setPage(1); }}>
              <X size={13} />
            </button>
          )}
        </div>
        <div className="atm-filter-group">
          <Filter size={14} style={{ color: '#6a8c6a' }} />
          <select className="atm-select" value={filterStage} onChange={e => setFilterStage(e.target.value)}>
            <option value="">All Stages</option>
            <option value="draft">Draft</option>
            <option value="pending_manager">Awaiting Manager</option>
            <option value="pending_team">In Progress</option>
            <option value="pending_manager_review">Manager Review</option>
            <option value="pending_admin_review">Admin Review</option>
            <option value="completed">Completed</option>
            <option value="rejected_to_manager">Returned to Manager</option>
          </select>
          <select className="atm-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* ── Create Task Panel ── */}
      {showCreate && (
        <div className="atm-panel">
          <div className="atm-panel-header">
            <div className="atm-panel-header-left">
              <div className="atm-panel-icon"><ClipboardList size={19} /></div>
              <div>
                <h3 className="atm-panel-title">Create New Task</h3>
                <p className="atm-panel-sub">Assign to a Department Manager — they will delegate to their team</p>
              </div>
            </div>
            <button className="atm-panel-close" onClick={resetCreate} type="button"><X size={18} /></button>
          </div>
          <div className="atm-panel-body">
            {createError && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={14} />{createError}
              </div>
            )}
            <form onSubmit={handleCreate}>
              <div className="atm-field-grid">
                <div className="atm-field atm-field-full">
                  <label className="atm-flabel"><FileText size={12} /> Task Title *</label>
                  <input className="atm-finput" value={title}
                    onChange={e => { setTitle(e.target.value); setCreateError(''); }}
                    placeholder="e.g. Prepare quarterly report" disabled={submitting} />
                </div>

                <div className="atm-field atm-field-full">
                  <label className="atm-flabel">Priority Level</label>
                  <div className="atm-priority-pills">
                    {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map(p => (
                      <button key={p} type="button"
                        className={`atm-priority-pill atm-p-${p}${priority === p ? ' active' : ''}`}
                        onClick={() => setPriority(p)} disabled={submitting}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="atm-field">
                  <label className="atm-flabel"><Calendar size={12} /> Due Date</label>
                  <input type="date" className="atm-finput" value={deadline}
                    onChange={e => setDeadline(e.target.value)} disabled={submitting} />
                </div>
                <div className="atm-field">
                  <label className="atm-flabel"><Clock size={12} /> Due Time <span className="atm-flabel-opt">(optional)</span></label>
                  <input type="time" className="atm-finput" value={deadlineTime}
                    onChange={e => setDeadlineTime(e.target.value)} disabled={submitting} />
                </div>

                <div className="atm-field atm-field-full">
                  <label className="atm-flabel"><AlignLeft size={12} /> Description</label>
                  <textarea className="atm-finput atm-ftextarea" rows={2} value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Brief overview of what this task is about…" disabled={submitting} />
                </div>

                <div className="atm-field atm-field-full">
                  <label className="atm-flabel"><BookOpen size={12} /> Instructions / Details</label>
                  <textarea className="atm-finput atm-ftextarea" rows={3} value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    placeholder="Step-by-step instructions for the assignee…" disabled={submitting} />
                </div>

                <div className="atm-field atm-field-full">
                  <label className="atm-flabel">
                    <UserPlus size={12} /> Assign to Manager
                    <span className="atm-flabel-opt"> (manager will then assign to their team)</span>
                  </label>
                  <div className="atm-staff-grid">
                    {managerStaff.map(s => {
                      const uid = s.users_id;
                      const sel = selectedUsers.includes(uid);
                      return (
                        <button key={uid} type="button"
                          className={`atm-staff-chip${sel ? ' selected' : ''}`}
                          onClick={() => toggleUser(uid)} disabled={submitting}>
                          <span className="chip-avatar">{s.first_name[0]}{s.last_name[0]}</span>
                          <span className="chip-name">{s.first_name} {s.last_name}</span>
                          <span className="chip-role">{s.role_name ?? ''}</span>
                          {sel && <CheckCircle size={13} className="chip-check" />}
                        </button>
                      );
                    })}
                    {staff.length === 0 && <p style={{ fontSize: '0.8rem', color: '#9ab09a', margin: 0 }}>Loading managers…</p>}
                    {staff.length > 0 && managerStaff.length === 0 && <p style={{ fontSize: '0.8rem', color: '#9ab09a', margin: 0 }}>No managers registered yet.</p>}
                  </div>
                  {selectedUsers.length > 0 && (
                    <p className="atm-assign-count">
                      <Users size={13} /> {selectedUsers.length} manager{selectedUsers.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              </div>

              <div className="atm-panel-footer">
                <button type="submit" className="atm-submit-btn" disabled={submitting}>
                  {submitting ? <><Loader2 size={15} className="spin" /> Creating…</> : <><CheckCircle size={15} /> Create Task</>}
                </button>
                <button type="button" className="atm-cancel-btn" onClick={resetCreate} disabled={submitting}>
                  <X size={15} /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && <div className="alert alert-error" style={{ margin: '1rem 0' }}><AlertCircle size={15} />{error}</div>}
      {loading ? <LoadingSpinner message="Loading tasks…" /> : (
        <>
          <div className="table-card">
            <table className="saic-table">
              <thead>
                <tr>
                  <th>#</th><th>Title</th><th>Priority</th><th>Stage</th>
                  <th>Assignees</th><th>Due Date</th><th>Created</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 && (
                  <tr><td colSpan={8}>
                    <div className="empty-state"><ClipboardList size={38} /><p>No tasks found. Create one to get started.</p></div>
                  </td></tr>
                )}
                {tasks.map((t, i) => {
                  const stage   = t.workflow_stage;
                  const overdue = isOverdue(t.deadline, stage);
                  const stageBadge = stage ? WORKFLOW_BADGE[stage] : 'badge-draft';
                  const stageLabel = stage ? WORKFLOW_LABELS[stage] : t.status.replace('_', ' ');
                  return (
                    <tr key={t.id} className={overdue ? 'row-overdue' : ''}>
                      <td className="col-num">{(page - 1) * LIMIT + i + 1}</td>
                      <td>
                        <div className="task-title-cell">
                          <strong>{t.title}</strong>
                          {t.description && <span className="task-desc-preview">{t.description}</span>}
                        </div>
                      </td>
                      <td><span className={`badge ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span></td>
                      <td>
                        <span className={`badge ${stageBadge}`}>{stageLabel}</span>
                        {t.scope === 'team_only' && (
                          <span style={{ marginLeft: 4, fontSize: '0.7rem', fontWeight: 700, color: '#7b5ea7', background: '#f3eeff', padding: '1px 6px', borderRadius: 8, border: '1px solid #d4bbff' }}>Team</span>
                        )}
                      </td>
                      <td>
                        <div className="atm-assignee-cell">
                          {t.assignee_names
                            ? t.assignee_names.split('|').slice(0, 2).map((name, idx) => (
                                <span key={idx} className="atm-name-pill">{name}</span>
                              ))
                            : null}
                          {(t.assignee_count ?? 0) === 0 && <span className="atm-no-assignee">Unassigned</span>}
                          {(t.assignee_count ?? 0) > 2 && (
                            <span className="atm-assignee-more">+{(t.assignee_count ?? 0) - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={overdue ? 'overdue-text' : ''}>
                          {t.deadline ? fmtDate(t.deadline) : '—'}{overdue && ' ⚠'}
                        </span>
                      </td>
                      <td>{fmtDate(t.created_at)}</td>
                      <td>
                        <div className="table-actions">
                          <button className="btn-secondary" onClick={() => nav(`/dashboard/admin/tasks/${t.id}`)}>
                            <Eye size={13} /> View
                          </button>
                          <button className="btn-danger" onClick={() => setDeleteTarget({ id: t.id, title: t.title })}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="atm-pagination">
              <button className="atm-pg-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={15} />
              </button>
              <span className="atm-pg-info">Page {page} of {totalPages}</span>
              <button className="atm-pg-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="atd-modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="atd-modal" role="dialog" style={{ maxWidth: 420, textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fff0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.25rem' }}>
                <Trash2 size={26} style={{ color: '#c0392b' }} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1a1a1a' }}>Delete Task?</h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#9ab09a' }}>This action is permanent and cannot be reversed</p>
            </div>
            <div style={{ background: '#f9f9f9', border: '1px solid #e8e8e8', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#4a5568' }}>
                You are about to permanently delete{' '}
                <strong style={{ color: '#1a1a1a' }}>"{deleteTarget.title}"</strong>.
                All comments, files, and assignments will be lost.
              </p>
            </div>
            <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 7, padding: '0.5rem 0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={14} style={{ color: '#c0392b', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', color: '#c0392b' }}>This cannot be undone. Please confirm carefully.</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}
                style={{ flex: 1 }}>
                <X size={14} /> Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex: 1, background: 'linear-gradient(135deg,#c0392b,#96281b)', color: '#fff', border: 'none', borderRadius: 9, padding: '0.6rem 1rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                {deleting ? <><Loader2 size={14} className="spin" /> Deleting…</> : <><Trash2 size={14} /> Yes, Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
