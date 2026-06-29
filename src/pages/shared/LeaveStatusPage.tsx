import { useEffect, useState } from 'react';
import { CalendarCheck, RefreshCw, AlertCircle, XCircle, CheckCircle, Clock } from 'lucide-react';
import { getLeaveStatus, getLeaveBalance } from '../../api/role';
import type { LeaveRequest, LeaveBalance } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './SharedPages.css';
import './LeaveRequestPage.css';

interface Props { apiBase: string; }

const STATUS_META = {
  approved: { cls: 'badge-approved', icon: <CheckCircle size={12} />, label: 'Approved' },
  rejected: { cls: 'badge-rejected', icon: <XCircle size={12} />,    label: 'Rejected' },
  pending:  { cls: 'badge-pending',  icon: <Clock size={12} />,       label: 'Pending'  },
};

const TYPE_LABEL: Record<string, string> = {
  annual: 'Annual', sick: 'Sick', maternity: 'Maternity',
  paternity: 'Paternity', emergency: 'Emergency', unpaid: 'Unpaid', other: 'Other',
};
const TYPE_COLOR: Record<string, string> = {
  annual: '#2D5016', sick: '#1565c0', maternity: '#6a1b9a',
  paternity: '#0277bd', emergency: '#c62828', unpaid: '#757575', other: '#ef6c00',
};

function parseOtherLabel(reason: string): { label: string; text: string } {
  const m = reason.match(/^\[(.+?)\]\s+/);
  return m ? { label: m[1], text: reason.slice(m[0].length) } : { label: 'Other', text: reason };
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function LeaveStatusPage({ apiBase }: Props) {
  const [leaves,   setLeaves]   = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const load = () => {
    setLoading(true); setError('');
    Promise.all([getLeaveStatus(apiBase), getLeaveBalance(apiBase)])
      .then(([lv, bal]) => { setLeaves(lv); setBalances(bal); })
      .catch(() => setError('Failed to load leave data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [apiBase]);

  if (loading) return <LoadingSpinner message="Loading leave history…" />;
  if (error)   return <div className="page-error"><AlertCircle size={16} /> {error}</div>;

  const pending  = leaves.filter(l => !l.status || l.status === 'pending').length;
  const approved = leaves.filter(l => l.status === 'approved').length;
  const rejected = leaves.filter(l => l.status === 'rejected').length;

  return (
    <div className="lrp-root">
      <PageHeader
        title="My Leave History"
        subtitle={`${leaves.length} request${leaves.length !== 1 ? 's' : ''} · ${pending} pending`}
        actions={
          <button className="btn-secondary" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      {/* ── Balance summary ── */}
      {balances.length > 0 && (
        <div className="lrp-balance-section">
          <h3 className="lrp-section-title">Leave Balance — {new Date().getFullYear()}</h3>
          <div className="lrp-balance-grid">
            {balances.map(b => {
              const rem  = parseFloat(String(b.total_days)) - parseFloat(String(b.used_days));
              const used = parseFloat(String(b.used_days));
              const tot  = parseFloat(String(b.total_days));
              const pct  = tot > 0 ? Math.min(100, Math.round((used / tot) * 100)) : 0;
              const color = TYPE_COLOR[b.leave_type] ?? '#2D5016';
              const unlimited = ['unpaid', 'other'].includes(b.leave_type);
              return (
                <div key={b.leave_type} className="lrp-bal-card">
                  <p className="lrp-bal-type" style={{ color }}>{TYPE_LABEL[b.leave_type] ?? b.leave_type}</p>
                  {unlimited ? (
                    <p className="lrp-bal-days" style={{ color }}>∞</p>
                  ) : (
                    <>
                      <p className="lrp-bal-days" style={{ color }}>{rem % 1 === 0 ? rem : rem.toFixed(1)}<span> / {tot}</span></p>
                      <div className="lrp-bal-track"><div className="lrp-bal-fill" style={{ width: `${pct}%`, background: color }} /></div>
                      <p className="lrp-bal-sub">{used} used</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Summary counts ── */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total',    val: leaves.length, color: '#1e3a1e', bg: '#f0f7f0' },
          { label: 'Pending',  val: pending,        color: '#d97706', bg: '#fffbeb' },
          { label: 'Approved', val: approved,       color: '#276749', bg: '#f0faf4' },
          { label: 'Rejected', val: rejected,       color: '#c53030', bg: '#fff5f5' },
        ].map(s => (
          <div key={s.label} style={{
            flex: '1 1 120px', background: s.bg, border: `1px solid ${s.color}22`,
            borderRadius: 10, padding: '0.75rem 1rem', textAlign: 'center',
          }}>
            <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.val}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: s.color, fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Requests table ── */}
      {leaves.length === 0 ? (
        <div className="table-card">
          <div className="empty-state"><CalendarCheck size={40} /><p>No leave requests submitted yet.</p></div>
        </div>
      ) : (
        <div className="table-card">
          <table className="saic-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Period</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Reviewed by</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l, i) => {
                const status = (l.status ?? 'pending').toLowerCase();
                const meta   = STATUS_META[status as keyof typeof STATUS_META] ?? STATUS_META.pending;
                const type   = l.leave_type ?? 'annual';
                const color  = TYPE_COLOR[type] ?? '#2D5016';
                return (
                  <>
                    <tr key={l.id}>
                      <td className="col-num">{i + 1}</td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '0.18rem 0.6rem',
                          background: `${color}14`, color, border: `1px solid ${color}30`,
                          borderRadius: 20, fontSize: '0.73rem', fontWeight: 600,
                        }}>
                          {type === 'other' ? parseOtherLabel(l.reason).label : (TYPE_LABEL[type] ?? type)}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                        {fmtDate(l.start_date)} — {fmtDate(l.end_date)}
                      </td>
                      <td style={{ fontWeight: 700, color: '#2D5016' }}>{l.days_count ?? '—'}</td>
                      <td style={{ maxWidth: 200, color: '#4a5568', fontSize: '0.82rem' }}>
                        {type === 'other' ? parseOtherLabel(l.reason).text : l.reason}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#6a8c6a' }}>{fmtDate(l.created_at)}</td>
                      <td>
                        <span className={`status-badge ${meta.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          {meta.icon} {meta.label}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#6a8c6a' }}>
                        {l.approved_by_name ?? '—'}
                      </td>
                    </tr>
                    {/* Rejection reason row */}
                    {status === 'rejected' && l.rejection_reason && (
                      <tr key={`${l.id}-rej`} style={{ background: '#fff5f5' }}>
                        <td />
                        <td colSpan={7}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.3rem 0', fontSize: '0.8rem', color: '#c53030' }}>
                            <XCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                            <span><strong>Rejection reason:</strong> {l.rejection_reason}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
