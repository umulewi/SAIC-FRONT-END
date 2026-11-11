import { useEffect, useState } from 'react';
import {
  CalendarRange, ChevronLeft, CheckCircle, Clock, AlertCircle,
  Loader2, RefreshCw, Send, Save, X, Users,
} from 'lucide-react';
import {
  listKpiCycles, getCycleStaff, saveEvaluation,
} from '../../api/kpiCycles';
import type { KpiCycle, CycleStaffMember } from '../../api/kpiCycles';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../shared/SharedPages.css';
import './HRKpiCyclesPage.css';

function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function EvalBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  const map: Record<string, { label: string; color: string; bg: string }> = {
    draft:     { label: 'Draft',     color: '#6b7280', bg: '#f3f4f6' },
    submitted: { label: 'Submitted', color: '#2563eb', bg: '#eff6ff' },
    approved:  { label: 'Approved',  color: '#16a34a', bg: '#f0fdf4' },
    returned:  { label: 'Returned',  color: '#dc2626', bg: '#fef2f2' },
  };
  const m = map[status] ?? map.draft;
  return (
    <span style={{ padding: '2px 9px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700, color: m.color, background: m.bg }}>
      {m.label}
    </span>
  );
}

function initials(first?: string | null, last?: string | null) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?';
}

export default function HRKpiCyclesPage() {
  const [cycles, setCycles]         = useState<KpiCycle[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const [selectedCycle, setSelected] = useState<KpiCycle | null>(null);
  const [staff, setStaff]            = useState<CycleStaffMember[]>([]);
  const [staffLoading, setStaffLoad] = useState(false);

  const [scores, setScores]     = useState<Record<number, string>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [saving, setSaving]     = useState<number | null>(null);
  const [okMsgs, setOkMsgs]     = useState<Record<number, string>>({});
  const [errMsgs, setErrMsgs]   = useState<Record<number, string>>({});

  const load = async () => {
    setLoading(true); setError('');
    try {
      const cs = await listKpiCycles();
      setCycles(cs.filter(c => c.status === 'open' || c.status === 'closed'));
    } catch {
      setError('Failed to load evaluation cycles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const selectCycle = async (cycle: KpiCycle) => {
    setSelected(cycle);
    setStaffLoad(true);
    setScores({}); setComments({}); setOkMsgs({}); setErrMsgs({});
    try {
      const list = await getCycleStaff(cycle.id);
      setStaff(list);
      const s: Record<number, string> = {};
      const c: Record<number, string> = {};
      for (const m of list) {
        if (m.kpi_score != null) s[m.users_id] = String(m.kpi_score);
        if (m.comments)          c[m.users_id] = m.comments;
      }
      setScores(s); setComments(c);
    } catch {
      setError('Failed to load staff list.');
    } finally {
      setStaffLoad(false);
    }
  };

  const refreshStaff = async () => {
    if (!selectedCycle) return;
    const list = await getCycleStaff(selectedCycle.id);
    setStaff(list);
  };

  const handleSave = async (usersId: number, action: 'save' | 'submit') => {
    if (!selectedCycle) return;
    const scoreStr = scores[usersId];
    if (action === 'submit' && !scoreStr) {
      setErrMsgs(p => ({ ...p, [usersId]: 'KPI score is required to submit.' }));
      return;
    }
    setSaving(usersId);
    setErrMsgs(p => ({ ...p, [usersId]: '' }));
    try {
      await saveEvaluation(selectedCycle.id, usersId, {
        kpi_score: scoreStr ? parseFloat(scoreStr) : undefined,
        comments:  comments[usersId],
        action,
      });
      const msg = action === 'submit' ? 'Submitted for review.' : 'Saved as draft.';
      setOkMsgs(p => ({ ...p, [usersId]: msg }));
      setTimeout(() => setOkMsgs(p => ({ ...p, [usersId]: '' })), 3500);
      await refreshStaff();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setErrMsgs(p => ({ ...p, [usersId]: msg ?? 'Failed to save.' }));
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading evaluation cycles…" />;

  const openCycles   = cycles.filter(c => c.status === 'open');
  const closedCycles = cycles.filter(c => c.status === 'closed');

  return (
    <div className="hkc-root">
      <PageHeader
        title="KPI Evaluation Cycles"
        subtitle="Submit and manage staff performance evaluations"
        actions={
          <button className="btn-secondary" onClick={load}><RefreshCw size={14} /> Refresh</button>
        }
      />

      {error && (
        <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <AlertCircle size={15} /> {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={13} />
          </button>
        </div>
      )}

      {!selectedCycle ? (
        /* ── Cycle list ── */
        <>
          <div className="hkc-section-title">
            <CalendarRange size={16} /> Open Evaluation Cycles
          </div>
          {openCycles.length === 0 ? (
            <div className="hkc-empty">
              <CalendarRange size={34} />
              <p>No open evaluation cycles at the moment.</p>
              <p style={{ color: '#9ab89a', fontSize: '0.82rem' }}>Admin will notify you when a cycle opens.</p>
            </div>
          ) : (
            <div className="hkc-cycle-grid">
              {openCycles.map(c => (
                <button key={c.id} className="hkc-cycle-card hkc-open" onClick={() => selectCycle(c)}>
                  <div className="hkc-cycle-badge hkc-badge-open">● Open</div>
                  <div className="hkc-cycle-name">{c.name}</div>
                  <div className="hkc-cycle-meta"><Clock size={12} /> Deadline: {fmtDate(c.end_date)}</div>
                  <div className="hkc-cycle-meta">
                    <Users size={12} /> {c.evaluated_count ?? 0} evaluated · {c.approved_count ?? 0} approved
                  </div>
                </button>
              ))}
            </div>
          )}

          {closedCycles.length > 0 && (
            <>
              <div className="hkc-section-title" style={{ marginTop: '1.5rem' }}>
                <CalendarRange size={16} /> Past Cycles (read-only)
              </div>
              <div className="hkc-cycle-grid">
                {closedCycles.map(c => (
                  <button key={c.id} className="hkc-cycle-card hkc-closed" onClick={() => selectCycle(c)}>
                    <div className="hkc-cycle-badge hkc-badge-closed">● Closed</div>
                    <div className="hkc-cycle-name">{c.name}</div>
                    <div className="hkc-cycle-meta"><Clock size={12} /> {fmtDate(c.start_date)} – {fmtDate(c.end_date)}</div>
                    <div className="hkc-cycle-meta"><CheckCircle size={12} /> {c.approved_count ?? 0} approved</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        /* ── Staff evaluation forms ── */
        <>
          <div className="hkc-detail-header">
            <button className="hkc-back-btn" onClick={() => setSelected(null)}>
              <ChevronLeft size={16} />
            </button>
            <div>
              <div className="hkc-detail-title">{selectedCycle.name}</div>
              <div className="hkc-detail-sub">
                {fmtDate(selectedCycle.start_date)} – {fmtDate(selectedCycle.end_date)}
                {selectedCycle.status === 'closed' && (
                  <span className="hkc-closed-note"> · Closed — read-only</span>
                )}
              </div>
            </div>
          </div>

          {staffLoading ? (
            <LoadingSpinner message="Loading staff list…" />
          ) : staff.length === 0 ? (
            <div className="hkc-empty">
              <Users size={34} />
              <p>No staff assigned to this cycle.</p>
            </div>
          ) : (
            <div className="hkc-staff-list">
              {staff.map(m => {
                const isApproved  = m.eval_status === 'approved';
                const isReturned  = m.eval_status === 'returned';
                const isSubmitted = m.eval_status === 'submitted';
                const isReadOnly  = isApproved || selectedCycle.status === 'closed';
                const isSaving    = saving === m.users_id;

                return (
                  <div
                    key={m.users_id}
                    className={`hkc-card ${isApproved ? 'hkc-card-approved' : isReturned ? 'hkc-card-returned' : ''}`}
                  >
                    {/* Staff header row */}
                    <div className="hkc-card-header">
                      <div className="hkc-avatar">{initials(m.first_name, m.last_name)}</div>
                      <div className="hkc-card-info">
                        <div className="hkc-card-name">{m.first_name} {m.last_name}</div>
                        <div className="hkc-card-role">{m.role_name ?? '—'} · {m.department_name ?? '—'}</div>
                      </div>
                      <div className="hkc-card-status">
                        <EvalBadge status={m.eval_status} />
                        {m.submitted_at && (
                          <span className="hkc-submitted-at">Submitted {fmtDate(m.submitted_at)}</span>
                        )}
                      </div>
                    </div>

                    {/* Returned note */}
                    {isReturned && m.review_comment && (
                      <div className="hkc-return-note">
                        <AlertCircle size={13} />
                        <span><strong>Admin note:</strong> {m.review_comment}</span>
                      </div>
                    )}

                    {/* Approved view (read-only) */}
                    {isApproved && (
                      <div className="hkc-approved-view">
                        <span className="hkc-approved-score">
                          {m.kpi_score != null ? `${m.kpi_score}%` : 'N/A'}
                        </span>
                        <span className="hkc-approved-label">Approved KPI Score</span>
                        {m.comments && <p className="hkc-approved-comment">{m.comments}</p>}
                      </div>
                    )}

                    {/* Edit form (open + not approved) */}
                    {!isReadOnly && (
                      <div className="hkc-eval-form">
                        <div className="hkc-field-row">
                          <div className="hkc-field">
                            <label>KPI Score (0–100) *</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              value={scores[m.users_id] ?? ''}
                              onChange={e => setScores(p => ({ ...p, [m.users_id]: e.target.value }))}
                              placeholder="e.g. 85"
                              disabled={isSaving}
                            />
                          </div>
                          <div className="hkc-field hkc-field-wide">
                            <label>Comments / Feedback</label>
                            <textarea
                              rows={2}
                              value={comments[m.users_id] ?? ''}
                              onChange={e => setComments(p => ({ ...p, [m.users_id]: e.target.value }))}
                              placeholder="Strengths, areas for improvement…"
                              disabled={isSaving}
                            />
                          </div>
                        </div>

                        {errMsgs[m.users_id] && (
                          <div className="hkc-err-msg">{errMsgs[m.users_id]}</div>
                        )}
                        {okMsgs[m.users_id] && (
                          <div className="hkc-ok-msg">
                            <CheckCircle size={13} /> {okMsgs[m.users_id]}
                          </div>
                        )}

                        <div className="hkc-eval-actions">
                          <button
                            className="hkc-btn-save"
                            onClick={() => handleSave(m.users_id, 'save')}
                            disabled={isSaving}
                          >
                            {isSaving ? <Loader2 size={13} className="hkc-spin" /> : <Save size={13} />}
                            Save Draft
                          </button>
                          {!isSubmitted ? (
                            <button
                              className="hkc-btn-submit"
                              onClick={() => handleSave(m.users_id, 'submit')}
                              disabled={isSaving}
                            >
                              {isSaving ? <Loader2 size={13} className="hkc-spin" /> : <Send size={13} />}
                              Submit
                            </button>
                          ) : (
                            /* Already submitted but not yet approved/returned — show resubmit if returned */
                            isReturned && (
                              <button
                                className="hkc-btn-submit"
                                onClick={() => handleSave(m.users_id, 'submit')}
                                disabled={isSaving}
                              >
                                {isSaving ? <Loader2 size={13} className="hkc-spin" /> : <Send size={13} />}
                                Resubmit
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
