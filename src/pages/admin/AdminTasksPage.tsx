import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, CheckCircle, X } from 'lucide-react';
import { adminGetTasks, adminCreateTask, adminUpdateTask, adminDeleteTask } from '../../api/role';
import type { Task } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import { Card } from '../../components/Common/Card';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../shared/SharedPages.css';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const load = () =>
    adminGetTasks()
      .then(setTasks)
      .catch(() => setError('Failed to load tasks.'))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setTitle(''); setDescription(''); setDeadline('');
    setEditTask(null); setShowForm(false);
    setError(''); setSuccess('');
  };

  const openEdit = (task: Task) => {
    setEditTask(task);
    setTitle(task.title);
    setDescription(task.description ?? '');
    setDeadline(task.deadline ? task.deadline.substring(0, 10) : '');
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    setSubmitting(true); setError(''); setSuccess('');
    try {
      if (editTask) {
        await adminUpdateTask(editTask.id, { title: title.trim(), description: description.trim() || undefined, deadline: deadline || undefined });
        setSuccess('Task updated.');
      } else {
        await adminCreateTask({ title: title.trim(), description: description.trim() || undefined, deadline: deadline || undefined });
        setSuccess('Task created.');
      }
      resetForm();
      setLoading(true); load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Operation failed.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this task?')) return;
    try {
      await adminDeleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError('Failed to delete task.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading tasks…" />;

  return (
    <div>
      <PageHeader
        title="Tasks Management"
        subtitle={`${tasks.length} total tasks`}
        actions={
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={15} /> New Task
          </button>
        }
      />

      {showForm && (
        <Card className="form-card" title={editTask ? 'Edit Task' : 'Create Task'}>
          {success && <div className="alert alert-success"><CheckCircle size={16} />{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit} className="saic-form">
            <div className="form-group">
              <label>Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" disabled={submitting} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" disabled={submitting} />
            </div>
            <div className="form-group">
              <label>Deadline</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} disabled={submitting} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn-primary" disabled={submitting}>
                <CheckCircle size={15} /> {submitting ? 'Saving…' : editTask ? 'Update' : 'Create'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                <X size={15} /> Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="table-card" style={{ marginTop: showForm ? '1rem' : 0 }}>
        <table className="saic-table">
          <thead>
            <tr>
              <th>#</th><th>Title</th><th>Description</th><th>Deadline</th><th>Created</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#a0aec0' }}>No tasks yet.</td></tr>
            )}
            {tasks.map((t, i) => (
              <tr key={t.id}>
                <td>{i + 1}</td>
                <td><strong>{t.title}</strong></td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description ?? '—'}</td>
                <td>{t.deadline ? new Date(t.deadline).toLocaleDateString() : '—'}</td>
                <td>{t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn-secondary" onClick={() => openEdit(t)}><Pencil size={13} />Edit</button>
                    <button className="btn-danger" onClick={() => handleDelete(t.id)}><Trash2 size={13} />Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
