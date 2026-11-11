import { useEffect, useRef, useState } from 'react';
import {
  Users, ClipboardList, Clock, CheckCircle, XCircle, RefreshCw, AlertCircle,
  Plus, X, Loader2, FileText, AlignLeft, BookOpen, Calendar, UserPlus, Paperclip,
} from 'lucide-react';
import { getMyTeam } from '../../api/role';
import { createTask, uploadTaskFiles } from '../../api/tasks';
import type { TeamMember, TaskPriority } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './SharedPages.css';
import '../admin/AdminTasksPage.css';

interface MyTeamPageProps {
  apiBase: string;
}

function initials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?';
}

export default function MyTeamPage({ apiBase }: MyTeamPageProps) {
  const [team,    setTeam]    = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Task creation panel state
  const [showCreate,    setShowCreate]    = useState(false);
  const [title,         setTitle]         = useState('');
  const [description,   setDescription]   = useState('');
  const [instructions,  setInstructions]  = useState('');
  const [priority,      setPriority]      = useState<TaskPriority>('medium');
  const [deadline,      setDeadline]      = useState('');
  const [deadlineTime,  setDeadlineTime]  = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [attachments,   setAttachments]   = useState<FileList | null>(null);
  const [submitting,    setSubmitting]    = useState(false);
  const [createError,   setCreateError]   = useState('');
  const [createOk,      setCreateOk]      = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true); setError('');
    try   { setTeam(await getMyTeam(apiBase)); }
    catch { setError('Failed to load team data.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [apiBase]);

  const resetCreate = () => {
    setShowCreate(false); setTitle(''); setDescription(''); setInstructions('');
    setPriority('medium'); setDeadline(''); setDeadlineTime('');
    setSelectedUsers([]); setAttachments(null); setCreateError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const toggleUser = (uid: number) =>
    setSelectedUsers(prev => prev.includes(uid) ? prev.filter(x => x !== uid) : [...prev, uid]);

  const handleCreate = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!title.trim()) { setCreateError('Task title is required.'); return; }
    if (selectedUsers.length === 0) { setCreateError('Select at least one team member.'); return; }
    setSubmitting(true); setCreateError('');
    try {
      const res = await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        instructions: instructions.trim() || undefined,
        priority,
        deadline: deadline || undefined,
        deadline_time: deadlineTime || undefined,
        assign_to: selectedUsers,
      });
      if (attachments && attachments.length > 0 && res.task_id) {
        await uploadTaskFiles(res.task_id, Array.from(attachments), 'attachment');
      }
      setCreateOk(true);
      resetCreate();
      load();
      setTimeout(() => setCreateOk(false), 4000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create task.';
      setCreateError(msg);
    } finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner message="Loading your team…" />;

  return (
    <div className="atm-root">
      <PageHeader
        title="My Team"
        subtitle={`${team.length} direct report${team.length !== 1 ? 's' : ''}`}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" onClick={() => { setShowCreate(s => !s); setCreateOk(false); setCreateError(''); }}>
              {showCreate ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Assign Team Task</>}
            </button>
            <button className="btn-secondary" onClick={load}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        }
      />

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {createOk && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          <CheckCircle size={14} /> Task created and assigned to team member(s).
        </div>
      )}

      {/* ── Task creation panel (same layout as admin) ── */}
      {showCreate && (
        <div className="atm-panel">
          <div className="atm-panel-header">
            <div className="atm-panel-header-left">
              <div className="atm-panel-icon"><ClipboardList size={19} /></div>
              <div>
                <h3 className="atm-panel-title">Assign Task to Team</h3>
                <p className="atm-panel-sub">This task is internal to your department — admin can view it but you are the final approver</p>
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
                    placeholder="e.g. Prepare monthly financial report" disabled={submitting} />
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
                    min={new Date().toISOString().split('T')[0]}
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
                    placeholder="Step-by-step instructions for the team member…" disabled={submitting} />
                </div>

                <div className="atm-field atm-field-full">
                  <label className="atm-flabel">
                    <UserPlus size={12} /> Assign to Team Member *
                  </label>
                  <div className="atm-staff-grid">
                    {team.length === 0 && (
                      <p style={{ fontSize: '0.8rem', color: '#9ab09a', margin: 0 }}>No team members yet.</p>
                    )}
                    {team.map(m => {
                      const sel = selectedUsers.includes(m.users_id);
                      return (
                        <button key={m.users_id} type="button"
                          className={`atm-staff-chip${sel ? ' selected' : ''}`}
                          onClick={() => toggleUser(m.users_id)} disabled={submitting}>
                          <span className="chip-avatar">{m.first_name[0]}{m.last_name[0]}</span>
                          <span className="chip-name">{m.first_name} {m.last_name}</span>
                          <span className="chip-role">{m.role_name ?? ''}</span>
                          {sel && <CheckCircle size={13} className="chip-check" />}
                        </button>
                      );
                    })}
                  </div>
                  {selectedUsers.length > 0 && (
                    <p className="atm-assign-count">
                      <Users size={13} /> {selectedUsers.length} member{selectedUsers.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>

                <div className="atm-field atm-field-full">
                  <label className="atm-flabel"><Paperclip size={12} /> Attach Files <span className="atm-flabel-opt">(optional)</span></label>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    className="atm-finput"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt,.zip"
                    onChange={e => setAttachments(e.target.files)}
                    disabled={submitting}
                    style={{ padding: '0.45rem 0.75rem', cursor: 'pointer' }}
                  />
                  {attachments && attachments.length > 0 && (
                    <p style={{ fontSize: '0.78rem', color: '#2D5016', margin: '0.3rem 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Paperclip size={12} /> {attachments.length} file{attachments.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>

              </div>

              <div className="atm-panel-footer">
                <button type="submit" className="atm-submit-btn" disabled={submitting}>
                  {submitting
                    ? <><Loader2 size={15} className="spin" /> Creating…</>
                    : <><CheckCircle size={15} /> Create &amp; Assign</>
                  }
                </button>
                <button type="button" className="atm-cancel-btn" onClick={resetCreate} disabled={submitting}>
                  <X size={15} /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Team members table ── */}
      {team.length === 0 && !error ? (
        <div className="empty-state">
          <Users size={42} />
          <p>No staff members are assigned to you yet.</p>
          <p style={{ fontSize: '0.82rem', color: '#9ab09a' }}>
            Ask admin to set your staff members' manager field.
          </p>
        </div>
      ) : (
        <div className="table-card">
          <table className="saic-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Member</th>
                <th>Role</th>
                <th>Location</th>
                <th style={{ textAlign: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                    <ClipboardList size={13} /> Total
                  </span>
                </th>
                <th style={{ textAlign: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', color: '#283593' }}>
                    <Clock size={13} /> In Progress
                  </span>
                </th>
                <th style={{ textAlign: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', color: '#f57f17' }}>
                    <ClipboardList size={13} /> Submitted
                  </span>
                </th>
                <th style={{ textAlign: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', color: '#2e7d32' }}>
                    <CheckCircle size={13} /> Approved
                  </span>
                </th>
                <th style={{ textAlign: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', color: '#c62828' }}>
                    <XCircle size={13} /> Rejected
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {team.map((m, i) => {
                const location = [m.province, m.district].filter(Boolean).join(', ') || '—';
                return (
                  <tr key={m.staff_id}>
                    <td className="col-num">{i + 1}</td>
                    <td>
                      <div className="sm-staff-cell">
                        <div className="sm-staff-avatar">{initials(m.first_name, m.last_name)}</div>
                        <div>
                          <p className="sm-staff-name">{m.first_name} {m.last_name}</p>
                          <p className="sm-staff-email">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {m.role_name
                        ? <span className="alm-type-badge" style={{ color: '#1a5c38', background: '#e8f5e9', border: '1px solid #c8e6c9' }}>{m.role_name}</span>
                        : <span className="sm-dash">—</span>
                      }
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#6a8c6a' }}>{location}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{m.total_tasks}</td>
                    <td style={{ textAlign: 'center', color: '#283593', fontWeight: 600 }}>{m.in_progress}</td>
                    <td style={{ textAlign: 'center', color: '#f57f17', fontWeight: 600 }}>{m.submitted}</td>
                    <td style={{ textAlign: 'center', color: '#2e7d32', fontWeight: 600 }}>{m.approved}</td>
                    <td style={{ textAlign: 'center', color: '#c62828', fontWeight: 600 }}>{m.rejected}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
