import { useState, useEffect } from 'react';
import {
  CalendarOff, CheckCircle, AlertCircle, Info,
  Loader2, ChevronDown,
} from 'lucide-react';
import { requestLeave, getLeaveBalance } from '../../api/role';
import type { LeaveBalance, LeaveType } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import './SharedPages.css';
import './LeaveRequestPage.css';

interface Props { apiBase: string; }

const LEAVE_TYPES: { value: LeaveType; label: string; desc: string; color: string }[] = [
  { value: 'annual',    label: 'Annual Leave',    desc: 'Planned vacation or personal time',     color: '#2D5016' },
  { value: 'sick',      label: 'Sick Leave',      desc: 'Medical illness or hospital visit',     color: '#1565c0' },
  { value: 'maternity', label: 'Maternity Leave', desc: 'Maternity leave for new mothers',       color: '#6a1b9a' },
  { value: 'paternity', label: 'Paternity Leave', desc: 'Paternity leave for new fathers',       color: '#0277bd' },
  { value: 'emergency', label: 'Emergency Leave', desc: 'Urgent unforeseen circumstances',       color: '#c62828' },
  { value: 'unpaid',    label: 'Unpaid Leave',    desc: 'Leave without pay',                     color: '#757575' },
  { value: 'other',     label: 'Other',           desc: 'Any other approved leave category',     color: '#ef6c00' },
];

const BALANCE_COLOR: Record<string, string> = {
  annual: '#2D5016', sick: '#1565c0', maternity: '#6a1b9a',
  paternity: '#0277bd', emergency: '#c62828', unpaid: '#757575', other: '#ef6c00',
};

function calcDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / 86400000;
  return diff < 0 ? 0 : Math.round(diff) + 1;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function LeaveRequestPage({ apiBase }: Props) {
  const [leaveType,   setLeaveType]   = useState<LeaveType>('annual');
  const [otherLabel,  setOtherLabel]  = useState('');
  const [reason,      setReason]      = useState('');
  const [startDate,   setStartDate]   = useState('');
  const [endDate,     setEndDate]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success,   setSuccess]   = useState('');
  const [error,     setError]     = useState('');

  const [balances,  setBalances]  = useState<LeaveBalance[]>([]);
  const [balLoading, setBalLoading] = useState(true);

  useEffect(() => {
    setBalLoading(true);
    getLeaveBalance(apiBase)
      .then(setBalances)
      .catch(() => {/* silent */})
      .finally(() => setBalLoading(false));
  }, [apiBase]);

  const days      = calcDays(startDate, endDate);
  const selBal    = balances.find(b => b.leave_type === leaveType);
  const remaining = selBal ? parseFloat(String(selBal.total_days)) - parseFloat(String(selBal.used_days)) : null;
  const isUnlimited = ['unpaid', 'other'].includes(leaveType);
  const overBalance = !isUnlimited && remaining !== null && days > remaining;

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (leaveType === 'other' && !otherLabel.trim()) { setError('Please specify the leave type.'); return; }
    if (!reason.trim() || !startDate || !endDate) { setError('All fields are required.'); return; }
    if (new Date(endDate) < new Date(startDate))  { setError('End date cannot be before start date.'); return; }
    if (overBalance) { setError(`Insufficient ${leaveType} leave balance.`); return; }
    setSubmitting(true); setError(''); setSuccess('');
    const finalReason = leaveType === 'other' && otherLabel.trim()
      ? `[${otherLabel.trim()}] ${reason.trim()}`
      : reason.trim();
    try {
      await requestLeave(apiBase, { leave_type: leaveType, reason: finalReason, start_date: startDate, end_date: endDate });
      setSuccess('Leave request submitted successfully! You will be notified once it is reviewed.');
      setReason(''); setStartDate(''); setEndDate(''); setLeaveType('annual'); setOtherLabel('');
      // Refresh balance
      getLeaveBalance(apiBase).then(setBalances).catch(() => {});
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to submit leave request.';
      setError(msg);
    } finally { setSubmitting(false); }
  };

  const selectedType = LEAVE_TYPES.find(t => t.value === leaveType)!;

  return (
    <div className="lrp-root">
      <PageHeader title="Request Leave" subtitle="Submit a leave request for management approval" />

      {/* ── Balance overview ── */}
      <div className="lrp-balance-section">
        <h3 className="lrp-section-title">Your Leave Balance — {new Date().getFullYear()}</h3>
        {balLoading ? (
          <p className="lrp-bal-loading"><Loader2 size={14} className="spin" /> Loading balance…</p>
        ) : (
          <div className="lrp-balance-grid">
            {balances.map(b => {
              const rem  = parseFloat(String(b.total_days)) - parseFloat(String(b.used_days));
              const used = parseFloat(String(b.used_days));
              const tot  = parseFloat(String(b.total_days));
              const pct  = tot > 0 ? Math.min(100, Math.round((used / tot) * 100)) : 0;
              const color = BALANCE_COLOR[b.leave_type] ?? '#2D5016';
              const unlimited = ['unpaid', 'other'].includes(b.leave_type);
              return (
                <div key={b.leave_type} className={`lrp-bal-card${leaveType === b.leave_type ? ' active' : ''}`}
                  style={{ borderColor: leaveType === b.leave_type ? color : undefined }}
                  onClick={() => setLeaveType(b.leave_type as LeaveType)}
                >
                  <p className="lrp-bal-type" style={{ color }}>{LEAVE_TYPES.find(t => t.value === b.leave_type)?.label ?? b.leave_type}</p>
                  {unlimited ? (
                    <p className="lrp-bal-days" style={{ color }}>∞</p>
                  ) : (
                    <>
                      <p className="lrp-bal-days" style={{ color }}>{rem % 1 === 0 ? rem : rem.toFixed(1)}<span> / {tot}</span></p>
                      <div className="lrp-bal-track">
                        <div className="lrp-bal-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <p className="lrp-bal-sub">{used} used</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Request form ── */}
      <div className="lrp-form-card">
        <h3 className="lrp-section-title">New Leave Request</h3>

        {success && <div className="alert alert-success"><CheckCircle size={15} />{success}</div>}
        {error   && <div className="alert alert-error"><AlertCircle size={15} />{error}</div>}

        <form onSubmit={handleSubmit} className="saic-form">

          {/* Leave type */}
          <div className="form-group">
            <label>Leave Type *</label>
            <div className="lrp-type-grid">
              {LEAVE_TYPES.map(t => (
                <button key={t.value} type="button"
                  className={`lrp-type-chip${leaveType === t.value ? ' selected' : ''}`}
                  style={leaveType === t.value ? { borderColor: t.color, background: `${t.color}12`, color: t.color } : {}}
                  onClick={() => { setLeaveType(t.value); setOtherLabel(''); setError(''); }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="lrp-type-desc"><Info size={12} /> {selectedType.desc}</p>
            {leaveType === 'other' && (
              <input
                type="text"
                value={otherLabel}
                placeholder="Specify leave type (e.g. Study, Bereavement, Compassionate…)"
                maxLength={80}
                onChange={e => { setOtherLabel(e.target.value); setError(''); }}
                disabled={submitting}
                style={{ marginTop: '0.5rem' }}
              />
            )}
          </div>

          {/* Dates */}
          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input type="date" value={startDate} min={today}
                onChange={e => { setStartDate(e.target.value); setError(''); }} disabled={submitting} />
            </div>
            <div className="form-group">
              <label>End Date *</label>
              <input type="date" value={endDate} min={startDate || today}
                onChange={e => { setEndDate(e.target.value); setError(''); }} disabled={submitting} />
            </div>
          </div>

          {/* Live summary */}
          {days > 0 && (
            <div className={`lrp-summary${overBalance ? ' lrp-summary-warn' : ''}`}>
              <span><strong>{days}</strong> day{days !== 1 ? 's' : ''} requested
                ({startDate && fmtDate(startDate)} — {endDate && fmtDate(endDate)})</span>
              {!isUnlimited && remaining !== null && (
                <span className={overBalance ? 'lrp-over' : 'lrp-ok'}>
                  {overBalance
                    ? `⚠ Exceeds balance (${remaining} day${remaining !== 1 ? 's' : ''} remaining)`
                    : `✓ ${remaining} day${remaining !== 1 ? 's' : ''} remaining after this request`}
                </span>
              )}
            </div>
          )}

          {/* Reason */}
          <div className="form-group">
            <label>Reason *</label>
            <textarea rows={3} value={reason}
              placeholder={`Briefly describe your reason for ${selectedType.label.toLowerCase()}…`}
              onChange={e => { setReason(e.target.value); setError(''); }} disabled={submitting} />
          </div>

          <button type="submit" className="btn-primary" disabled={submitting || overBalance}>
            {submitting
              ? <><Loader2 size={15} className="spin" /> Submitting…</>
              : <><CalendarOff size={15} /> Submit Request<ChevronDown size={13} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
