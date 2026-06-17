import { useEffect, useState } from 'react';
import { ClipboardList, Clock, Calendar } from 'lucide-react';
import { getAssignedTasks } from '../../api/role';
import type { AssignedTask } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import { Card } from '../../components/Common/Card';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './SharedPages.css';

interface MyTasksPageProps { apiBase: string; }

export default function MyTasksPage({ apiBase }: MyTasksPageProps) {
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAssignedTasks(apiBase)
      .then(setTasks)
      .catch(() => setError('Failed to load tasks.'))
      .finally(() => setLoading(false));
  }, [apiBase]);

  if (loading) return <LoadingSpinner message="Loading tasks…" />;
  if (error) return <div className="page-error">{error}</div>;

  const isOverdue = (deadline?: string) =>
    deadline ? new Date(deadline) < new Date() : false;

  return (
    <div>
      <PageHeader
        title="My Tasks"
        subtitle={`${tasks.length} task${tasks.length !== 1 ? 's' : ''} assigned to you`}
      />

      {tasks.length === 0 ? (
        <Card>
          <div className="empty-state">
            <ClipboardList size={40} />
            <p>No tasks assigned to you yet.</p>
          </div>
        </Card>
      ) : (
        <div className="tasks-list">
          {tasks.map((task) => {
            const overdue = isOverdue(task.deadline);
            return (
              <Card key={task.assignment_id ?? task.task_id} className="task-card">
                <div className="task-header">
                  <h3 className="task-title">{task.title}</h3>
                  {task.deadline && (
                    <span className={`task-deadline ${overdue ? 'overdue' : ''}`}>
                      <Calendar size={13} />
                      {overdue ? 'Overdue: ' : 'Due: '}
                      {new Date(task.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="task-desc">{task.description}</p>
                )}
                <div className="task-meta">
                  <span className="task-meta-item">
                    <Clock size={12} />
                    Assigned: {new Date(task.created_at ?? '').toLocaleDateString()}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
