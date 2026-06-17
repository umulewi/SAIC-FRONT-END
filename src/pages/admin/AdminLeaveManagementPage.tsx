import { useEffect, useState } from 'react';
import { Pencil, RefreshCw, X } from 'lucide-react';
import { adminGetLeaveRequests, adminUpdateLeaveStatus } from '../../api/role';
import type { LeaveRequest } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../shared/SharedPages.css';

// DB enum values (lowercase)
const STATUS_OPTS = ['approved', 'rejected', 'pending'] as const;
type LeaveStatus = typeof STATUS_OPTS[number];

const STATUS_CLASS: Record<string, string> = {
  approved: 'badge-approved',
  rejected: 'badge-rejected',
  pending:  'badge-pending',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface EditState {
  id: number;
  email: string;
  currentStatus: string;
  selectedStatus: LeaveStatus;
}

export default function AdminLeaveManagementPage() {
  const [leaves, setLeaves]   = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit]       = useState<EditState | null>(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    adminGetLeaveRequests()
      .then(setLeaves)
      .catch(() => setError('Failed to load leave requests.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openEdit = (l: LeaveRequest) => {
    const cur = (l.status ?? 'pending') as LeaveStatus;
    setEdit({
      id: l.id!,
      email: l.email ?? `User #${l.users_id}`,
      currentStatus: cur,
      selectedStatus: cur,
    });
    setError('');
  };

  const handleSave = async () => {
    if (!edit) return;
    setSaving(true);
    setError('');
    try {
      await adminUpdateLeaveStatus(edit.id, edit.selectedStatus);
      setLeaves((prev) =>
        prev.map((l) => l.id === edit.id ? { ...l, status: edit.selectedStatus } : l)
      );
      setEdit(null);
    } catch {
      setError('Failed to update leave status.');
    } finally {
      setSaving(false);
    }
  };

  const pending = leaves.filter((l) => !l.status || l.status === 'pending').length;

  if (loading) return <LoadingSpinner message="Loading leave requests…" />;

  return (
    <div>
      <PageHeader
        title="Leave Management"
        subtitle={`${leaves.length} total · ${pending} pending`}
        actions={
          <button className="btn-secondary" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="table-card">
        <table className="saic-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Staff Email</th>
              <th>Role</th>
              <th>Reason</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Requested</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#a0aec0' }}>
                  No leave requests found.
                </td>
              </tr>
            )}
            {leaves.map((l, i) => (
              <tr key={l.id}>
                <td>{i + 1}</td>
                <td>{l.email ?? `User #${l.users_id}`}</td>
                <td>{l.role_name ?? '—'}</td>
                <td style={{ maxWidth: 200 }}>{l.reason}</td>
                <td>{l.start_date ? formatDate(l.start_date) : '—'}</td>
                <td>{l.end_date   ? formatDate(l.end_date)   : '—'}</td>
                <td>{l.requested_at ? formatDate(l.requested_at) : '—'}</td>
                <td>
                  <span className={`status-badge ${STATUS_CLASS[l.status ?? 'pending'] ?? 'badge-pending'}`}>
                    {l.status ?? 'pending'}
                  </span>
                </td>
                <td>
                  <button className="btn-secondary" onClick={() => openEdit(l)}>
                    <Pencil size={13} /> Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Update status modal */}
      {edit && (
        <div className="leave-modal-overlay" onClick={() => setEdit(null)}>
          <div className="leave-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Update Leave Status</h3>
            <p>{edit.email}</p>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: '0.4rem' }}>
                New Status
              </label>
              <select
                value={edit.selectedStatus}
                onChange={(e) => setEdit({ ...edit, selectedStatus: e.target.value as LeaveStatus })}
                disabled={saving}
              >
                {STATUS_OPTS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="leave-modal-actions">
              <button className="btn-secondary" onClick={() => setEdit(null)} disabled={saving}>
                <X size={13} /> Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={saving || edit.selectedStatus === edit.currentStatus}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
