import { useEffect, useState } from 'react';
import {
  Users, Target, Star, ChevronDown, ChevronUp, Plus, Pencil, Trash2,
  CheckCircle, X, Loader2, AlertCircle, RefreshCw, Award, Calendar,
  CalendarRange, Send, ChevronLeft, Clock,
} from 'lucide-react';
import {
  hrGetStaff, hrGetKpis, hrCreateKpi, hrUpdateKpi, hrDeleteKpi,
  hrGetStaffKpis, hrAssignKpi, hrDeleteStaffKpi,
  hrAddEvaluation, hrGetEvaluationsSummary,
} from '../../api/hr';
import type { HRStaff, KPI, StaffKPI, EvaluationSummary } from '../../api/hr';
import { listKpiCycles, getCycleStaff, saveEvaluation } from '../../api/kpiCycles';
import type { KpiCycle } from '../../api/kpiCycles';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../shared/SharedPages.css';
import './HRManagerPage.css';

type Tab = 'staff' | 'kpis' | 'leaderboard';

const RATING_OPTIONS = [
  { value: 'well_done', label: 'Well Done', points: 25, color: '#1565c0' },
  { value: 'medium',    label: 'Medium',    points: 50, color: '#e65100' },
  { value: 'high',      label: 'High',      points: 75, color: '#6a1b9a' },
  { value: 'excellent', label: 'Excellent', points: 100, color: '#2e7d32' },
];

function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function RatingBadge({ rating }: { rating?: string | null }) {
  if (!rating) return <span className="hr-dash">—</span>;
  const opt = RATING_OPTIONS.find(o => o.value === rating);
  return (
    <span className="hr-rating-badge" style={{ background: opt?.color + '18', color: opt?.color, border: `1px solid ${opt?.color}40` }}>
      {opt?.label ?? rating} ({opt?.points}pts)
    </span>
  );
}

function calcPerf(evalCount: number, totalPoints: number, taskTotal: number, taskCompleted: number) {
  const kpi  = evalCount > 0 ? (totalPoints / (evalCount * 100)) * 50 : 0;
  const task = taskTotal > 0 ? (taskCompleted / taskTotal) * 50        : 50;
  return Math.round(kpi + task);
}

function defaultDueDate() {
  const d = new Date(); d.setDate(d.getDate() + 14);
  return d.toISOString().split('T')[0];
}

function kpiStatus(sk: StaffKPI): { label: string; color: string; bg: string } {
  if (sk.rating) return { label: 'Completed', color: '#16a34a', bg: '#f0fdf4' };
  if (!sk.due_date) return { label: 'Pending', color: '#6b7280', bg: '#f3f4f6' };
  const diff = Math.ceil((new Date(sk.due_date).getTime() - Date.now()) / 86400000);
  if (diff < 0)  return { label: 'Overdue',       color: '#dc2626', bg: '#fef2f2' };
  if (diff === 0) return { label: 'Due today',    color: '#ea580c', bg: '#fff7ed' };
  if (diff <= 3) return { label: `Due in ${diff}d`, color: '#d97706', bg: '#fffbeb' };
  return { label: `${diff}d left`, color: '#2563eb', bg: '#eff6ff' };
}

function PerfBadge({ pct }: { pct: number }) {
  const color = pct >= 80 ? '#16a34a' : pct >= 60 ? '#d97706' : pct >= 40 ? '#2563eb' : '#dc2626';
  const label = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : pct >= 40 ? 'Fair' : pct > 0 ? 'Poor' : 'N/A';
  if (pct === 0) return <span style={{ color: '#b0c8b0', fontSize: '0.78rem' }}>N/A</span>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 110 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 800, color }}>{pct}%</span>
      <span style={{ fontSize: '0.68rem', color }}>{label}</span>
    </div>
  );
}

function PointsBadge({ points }: { points: number }) {
  const level = points >= 300 ? 'gold' : points >= 150 ? 'silver' : 'bronze';
  return <span className={`hr-points-badge hr-points-${level}`}>{points} pts</span>;
}

function ScoreBar({ score }: { score?: number | null }) {
  if (score == null) return <span style={{ color: '#b0c8b0', fontSize: '0.78rem' }}>Not evaluated</span>;
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : score >= 40 ? '#2563eb' : '#dc2626';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 120 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 800, color }}>{score}%</span>
      <span style={{ fontSize: '0.68rem', color }}>{label}</span>
    </div>
  );
}

function CycleStatusChip({ status }: { status?: string | null }) {
  if (!status) return <span style={{ color: '#b0c8b0', fontSize: '0.78rem' }}>—</span>;
  const map: Record<string, { label: string; color: string; bg: string }> = {
    draft:     { label: 'Draft',     color: '#6b7280', bg: '#f3f4f6' },
    submitted: { label: 'Submitted', color: '#2563eb', bg: '#eff6ff' },
    approved:  { label: 'Approved',  color: '#16a34a', bg: '#f0fdf4' },
    returned:  { label: 'Returned',  color: '#dc2626', bg: '#fef2f2' },
  };
  const m = map[status] ?? map.draft;
  return (
    <span style={{ padding: '2px 9px', borderRadius: 12, fontSize: '0.73rem', fontWeight: 700, color: m.color, background: m.bg }}>
      {m.label}
    </span>
  );
}

export default function HRManagerPage() {
  const [tab,     setTab]     = useState<Tab>('staff');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  // Staff tab
  const [staff,      setStaff]      = useState<HRStaff[]>([]);
  const [expanded,   setExpanded]   = useState<number | null>(null);
  const [staffKpis,  setStaffKpis]  = useState<Record<number, StaffKPI[]>>({});
  const [loadingMember, setLoadingMember] = useState(false);

  // KPI assign sub-form per staff
  const [assignKpiFor, setAssignKpiFor] = useState<number | null>(null);
  const [assignKpiId,  setAssignKpiId]  = useState('');
  const [assignDue,    setAssignDue]    = useState('');
  const [assigningKpi, setAssigningKpi] = useState(false);


  // KPI Library tab
  const [kpis,       setKpis]       = useState<KPI[]>([]);
  const [kpiForm,    setKpiForm]    = useState(false);
  const [kpiEditId,  setKpiEditId]  = useState<number | null>(null);
  const [kpiTitle,   setKpiTitle]   = useState('');
  const [kpiDesc,    setKpiDesc]    = useState('');
  const [kpiTarget,  setKpiTarget]  = useState('');
  const [savingKpi,  setSavingKpi]  = useState(false);
  const [deletingKpi, setDeletingKpi] = useState<number | null>(null);

  // Leaderboard
  const [summary, setSummary]       = useState<EvaluationSummary[]>([]);
  const [lbFrom, setLbFrom]         = useState('');
  const [lbTo, setLbTo]             = useState('');

  // Evaluation cycle selection
  const [openCycles, setOpenCycles]   = useState<KpiCycle[]>([]);
  const [openCycle, setOpenCycle]     = useState<KpiCycle | null>(null);
  const [cycleStatus, setCycleStatus] = useState<Record<number, string | null>>({});
  const [submittingAll, setSubmittingAll] = useState(false);

  // Eval session mode
  const [evalMode, setEvalMode]             = useState(false);
  const [evalStaffKpis, setEvalStaffKpis]   = useState<Record<number, StaffKPI[]>>({});
  const [kpiEdits, setKpiEdits]             = useState<Record<number, { rating: string; notes: string }>>({});
  const [loadingEvalMode, setLoadingEvalMode] = useState(false);
  const [savingStaff, setSavingStaff]       = useState<number | null>(null);

  const loadStaff = () =>
    hrGetStaff().then(setStaff).catch(() => setError('Failed to load staff.'));

  const loadKpis = () =>
    hrGetKpis().then(setKpis).catch(() => {});

  const loadSummary = (from?: string, to?: string) =>
    hrGetEvaluationsSummary(from, to).then(setSummary).catch(() => {});

  const loadOpenCycles = async () => {
    try {
      const cycles = await listKpiCycles();
      setOpenCycles(cycles.filter(c => c.status === 'open' || c.status === 'scheduled'));
    } catch { /* non-fatal */ }
  };

  const refreshCycleStatus = async (cycleId: number) => {
    try {
      const staffInCycle = await getCycleStaff(cycleId);
      const map: Record<number, string | null> = {};
      staffInCycle.forEach(s => { map[s.users_id] = s.eval_status ?? null; });
      setCycleStatus(map);
    } catch { /* non-fatal */ }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadStaff(), loadKpis(), loadSummary(), loadOpenCycles()])
      .finally(() => setLoading(false));

    // Re-fetch cycles every 60 s so scheduled→open transitions appear without a manual refresh
    const cycleTimer = setInterval(loadOpenCycles, 60_000);
    return () => clearInterval(cycleTimer);
  }, []);

  const toggleExpand = async (userId: number) => {
    if (expanded === userId) { setExpanded(null); return; }
    setExpanded(userId);
    setAssignKpiFor(null);
    if (!staffKpis[userId]) {
      setLoadingMember(true);
      const kpiRows = await hrGetStaffKpis(userId).catch(() => []);
      setStaffKpis(prev => ({ ...prev, [userId]: kpiRows }));
      setLoadingMember(false);
    }
  };

  const reloadMember = async (userId: number) => {
    const kpiRows = await hrGetStaffKpis(userId).catch(() => []);
    setStaffKpis(prev => ({ ...prev, [userId]: kpiRows }));
    loadStaff(); loadSummary();
  };

  const handleAssignKpi = async (userId: number) => {
    if (!assignKpiId) return;
    setAssigningKpi(true); setError('');
    try {
      await hrAssignKpi(userId, { kpi_id: Number(assignKpiId), due_date: assignDue || undefined });
      setSuccess('KPI assigned.'); setAssignKpiFor(null); setAssignKpiId(''); setAssignDue('');
      await reloadMember(userId);
    } catch { setError('Failed to assign KPI.'); }
    finally { setAssigningKpi(false); }
  };

  const handleRemoveStaffKpi = async (userId: number, staffKpiId: number) => {
    try {
      await hrDeleteStaffKpi(userId, staffKpiId);
      await reloadMember(userId);
    } catch { setError('Failed to remove KPI.'); }
  };

  const handleSubmitToCycle = async (userId: number) => {
    if (!openCycle) return;
    await saveEvaluation(openCycle.id, userId, { action: 'submit' }).catch(() => {});
  };

  const handleSaveAll = async () => {
    if (!openCycle) return;
    setSavingStaff(-1); setError('');
    try {
      await Promise.all(staff.map(async m => {
        const st = cycleStatus[m.users_id];
        // Skip already evaluated (draft/submitted/approved) — only save new or returned
        if (st === 'draft' || st === 'submitted' || st === 'approved') return;
        const kpis   = evalStaffKpis[m.users_id] ?? [];
        const toSave = kpis.filter(k => kpiEdits[k.staff_kpi_id]?.rating);
        if (toSave.length === 0) return;
        await Promise.all(toSave.map(k =>
          hrAddEvaluation(m.users_id, {
            rating: kpiEdits[k.staff_kpi_id].rating,
            notes:  kpiEdits[k.staff_kpi_id].notes.trim() || undefined,
            staff_kpi_id: k.staff_kpi_id,
          })
        ));
        const avgScore = Math.round(
          toSave.reduce((sum, k) => {
            const opt = RATING_OPTIONS.find(o => o.value === kpiEdits[k.staff_kpi_id].rating);
            return sum + (opt?.points ?? 0);
          }, 0) / toSave.length
        );
        await saveEvaluation(openCycle.id, m.users_id, { action: 'save', kpi_score: avgScore });
      }));
      await refreshCycleStatus(openCycle.id);
      setSuccess('All evaluations saved.');
    } catch { setError('Failed to save evaluations.'); }
    finally { setSavingStaff(null); }
  };

  const handleSubmitAll = async () => {
    if (!openCycle) return;
    const toSubmit = staff.filter(m => {
      const st = cycleStatus[m.users_id];
      return st === 'draft' || st === 'returned';
    });
    if (toSubmit.length === 0) { setError('No evaluated staff to submit. Save evaluations first.'); return; }
    setSubmittingAll(true); setError('');
    try {
      await Promise.all(toSubmit.map(m =>
        saveEvaluation(openCycle.id, m.users_id, { action: 'submit' }).catch(() => {})
      ));
      await refreshCycleStatus(openCycle.id);
      setSuccess(`${toSubmit.length} evaluation${toSubmit.length !== 1 ? 's' : ''} submitted for admin review.`);
    } catch { setError('Failed to submit evaluations.'); }
    finally { setSubmittingAll(false); }
  };

  const enterEvalMode = async (cycle: KpiCycle) => {
    setOpenCycle(cycle);
    setLoadingEvalMode(true);
    try {
      const kpiMap: Record<number, StaffKPI[]> = {};
      const edits: Record<number, { rating: string; notes: string }> = {};
      await Promise.all([
        ...staff.map(async m => {
          const skpis = await hrGetStaffKpis(m.users_id);
          kpiMap[m.users_id] = skpis;
          // Always start blank — each cycle is a fresh evaluation
          skpis.forEach(k => {
            edits[k.staff_kpi_id] = { rating: '', notes: '' };
          });
        }),
        refreshCycleStatus(cycle.id),
      ]);
      setEvalStaffKpis(kpiMap);
      setKpiEdits(edits);
      setEvalMode(true);
    } catch {
      setError('Failed to load staff KPIs for evaluation.');
      setOpenCycle(null);
    } finally {
      setLoadingEvalMode(false);
    }
  };

  const exitEvalMode = () => {
    setEvalMode(false);
    setOpenCycle(null);
    setEvalStaffKpis({});
    setKpiEdits({});
    setCycleStatus({});
  };

  const updateKpiEdit = (staffKpiId: number, field: 'rating' | 'notes', value: string) => {
    setKpiEdits(prev => ({
      ...prev,
      [staffKpiId]: { ...(prev[staffKpiId] ?? { rating: '', notes: '' }), [field]: value },
    }));
  };

  // KPI CRUD
  const openKpiForm = (kpi?: KPI) => {
    setKpiEditId(kpi?.id ?? null);
    setKpiTitle(kpi?.title ?? '');
    setKpiDesc(kpi?.description ?? '');
    setKpiTarget(kpi?.target ?? '');
    setKpiForm(true);
  };

  const handleSaveKpi = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!kpiTitle.trim()) return;
    setSavingKpi(true); setError('');
    try {
      if (kpiEditId) {
        await hrUpdateKpi(kpiEditId, { title: kpiTitle.trim(), description: kpiDesc.trim() || undefined, target: kpiTarget.trim() || undefined });
      } else {
        await hrCreateKpi({ title: kpiTitle.trim(), description: kpiDesc.trim() || undefined, target: kpiTarget.trim() || undefined });
      }
      setSuccess(kpiEditId ? 'KPI updated.' : 'KPI created.');
      setKpiForm(false); setKpiTitle(''); setKpiDesc(''); setKpiTarget(''); setKpiEditId(null);
      loadKpis();
    } catch { setError('Failed to save KPI.'); }
    finally { setSavingKpi(false); }
  };

  const handleDeleteKpi = async (id: number) => {
    setDeletingKpi(id);
    try {
      await hrDeleteKpi(id);
      setSuccess('KPI deleted.'); loadKpis();
    } catch { setError('Failed to delete KPI.'); }
    finally { setDeletingKpi(null); }
  };

  if (loading) return <LoadingSpinner message="Loading HR Manager…" />;

  return (
    <div className="hrm-root">
      <PageHeader
        title="HR Manager"
        subtitle="Manage staff KPIs and performance evaluations"
        actions={
          <button className="btn-secondary" onClick={() => { loadStaff(); loadKpis(); loadSummary(); }}>
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      {success && <div className="alert alert-success"><CheckCircle size={14} />{success}</div>}
      {error   && <div className="alert alert-error"><AlertCircle size={14} />{error}</div>}

      {/* ── Eval session ── */}
      {evalMode && openCycle && (
        <div className="hrm-eval-session">
          <div className="hrm-eval-session-hdr">
            <button className="hrm-eval-back-btn" onClick={exitEvalMode}>
              <ChevronLeft size={16} /> Back
            </button>
            <div style={{ flex: 1 }}>
              <span className="hrm-eval-session-title">{openCycle.name}</span>
              <span className="hrm-eval-session-close">
                Portal closes: {new Date(openCycle.end_date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <button
                className="btn-secondary"
                style={{ fontSize: '0.82rem', padding: '0.42rem 1rem', whiteSpace: 'nowrap' }}
                onClick={handleSaveAll}
                disabled={savingStaff !== null}
                title="Save all ratings"
              >
                {savingStaff !== null
                  ? <><Loader2 size={13} className="spin" /> Saving…</>
                  : <><CheckCircle size={13} /> Save All</>
                }
              </button>
              <button
                className="btn-primary"
                style={{ fontSize: '0.82rem', padding: '0.42rem 1rem', whiteSpace: 'nowrap' }}
                onClick={handleSubmitAll}
                disabled={submittingAll}
                title="Submit all saved evaluations for admin review"
              >
                {submittingAll
                  ? <><Loader2 size={13} className="spin" /> Submitting…</>
                  : <><Send size={13} /> Submit All for Review</>
                }
              </button>
            </div>
          </div>

          {loadingEvalMode ? (
            <LoadingSpinner message="Loading staff KPIs…" />
          ) : staff.length === 0 ? (
            <div className="empty-state"><Users size={38} /><p>No staff members found.</p></div>
          ) : (
            staff.map(m => {
              const kpis = evalStaffKpis[m.users_id] ?? [];
              const st   = cycleStatus[m.users_id];
              return (
                <div key={m.users_id} className={`hrm-eval-card${st ? ` hrm-eval-${st}` : ''}`}>
                  <div className="hrm-eval-card-hdr">
                    <div className="hrm-staff-avatar">
                      {m.profile_photo
                        ? <img src={`/uploads/${m.profile_photo}`} alt="photo" className="hrm-avatar-img" />
                        : `${m.first_name?.[0] ?? ''}${m.last_name?.[0] ?? ''}`.toUpperCase()
                      }
                    </div>
                    <div className="hrm-eval-card-info">
                      <strong>{m.first_name} {m.last_name}</strong>
                      <span>{m.role_name ?? m.email}</span>
                    </div>
                    <div className="hrm-eval-card-status">
                      {st === 'approved'  && <span className="hrm-cycle-badge hrm-cycle-approved"><CheckCircle size={11} /> Approved</span>}
                      {st === 'submitted' && <span className="hrm-cycle-badge hrm-cycle-submitted"><Send size={11} /> Submitted</span>}
                      {st === 'returned'  && <span className="hrm-cycle-badge" style={{ background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca' }}>Returned</span>}
                      {st === 'draft'     && <span className="hrm-cycle-badge" style={{ background:'#f3f4f6', color:'#6b7280', border:'1px solid #e5e7eb' }}>Draft</span>}
                    </div>
                  </div>

                  {kpis.length === 0 ? (
                    <p className="hrm-eval-no-kpi">No KPIs assigned to this staff member.</p>
                  ) : (
                    <div className="hrm-eval-kpi-list">
                      {kpis.map(k => {
                        const edit   = kpiEdits[k.staff_kpi_id] ?? { rating: '', notes: '' };
                        const locked = st === 'draft' || st === 'submitted' || st === 'approved';
                        return (
                          <div key={k.staff_kpi_id} className="hrm-eval-kpi-row">
                            <div className="hrm-eval-kpi-meta">
                              <span className="hrm-eval-kpi-name">{k.title}</span>
                              {k.target && <span className="hrm-eval-kpi-target">Target: {k.target}</span>}
                            </div>
                            <div className="hrm-eval-kpi-inputs">
                              <select
                                className={`sm-input hrm-select${edit.rating ? ' hrm-sel-rated' : ''}`}
                                value={edit.rating}
                                onChange={e => updateKpiEdit(k.staff_kpi_id, 'rating', e.target.value)}
                                disabled={locked}
                              >
                                <option value="">— Rating —</option>
                                {RATING_OPTIONS.map(o => (
                                  <option key={o.value} value={o.value}>{o.label} ({o.points} pts)</option>
                                ))}
                              </select>
                              <input
                                type="text"
                                className="sm-input hrm-eval-notes-inp"
                                placeholder="Notes (optional)"
                                value={edit.notes}
                                onChange={e => updateKpiEdit(k.staff_kpi_id, 'notes', e.target.value)}
                                disabled={locked}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(st === 'submitted' || st === 'approved') && (
                    <div className="hrm-eval-card-footer">
                      {st === 'submitted' && <span className="hrm-submitted-note"><CheckCircle size={13} /> Awaiting admin review</span>}
                      {st === 'approved'  && <span className="hrm-submitted-note" style={{ color: '#16a34a' }}><CheckCircle size={13} /> Approved</span>}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {!evalMode && <>

      {/* Tabs */}
      <div className="hrm-tabs">
        <button className={`hrm-tab${tab === 'staff' ? ' active' : ''}`} onClick={() => setTab('staff')}>
          <Users size={15} /> Staff & KPIs
        </button>
        <button className={`hrm-tab${tab === 'kpis' ? ' active' : ''}`} onClick={() => setTab('kpis')}>
          <Target size={15} /> KPI Library <span className="hrm-tab-count">{kpis.length}</span>
        </button>
        <button className={`hrm-tab${tab === 'leaderboard' ? ' active' : ''}`} onClick={() => setTab('leaderboard')}>
          <Award size={15} /> Leaderboard
        </button>
      </div>

      {/* ── Cycle picker (staff tab only) ── */}
      {tab === 'staff' && openCycles.length > 0 && (
        <div className="hrm-cycle-picker">
          <div className="hrm-cycle-picker-hdr">
            <CalendarRange size={15} />
            <strong>Evaluation Cycles</strong>
            <span className="hrm-cycle-picker-hint">Select an open cycle to begin evaluating staff</span>
          </div>
          <div className="hrm-cycle-picker-list">
            {openCycles.map(c => {
              const notStartedYet = new Date(c.start_date) > new Date();
              const opensAt = new Date(c.start_date).toLocaleString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
              });
              return (
                <div key={c.id} className={`hrm-cycle-picker-item${notStartedYet ? ' hrm-cycle-picker-item--scheduled' : ''}`}>
                  <div className="hrm-cycle-picker-info">
                    <strong>{c.name}</strong>
                    {notStartedYet
                      ? <span className="hrm-cycle-scheduled-note"><Clock size={11} /> Opens at {opensAt}</span>
                      : <>
                          <span>Portal opens: {opensAt}</span>
                          <span>Portal closes: {new Date(c.end_date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </>
                    }
                  </div>
                  {notStartedYet
                    ? <span className="hrm-cycle-scheduled-badge">Scheduled</span>
                    : (
                      <button
                        className="btn-primary"
                        style={{ fontSize: '0.8rem', padding: '0.38rem 0.9rem', whiteSpace: 'nowrap' }}
                        onClick={() => enterEvalMode(c)}
                        disabled={loadingEvalMode}
                      >
                        {loadingEvalMode
                          ? <><Loader2 size={13} className="spin" /> Loading…</>
                          : <><Target size={13} /> Start Evaluation</>
                        }
                      </button>
                    )
                  }
                </div>
              );
            })}
          </div>
        </div>
      )}
      {tab === 'staff' && openCycles.length === 0 && (
        <div className="hrm-no-cycles">
          <CalendarRange size={15} />
          No open evaluation cycles. Admin must create and open a cycle before evaluations can begin.
        </div>
      )}

      {/* ── Staff & KPIs tab ── */}
      {tab === 'staff' && (
        <div className="hrm-staff-list">
          {staff.length === 0 && (
            <div className="empty-state"><Users size={38} /><p>No staff members found.</p></div>
          )}
          {staff.map(m => (
            <div key={m.users_id} className="hrm-staff-card">
              <div className="hrm-staff-row" onClick={() => toggleExpand(m.users_id)}>
                <div className="hrm-staff-avatar">
                  {m.profile_photo
                    ? <img src={`/uploads/${m.profile_photo}`} alt="photo" className="hrm-avatar-img" />
                    : `${m.first_name?.[0] ?? ''}${m.last_name?.[0] ?? ''}`.toUpperCase()
                  }
                </div>
                <div className="hrm-staff-info">
                  <p className="hrm-staff-name">{m.first_name} {m.last_name}</p>
                  <p className="hrm-staff-role">{m.role_name ?? m.email}</p>
                </div>
                <div className="hrm-staff-stats">
                  <div className="hrm-stat"><Target size={12} /> {m.kpi_count} KPI{m.kpi_count !== 1 ? 's' : ''}</div>
                  <div className="hrm-stat"><Star size={12} /> {m.eval_count} eval{m.eval_count !== 1 ? 's' : ''}</div>
                  <PointsBadge points={m.total_points} />
                  <PerfBadge pct={m.eval_count > 0 ? Math.round((m.total_points / (m.eval_count * 100)) * 100) : 0} />
                </div>
                <div className="hrm-expand-btn">
                  {expanded === m.users_id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {expanded === m.users_id && (
                <div className="hrm-staff-detail">
                  {loadingMember && <div className="hrm-loading"><Loader2 size={16} className="spin" /> Loading…</div>}

                  {!loadingMember && (
                    <>
                      {/* KPIs section */}
                      <div className="hrm-detail-section">
                        <div className="hrm-detail-header">
                          <p className="hrm-detail-label">Assigned KPIs</p>
                          <button
                            className="hrm-mini-btn"
                            onClick={() => {
                              if (assignKpiFor === m.users_id) { setAssignKpiFor(null); }
                              else { setAssignKpiFor(m.users_id); setAssignDue(defaultDueDate()); }
                            }}
                          >
                            <Plus size={12} /> Assign KPI
                          </button>
                        </div>

                        {assignKpiFor === m.users_id && (
                          <div className="hrm-inline-form">
                            {(() => {
                              const assignedKpiIds = new Set((staffKpis[m.users_id] ?? []).map(sk => sk.kpi_id));
                              const available = kpis.filter(k => !assignedKpiIds.has(k.id));
                              return (
                                <select className="sm-input hrm-select" value={assignKpiId} onChange={e => setAssignKpiId(e.target.value)}>
                                  <option value="">— Select KPI —</option>
                                  {available.length === 0
                                    ? <option disabled>All KPIs already assigned</option>
                                    : available.map(k => <option key={k.id} value={k.id}>{k.title}</option>)
                                  }
                                </select>
                              );
                            })()}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <input className="sm-input" type="date" value={assignDue}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={e => setAssignDue(e.target.value)} />
                              <span style={{ fontSize: '0.68rem', color: '#9ab09a' }}>Due date · defaults to 2 weeks from today</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn-primary" style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
                                onClick={() => handleAssignKpi(m.users_id)} disabled={assigningKpi || !assignKpiId}>
                                {assigningKpi ? <Loader2 size={12} className="spin" /> : <CheckCircle size={12} />} Assign
                              </button>
                              <button className="btn-secondary" style={{ fontSize: '0.78rem', padding: '0.4rem 0.7rem' }}
                                onClick={() => setAssignKpiFor(null)}>
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        )}

                        {(staffKpis[m.users_id] ?? []).length === 0
                          ? <p className="hrm-empty">No KPIs assigned.</p>
                          : (staffKpis[m.users_id] ?? []).map(sk => {
                              const pct    = sk.points ?? 0;
                              const status = kpiStatus(sk);
                              const barColor = pct >= 100 ? '#16a34a' : pct >= 75 ? '#2563eb' : pct >= 50 ? '#d97706' : pct > 0 ? '#ef4444' : '#cbd5e1';
                              return (
                                <div key={sk.staff_kpi_id} className="hrm-kpi-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.35rem' }}>
                                  {/* Title row */}
                                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                                    <div>
                                      <span className="hrm-kpi-title">{sk.title}</span>
                                      {sk.due_date && (
                                        <span className="hrm-kpi-due"><Calendar size={10} /> Due {fmtDate(sk.due_date)}</span>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                                      <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: status.bg, color: status.color, border: `1px solid ${status.color}30`, whiteSpace: 'nowrap' }}>
                                        {status.label}
                                      </span>
                                      <button className="hrm-remove-btn" onClick={() => handleRemoveStaffKpi(m.users_id, sk.staff_kpi_id)}>
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </div>
                                  {/* Progress bar */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden' }}>
                                      <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 3, transition: 'width 0.4s ease' }} />
                                    </div>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: pct > 0 ? '#374151' : '#9ab09a', minWidth: 32, textAlign: 'right' }}>{pct}%</span>
                                    {sk.rating && <RatingBadge rating={sk.rating} />}
                                  </div>
                                </div>
                              );
                            })
                        }
                      </div>

                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── KPI Library tab ── */}
      {tab === 'kpis' && (
        <div className="hrm-kpi-section">
          <div className="hrm-kpi-toolbar">
            <h3 className="hrm-section-title">KPI Library</h3>
            <button className="btn-primary" onClick={() => openKpiForm()}>
              <Plus size={14} /> New KPI
            </button>
          </div>

          {kpiForm && (
            <div className="hrm-kpi-form-card">
              {error && <div className="alert alert-error"><AlertCircle size={13} />{error}</div>}
              <form onSubmit={handleSaveKpi}>
                <div className="adp-field-grid">
                  <div className="adp-field adp-field-full">
                    <label className="sm-label">KPI Title *</label>
                    <input className="sm-input" value={kpiTitle} onChange={e => setKpiTitle(e.target.value)}
                      placeholder="e.g. Monthly Report Submission" disabled={savingKpi} />
                  </div>
                  <div className="adp-field adp-field-full">
                    <label className="sm-label">Description</label>
                    <textarea className="sm-input hrm-notes" value={kpiDesc} onChange={e => setKpiDesc(e.target.value)}
                      placeholder="Describe what this KPI measures…" rows={2} disabled={savingKpi} />
                  </div>
                  <div className="adp-field adp-field-full">
                    <label className="sm-label">Target</label>
                    <input className="sm-input" value={kpiTarget} onChange={e => setKpiTarget(e.target.value)}
                      placeholder="e.g. Submit 12 reports per year" disabled={savingKpi} />
                  </div>
                </div>
                <div className="sm-form-footer" style={{ margin: '1rem 0 0', padding: '1rem 0 0', borderTop: '1px solid #e4ede4' }}>
                  <button type="submit" className="sm-submit-btn" disabled={savingKpi || !kpiTitle.trim()}>
                    {savingKpi ? <><Loader2 size={14} className="spin" /> Saving…</> : <><CheckCircle size={14} /> {kpiEditId ? 'Update KPI' : 'Create KPI'}</>}
                  </button>
                  <button type="button" className="sm-cancel-btn" onClick={() => { setKpiForm(false); setKpiEditId(null); }}>
                    <X size={14} /> Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="table-card">
            <table className="saic-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Target</th>
                  <th>Assigned To</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {kpis.length === 0 && (
                  <tr><td colSpan={7}>
                    <div className="empty-state"><Target size={36} /><p>No KPIs created yet.</p></div>
                  </td></tr>
                )}
                {kpis.map((kpi, i) => (
                  <tr key={kpi.id}>
                    <td className="col-num">{i + 1}</td>
                    <td style={{ fontWeight: 700, color: '#1e3a1e', fontSize: '0.85rem' }}>{kpi.title}</td>
                    <td style={{ fontSize: '0.8rem', color: '#7a9a7a', maxWidth: 200 }}>{kpi.description ?? '—'}</td>
                    <td style={{ fontSize: '0.8rem', color: '#4a6c4a', maxWidth: 180 }}>{kpi.target ?? '—'}</td>
                    <td style={{ fontSize: '0.82rem', color: '#4a6c4a' }}>{kpi.assigned_count ?? 0}</td>
                    <td style={{ fontSize: '0.78rem', color: '#9ab09a', whiteSpace: 'nowrap' }}>{fmtDate(kpi.created_at)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="sm-btn-edit" onClick={() => openKpiForm(kpi)}><Pencil size={13} /> Edit</button>
                        <button className="sm-btn-delete"
                          onClick={() => handleDeleteKpi(kpi.id)}
                          disabled={deletingKpi === kpi.id}>
                          {deletingKpi === kpi.id ? <Loader2 size={13} className="spin" /> : <Trash2 size={13} />} Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Leaderboard tab ── */}
      {tab === 'leaderboard' && (
        <>
        <div className="hrm-lb-filter">
          <div className="hrm-lb-filter-row">
            <div className="hrm-lb-filter-field">
              <label>Cycle Start From</label>
              <input type="date" value={lbFrom} max={lbTo || undefined} onChange={e => setLbFrom(e.target.value)} />
            </div>
            <div className="hrm-lb-filter-field">
              <label>Cycle Start To</label>
              <input type="date" value={lbTo} min={lbFrom || undefined} onChange={e => setLbTo(e.target.value)} />
            </div>
            <button className="btn-primary" style={{ alignSelf: 'flex-end' }}
              onClick={() => loadSummary(lbFrom || undefined, lbTo || undefined)}>
              <RefreshCw size={13} /> Apply Filter
            </button>
            {(lbFrom || lbTo) && (
              <button className="btn-secondary" style={{ alignSelf: 'flex-end' }}
                onClick={() => { setLbFrom(''); setLbTo(''); loadSummary(); }}>
                <X size={13} /> Clear
              </button>
            )}
          </div>
        </div>
        <div className="table-card">
          <table className="saic-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Staff Member</th>
                <th>Role</th>
                <th>Performance</th>
                <th>KPI Score / Cycle</th>
                <th>Status</th>
                <th>Tasks Done</th>
              </tr>
            </thead>
            <tbody>
              {summary.length === 0 && (
                <tr><td colSpan={7}>
                  <div className="empty-state"><Award size={36} /><p>No staff members found.</p></div>
                </td></tr>
              )}
              {summary.map((row, i) => (
                <tr key={row.users_id} className={i < 3 ? `hrm-rank-${i + 1}` : ''}>
                  <td className="col-num">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td>
                    <p style={{ fontWeight: 700, color: '#1e3a1e', fontSize: '0.85rem', margin: 0 }}>
                      {row.first_name ? `${row.first_name} ${row.last_name}` : row.email}
                    </p>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#7a9a7a' }}>{row.role_name ?? '—'}</td>
                  <td><PerfBadge pct={row.performance_pct} /></td>
                  <td>
                    <ScoreBar score={row.kpi_score} />
                    {row.cycle_name && <div style={{ fontSize: '0.7rem', color: '#9ab09a', marginTop: 2 }}>{row.cycle_name}</div>}
                  </td>
                  <td><CycleStatusChip status={row.eval_status} /></td>
                  <td style={{ fontSize: '0.82rem', color: '#4a6c4a', fontWeight: 600 }}>
                    {row.task_completed ?? 0}/{row.task_total ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
      </>}
    </div>
  );
}
