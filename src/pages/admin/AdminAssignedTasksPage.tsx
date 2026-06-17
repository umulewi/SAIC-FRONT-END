import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Trash2, CheckCircle, X } from 'lucide-react';
import { adminGetAssignedTasks, adminGetTasks, adminAssignTask, adminDeleteAssignedTask, adminGetStaff } from '../../api/role';
import type { AssignedTask, Task, StaffMember } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import { Card } from '../../components/Common/Card';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../shared/SharedPages.css';

function formatDate(iso: string | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminAssignedTasksPage() {
  const [assignments, setAssignments] = useState<AssignedTask[]>([]);
  const [tasks,       setTasks]       = useState<Task[]>([]);
  const [staff,       setStaff]       = useState<StaffMember[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [taskId,      setTaskId]      = useState('');
  const [assignedTo,  setAssignedTo]  = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [success,     setSuccess]     = useState('');
  const [error,       setError]       = useState('');

  const load = () =>
    Promise.all([adminGetAssignedTasks(), adminGetTasks(), adminGetStaff()])
      .then(([a, t, s]) => { setAssignments(a); setTasks(t); setStaff(s); })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!taskId || !assignedTo) { setError('Task and staff member are required.'); return; }
    setSubmitting(true); setError(''); setSuccess('');
    try {
      await adminAssignTask({ task_id: Number(taskId), assigned_to: Number(assignedTo) });
      setSuccess('Task assigned successfully.');
      setTaskId(''); setAssignedTo(''); setShowForm(false);
      setLoading(true); load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Assignment failed.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this assignment?')) return;
    try {
      await adminDeleteAssignedTask(id);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError('Failed to remove assignment.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading assignments…" />;

  return (
    <div>
      <PageHeader
        title="Assigned Tasks"
        subtitle={`${assignments.length} assignment${assignments.length !== 1 ? 's' : ''}`}
        actions={
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={15} /> Assign Task
          </button>
        }
      />

      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}><CheckCircle size={16} />{success}</div>}
      {error   && <div className="alert alert-error"   style={{ marginBottom: '1rem' }}>{error}</div>}

      {showForm && (
        <Card className="form-card" title="Assign Task to Staff" style={{ marginBottom: '1rem' }}>
          <form onSubmit={handleSubmit} className="saic-form">
            <div className="form-group">
              <label>Select Task *</label>
              <select value={taskId} onChange={(e) => setTaskId(e.target.value)} disabled={submitting}>
                <option value="">— Choose a task —</option>
                {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Assign To *</label>
              <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} disabled={submitting}>
                <option value="">— Choose a staff member —</option>
                {staff.map((s) => (
                  <option key={s.users_id} value={s.users_id}>
                    {s.first_name} {s.last_name} — {s.role_name ?? s.email}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn-primary" disabled={submitting}>
                <CheckCircle size={15} /> {submitting ? 'Assigning…' : 'Assign'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                <X size={15} /> Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="table-card">
        <table className="saic-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Task</th>
              <th>Assigned To</th>
              <th>User Email</th>
              <th>Assigned Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#a0aec0' }}>
                  No assignments yet.
                </td>
              </tr>
            )}
            {assignments.map((a, i) => (
              <tr key={a.id}>
                <td>{i + 1}</td>
                <td><strong>{a.task_title}</strong></td>
                <td>{a.assigned_to}</td>
                <td>{a.assigned_user_email ?? '—'}</td>
                <td>{formatDate(a.assigned_at)}</td>
                <td>
                  <button className="btn-danger" onClick={() => handleDelete(a.id!)}>
                    <Trash2 size={13} /> Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
