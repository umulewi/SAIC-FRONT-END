import { useEffect, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { getLeaveStatus } from '../../api/role';
import type { LeaveRequest } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import { Card } from '../../components/Common/Card';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './SharedPages.css';

interface LeaveStatusPageProps { apiBase: string; }

const STATUS_CLASS: Record<string, string> = {
  approved: 'badge-approved',
  rejected: 'badge-rejected',
  pending:  'badge-pending',
};

function formatDate(iso: string | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function LeaveStatusPage({ apiBase }: LeaveStatusPageProps) {
  const [leaves, setLeaves]   = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getLeaveStatus(apiBase)
      .then(setLeaves)
      .catch(() => setError('Failed to load leave requests.'))
      .finally(() => setLoading(false));
  }, [apiBase]);

  if (loading) return <LoadingSpinner message="Loading leave requests…" />;
  if (error)   return <div className="page-error">{error}</div>;

  return (
    <div>
      <PageHeader
        title="Leave Status"
        subtitle={`${leaves.length} leave request${leaves.length !== 1 ? 's' : ''}`}
      />

      {leaves.length === 0 ? (
        <Card>
          <div className="empty-state">
            <CalendarCheck size={40} />
            <p>No leave requests submitted yet.</p>
          </div>
        </Card>
      ) : (
        <div className="table-card">
          <table className="saic-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Reason</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Requested</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave, i) => {
                const status = (leave.status ?? 'pending').toLowerCase();
                return (
                  <tr key={leave.id}>
                    <td>{i + 1}</td>
                    <td>{leave.reason}</td>
                    <td>{formatDate(leave.start_date)}</td>
                    <td>{formatDate(leave.end_date)}</td>
                    <td>{formatDate(leave.requested_at)}</td>
                    <td>
                      <span className={`status-badge ${STATUS_CLASS[status] ?? 'badge-pending'}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
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
