import { useEffect, useState, useRef } from 'react';
import {
  RefreshCw, Search, Filter, CheckCircle, XCircle,
  Clock, AlertCircle, CalendarCheck, X, Users,
  TrendingUp, Loader2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { adminGetLeaveRequests, adminGetLeaveStats, adminUpdateLeaveStatus } from '../../api/role';
import type { LeaveRequest, LeaveStats, LeaveTypeCount } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../shared/SharedPages.css';
import './AdminLeaveManagementPage.css';

const LEAVE_TYPE_OPTS = [
  { value: '',          label: 'All Types'  },
  { value: 'annual',    label: 'Annual'     },
  { value: 'sick',      label: 'Sick'       },
  { value: 'maternity', label: 'Maternity'  },
  { value: 'paternity', label: 'Paternity'  },
  { value: 'emergency', label: 'Emergency'  },
  { value: 'unpaid',    label: 'Unpaid'     },
  { value: 'other',     label: 'Other'      },
];

const TYPE_COLOR: Record<string, string> = {
  annual: '#2D5016', sick: '#1565c0', maternity: '#6a1b9a',
  paternity: '#0277bd', emergency: '#c62828', unpaid: '#757575', other: '#ef6c00',
};

function parseOtherLabel(reason: string) {
  const m = reason.match(/^\[(.+?)\]\s+/);
  return m ? { label: m[1], text: reason.slice(m[0].length) } : { label: 'Other', text: reason };
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function initials(first?: string, last?: string, email?: string) {
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  return (email?.[0] ?? '?').toUpperCase();
}

export default function AdminLeaveManagementPage() {
  const [leaves,   setLeaves]   = useState<LeaveRequest[]>([]);
  const [stats,    setStats]    = useState<LeaveStats | null>(null);
  const [byType,   setByType]   = useState<LeaveTypeCount[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  // Filters
  const [filterStatus,    setFilterStatus]    = useState('');
  const [filterLeaveType, setFilterLeaveType] = useState('');
  const [search,          setSearch]          = useState('');

  // Pagination
  const [leavePage, setLeavePage] = useState(1);
  const PAGE_SIZE = 10;

  // Approve modal state
  const [approveTarget, setApproveTarget] = useState<LeaveRequest | null>(null);

  // Reject modal state
  const [rejectTarget,  setRejectTarget]  = useState<LeaveRequest | null>(null);
  const [rejectReason,  setRejectReason]  = useState('');
  const [rejectError,   setRejectError]   = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  const loadAll = async (filters?: { status?: string; leave_type?: string; search?: string }) => {
    setLoading(true); setError('');
    try {
      const [lv, { stats: s, by_type }] = await Promise.all([
        adminGetLeaveRequests(filters),
        adminGetLeaveStats(),
      ]);
      setLeaves(lv); setStats(s); setByType(by_type); setLeavePage(1);
    } catch {
      setError('Failed to load leave data.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    loadAll({ status: filterStatus, leave_type: filterLeaveType, search });
  }, [filterStatus, filterLeaveType]);

  const handleSearch = () => {
    loadAll({ status: filterStatus, leave_type: filterLeaveType, search });
  };

  const clearSearch = () => {
    setSearch('');
    loadAll({ status: filterStatus, leave_type: filterLeaveType, search: '' });
  };

  const openApprove = (l: LeaveRequest) => setApproveTarget(l);

  const doApprove = async () => {
    if (!approveTarget?.id) return;
    setActionLoading(approveTarget.id);
    try {
      await adminUpdateLeaveStatus(approveTarget.id, 'approved');
      setApproveTarget(null);
      loadAll({ status: filterStatus, leave_type: filterLeaveType, search });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to approve.';
      setError(msg);
      setApproveTarget(null);
    } finally { setActionLoading(null); }
  };

  const openReject = (l: LeaveRequest) => {
    setRejectTarget(l); setRejectReason(''); setRejectError('');
  };

  const doReject = async () => {
    if (!rejectTarget?.id) return;
    if (!rejectReason.trim()) { setRejectError('Rejection reason is required.'); return; }
    setActionLoading(rejectTarget.id);
    try {
      await adminUpdateLeaveStatus(rejectTarget.id, 'rejected', rejectReason.trim());
      setRejectTarget(null);
      loadAll({ status: filterStatus, leave_type: filterLeaveType, search });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to reject.';
      setRejectError(msg);
    } finally { setActionLoading(null); }
  };

  const totalPages = Math.ceil(leaves.length / PAGE_SIZE);
  const paged = leaves.slice((leavePage - 1) * PAGE_SIZE, leavePage * PAGE_SIZE);

  return (
    <div className="alm-root">
      <PageHeader
        title="Leave Management"
        subtitle="Review and action all staff leave requests"
        actions={
          <button className="btn-secondary" onClick={() => loadAll({ status: filterStatus, leave_type: filterLeaveType, search })}>
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}><AlertCircle size={14} />{error}</div>}

      {/* ── Stats cards ── */}
      {stats && (
        <div className="alm-stats-row">
          {[
            { label: 'Total Requests', val: stats.total,    icon: <CalendarCheck size={20} />, color: '#1e3a1e', bg: '#f0f7f0', border: '#c8dfc8' },
            { label: 'Pending',        val: stats.pending,  icon: <Clock size={20} />,         color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
            { label: 'Approved',       val: stats.approved, icon: <CheckCircle size={20} />,   color: '#276749', bg: '#f0faf4', border: '#c6f0d8' },
            { label: 'Rejected',       val: stats.rejected, icon: <XCircle size={20} />,       color: '#c53030', bg: '#fff5f5', border: '#fed7d7' },
            { label: 'Upcoming',       val: stats.upcoming, icon: <TrendingUp size={20} />,    color: '#1565c0', bg: '#e3f2fd', border: '#bbdefb' },
            { label: 'Staff on Leave', val: byType.length,  icon: <Users size={20} />,         color: '#6a1b9a', bg: '#f3e5f5', border: '#ce93d8' },
          ].map(s => (
            <div key={s.label} className="alm-stat-card" style={{ background: s.bg, borderColor: s.border }}>
              <div className="alm-stat-icon" style={{ color: s.color }}>{s.icon}</div>
              <div>
                <p className="alm-stat-val" style={{ color: s.color }}>{s.val}</p>
                <p className="alm-stat-lbl">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="alm-filters">
        <div className="atm-search-box" style={{ flex: 1, minWidth: 200, maxWidth: 360 }}>
          <Search size={15} className="atm-search-icon" />
          <input ref={searchRef} className="atm-search-input" placeholder="Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          {search && <button className="atm-search-clear" onClick={clearSearch}><X size={13} /></button>}
        </div>
        <div className="alm-filter-group">
          <Filter size={14} style={{ color: '#6a8c6a' }} />
          <select className="atm-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select className="atm-select" value={filterLeaveType} onChange={e => setFilterLeaveType(e.target.value)}>
            {LEAVE_TYPE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? <LoadingSpinner message="Loading leave requests…" /> : (
        <>
          <div className="table-card">
            <table className="saic-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Staff</th>
                  <th>Leave Type</th>
                  <th>Period</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty-state"><CalendarCheck size={38} /><p>No leave requests match your filters.</p></div>
                    </td>
                  </tr>
                )}
                {paged.map((l, i) => {
                  const status    = (l.status ?? 'pending').toLowerCase();
                  const lType     = l.leave_type ?? 'annual';
                  const tColor    = TYPE_COLOR[lType] ?? '#2D5016';
                  const fullName  = l.first_name && l.last_name ? `${l.first_name} ${l.last_name}` : undefined;
                  const isPending = status === 'pending';
                  const isLoading = actionLoading === l.id;
                  return (
                    <tr key={l.id} className={status === 'rejected' ? 'row-rejected' : status === 'approved' ? 'row-approved' : ''}>
                      <td className="col-num">{(leavePage - 1) * PAGE_SIZE + i + 1}</td>
                      <td>
                        <div className="alm-staff-cell">
                          <div className="alm-avatar">
                            {l.profile_photo
                              ? <img src={`/uploads/${l.profile_photo}`} alt="" className="alm-avatar-img" />
                              : initials(l.first_name, l.last_name, l.email)
                            }
                          </div>
                          <div>
                            <p className="alm-staff-name">{fullName ?? l.email}</p>
                            {fullName && <p className="alm-staff-email">{l.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="alm-type-badge" style={{ color: tColor, background: `${tColor}14`, border: `1px solid ${tColor}30` }}>
                          {lType === 'other' ? parseOtherLabel(l.reason).label : lType.charAt(0).toUpperCase() + lType.slice(1)}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                        <span>{fmtDate(l.start_date)}</span><br />
                        <span style={{ color: '#9ab09a', fontSize: '0.75rem' }}>to {fmtDate(l.end_date)}</span>
                      </td>
                      <td>
                        <span className="alm-days-pill">{l.days_count ?? '?'} day{(l.days_count ?? 1) !== 1 ? 's' : ''}</span>
                      </td>
                      <td>
                        <span className="alm-reason-text">{lType === 'other' ? parseOtherLabel(l.reason).text : l.reason}</span>
                        {l.rejection_reason && (
                          <p className="alm-rejection-note"><XCircle size={11} /> {l.rejection_reason}</p>
                        )}
                      </td>
                      <td style={{ fontSize: '0.78rem', color: '#6a8c6a', whiteSpace: 'nowrap' }}>
                        {fmtDate(l.created_at)}
                      </td>
                      <td>
                        {status === 'pending'  && <span className="alm-status-badge alm-status-pending"><Clock size={11} /> Pending</span>}
                        {status === 'approved' && <span className="alm-status-badge alm-status-approved"><CheckCircle size={11} /> Approved</span>}
                        {status === 'rejected' && <span className="alm-status-badge alm-status-rejected"><XCircle size={11} /> Rejected</span>}
                      </td>
                      <td>
                        {isPending ? (
                          <div className="alm-action-btns">
                            <button className="alm-btn-approve" onClick={() => openApprove(l)} disabled={isLoading}>
                              {isLoading ? <Loader2 size={12} className="spin" /> : <CheckCircle size={12} />} Approve
                            </button>
                            <button className="alm-btn-reject" onClick={() => openReject(l)} disabled={isLoading}>
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#b0c8b0' }}>
                            {l.approved_by_name ?? 'Reviewed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="atm-pagination">
              <button className="atm-pg-btn" disabled={leavePage <= 1} onClick={() => setLeavePage(p => p - 1)}>
                <ChevronLeft size={15} />
              </button>
              <span className="atm-pg-info">Page {leavePage} of {totalPages} ({leaves.length} requests)</span>
              <button className="atm-pg-btn" disabled={leavePage >= totalPages} onClick={() => setLeavePage(p => p + 1)}>
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Approve modal ── */}
      {approveTarget && (
        <div className="leave-modal-overlay" onClick={e => e.target === e.currentTarget && setApproveTarget(null)}>
          <div className="leave-modal alm-reject-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#1e3a1e', fontSize: '1.05rem' }}>Approve Leave Request</h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#718096' }}>
                  {approveTarget.first_name && approveTarget.last_name
                    ? `${approveTarget.first_name} ${approveTarget.last_name} · `
                    : ''}{approveTarget.email}
                </p>
              </div>
              <button className="atm-close-btn" onClick={() => setApproveTarget(null)}><X size={16} /></button>
            </div>

            <div className="alm-reject-info">
              <span className="alm-type-badge" style={{
                color: TYPE_COLOR[approveTarget.leave_type ?? 'annual'] ?? '#2D5016',
                background: `${TYPE_COLOR[approveTarget.leave_type ?? 'annual'] ?? '#2D5016'}14`,
                border: `1px solid ${TYPE_COLOR[approveTarget.leave_type ?? 'annual'] ?? '#2D5016'}30`,
              }}>
                {(approveTarget.leave_type ?? 'annual').charAt(0).toUpperCase() + (approveTarget.leave_type ?? 'annual').slice(1)}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#4a5568' }}>
                {fmtDate(approveTarget.start_date)} — {fmtDate(approveTarget.end_date)}
                {approveTarget.days_count && ` (${approveTarget.days_count} day${approveTarget.days_count !== 1 ? 's' : ''})`}
              </span>
            </div>

            <p style={{ margin: '0.5rem 0 1rem', fontSize: '0.85rem', color: '#4a5568' }}>
              Are you sure you want to approve this leave request? The staff member will be notified.
            </p>

            <div className="leave-modal-actions">
              <button className="btn-secondary" onClick={() => setApproveTarget(null)} disabled={!!actionLoading}>
                <X size={13} /> Cancel
              </button>
              <button className="alm-btn-approve" onClick={doApprove} disabled={!!actionLoading} style={{ minWidth: 130 }}>
                {actionLoading ? <Loader2 size={13} className="spin" /> : <CheckCircle size={13} />}
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject modal ── */}
      {rejectTarget && (
        <div className="leave-modal-overlay" onClick={e => e.target === e.currentTarget && setRejectTarget(null)}>
          <div className="leave-modal alm-reject-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#1e3a1e', fontSize: '1.05rem' }}>Reject Leave Request</h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#718096' }}>
                  {rejectTarget.first_name && rejectTarget.last_name
                    ? `${rejectTarget.first_name} ${rejectTarget.last_name} · `
                    : ''}{rejectTarget.email}
                </p>
              </div>
              <button className="atm-close-btn" onClick={() => setRejectTarget(null)}><X size={16} /></button>
            </div>

            <div className="alm-reject-info">
              <span className="alm-type-badge" style={{
                color: TYPE_COLOR[rejectTarget.leave_type ?? 'annual'] ?? '#2D5016',
                background: `${TYPE_COLOR[rejectTarget.leave_type ?? 'annual'] ?? '#2D5016'}14`,
                border: `1px solid ${TYPE_COLOR[rejectTarget.leave_type ?? 'annual'] ?? '#2D5016'}30`,
              }}>
                {(rejectTarget.leave_type ?? 'annual').charAt(0).toUpperCase() + (rejectTarget.leave_type ?? 'annual').slice(1)}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#4a5568' }}>
                {fmtDate(rejectTarget.start_date)} — {fmtDate(rejectTarget.end_date)}
                {rejectTarget.days_count && ` (${rejectTarget.days_count} day${rejectTarget.days_count !== 1 ? 's' : ''})`}
              </span>
            </div>

            {rejectError && <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}><AlertCircle size={13} />{rejectError}</div>}

            <div className="form-group">
              <label>Reason for rejection *</label>
              <textarea rows={3} value={rejectReason}
                placeholder="Explain why this leave request cannot be approved…"
                onChange={e => { setRejectReason(e.target.value); setRejectError(''); }} />
            </div>

            <div className="leave-modal-actions">
              <button className="btn-secondary" onClick={() => setRejectTarget(null)} disabled={!!actionLoading}>
                <X size={13} /> Cancel
              </button>
              <button className="alm-btn-reject-confirm" onClick={doReject} disabled={!!actionLoading || !rejectReason.trim()}>
                {actionLoading ? <Loader2 size={13} className="spin" /> : <XCircle size={13} />}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
