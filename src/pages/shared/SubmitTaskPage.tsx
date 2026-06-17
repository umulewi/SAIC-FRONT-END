import { useEffect, useState, type FormEvent } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { getAssignedTasks, submitTask } from '../../api/role';
import type { AssignedTask } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import { Card } from '../../components/Common/Card';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './SharedPages.css';

interface SubmitTaskPageProps { apiBase: string; }

export default function SubmitTaskPage({ apiBase }: SubmitTaskPageProps) {
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [taskId, setTaskId] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    getAssignedTasks(apiBase)
      .then(setTasks)
      .catch(() => setError('Failed to load tasks.'))
      .finally(() => setLoading(false));
  }, [apiBase]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!taskId) { setError('Please select a task.'); return; }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await submitTask(apiBase, { task_id: Number(taskId), comment: comment.trim() || undefined });
      setSuccess('Task submitted successfully!');
      setTaskId('');
      setComment('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Submission failed.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading tasks…" />;

  return (
    <div>
      <PageHeader title="Submit Task" subtitle="Submit your completed task for review" />

      <Card className="form-card">
        {success && (
          <div className="alert alert-success">
            <CheckCircle size={16} /> {success}
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="saic-form">
          <div className="form-group">
            <label htmlFor="task-select">Select Task *</label>
            <select
              id="task-select"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              disabled={submitting}
            >
              <option value="">— Choose a task —</option>
              {tasks.map((t) => (
                <option key={t.task_id} value={t.task_id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="comment">Comment / Notes</label>
            <textarea
              id="comment"
              rows={4}
              placeholder="Describe what you completed or any notes for the reviewer…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submitting}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={submitting || !taskId}>
            <Send size={15} />
            {submitting ? 'Submitting…' : 'Submit Task'}
          </button>
        </form>
      </Card>
    </div>
  );
}
