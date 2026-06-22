import { useEffect, useState } from 'react';
import {
  Users, Target, Star, ChevronDown, ChevronUp, Plus, Pencil, Trash2,
  CheckCircle, X, Loader2, AlertCircle, RefreshCw, Award, Calendar,
} from 'lucide-react';
import {
  hrGetStaff, hrGetKpis, hrCreateKpi, hrUpdateKpi, hrDeleteKpi,
  hrGetStaffKpis, hrAssignKpi, hrDeleteStaffKpi,
  hrGetStaffEvaluations, hrAddEvaluation, hrGetEvaluationsSummary,
} from '../../api/hr';
import type { HRStaff, KPI, StaffKPI, PerformanceEvaluation, EvaluationSummary } from '../../api/hr';
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
  const kpi  = evalCount  > 0 ? (totalPoints / (evalCount * 100)) * 50 : 0;
  const task = taskTotal  > 0 ? (taskCompleted / taskTotal) * 50        : 0;
  return Math.round(kpi + task);
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

export default function HRManagerPage() {
  const [tab,     setTab]     = useState<Tab>('staff');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  // Staff tab
  const [staff,      setStaff]      = useState<HRStaff[]>([]);
  const [expanded,   setExpanded]   = useState<number | null>(null);
  const [staffKpis,  setStaffKpis]  = useState<Record<number, StaffKPI[]>>({});
  const [staffEvals, setStaffEvals] = useState<Record<number, PerformanceEvaluation[]>>({});
  const [loadingMember, setLoadingMember] = useState(false);

  // KPI assign sub-form per staff
  const [assignKpiFor, setAssignKpiFor] = useState<number | null>(null);
  const [assignKpiId,  setAssignKpiId]  = useState('');
  const [assignDue,    setAssignDue]    = useState('');
  const [assigningKpi, setAssigningKpi] = useState(false);

  // Eval sub-form per staff
  const [evalFor,     setEvalFor]    = useState<number | null>(null);
  const [evalRating,  setEvalRating] = useState('');
  const [evalKpiId,   setEvalKpiId]  = useState('');
  const [evalNotes,   setEvalNotes]  = useState('');
  const [addingEval,  setAddingEval] = useState(false);

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
  const [summary, setSummary] = useState<EvaluationSummary[]>([]);

  const loadStaff = () =>
    hrGetStaff().then(setStaff).catch(() => setError('Failed to load staff.'));

  const loadKpis = () =>
    hrGetKpis().then(setKpis).catch(() => {});

  const loadSummary = () =>
    hrGetEvaluationsSummary().then(setSummary).catch(() => {});

  useEffect(() => {
    setLoading(true);
    Promise.all([loadStaff(), loadKpis(), loadSummary()])
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = async (userId: number) => {
    if (expanded === userId) { setExpanded(null); return; }
    setExpanded(userId);
    setAssignKpiFor(null); setEvalFor(null);
    if (!staffKpis[userId]) {
      setLoadingMember(true);
      const [kpiRows, evalRows] = await Promise.all([
        hrGetStaffKpis(userId).catch(() => []),
        hrGetStaffEvaluations(userId).catch(() => []),
      ]);
      setStaffKpis(prev => ({ ...prev, [userId]: kpiRows }));
      setStaffEvals(prev => ({ ...prev, [userId]: evalRows }));
      setLoadingMember(false);
    }
  };

  const reloadMember = async (userId: number) => {
    const [kpiRows, evalRows] = await Promise.all([
      hrGetStaffKpis(userId).catch(() => []),
      hrGetStaffEvaluations(userId).catch(() => []),
    ]);
    setStaffKpis(prev => ({ ...prev, [userId]: kpiRows }));
    setStaffEvals(prev => ({ ...prev, [userId]: evalRows }));
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

  const handleAddEval = async (userId: number) => {
    if (!evalRating) return;
    setAddingEval(true); setError('');
    try {
      await hrAddEvaluation(userId, {
        rating: evalRating,
        notes: evalNotes.trim() || undefined,
        staff_kpi_id: evalKpiId ? Number(evalKpiId) : undefined,
      });
      setSuccess('Evaluation recorded.'); setEvalFor(null);
      setEvalRating(''); setEvalKpiId(''); setEvalNotes('');
      await reloadMember(userId);
    } catch { setError('Failed to record evaluation.'); }
    finally { setAddingEval(false); }
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
                            onClick={() => setAssignKpiFor(assignKpiFor === m.users_id ? null : m.users_id)}
                          >
                            <Plus size={12} /> Assign KPI
                          </button>
                        </div>

                        {assignKpiFor === m.users_id && (
                          <div className="hrm-inline-form">
                            <select className="sm-input hrm-select" value={assignKpiId} onChange={e => setAssignKpiId(e.target.value)}>
                              <option value="">— Select KPI —</option>
                              {kpis.map(k => <option key={k.id} value={k.id}>{k.title}</option>)}
                            </select>
                            <input className="sm-input" type="date" value={assignDue} onChange={e => setAssignDue(e.target.value)}
                              placeholder="Due date (optional)" />
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
                          : (staffKpis[m.users_id] ?? []).map(sk => (
                              <div key={sk.staff_kpi_id} className="hrm-kpi-item">
                                <div className="hrm-kpi-info">
                                  <span className="hrm-kpi-title">{sk.title}</span>
                                  {sk.due_date && <span className="hrm-kpi-due"><Calendar size={10} /> Due {fmtDate(sk.due_date)}</span>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <RatingBadge rating={sk.rating} />
                                  <button className="hrm-remove-btn" onClick={() => handleRemoveStaffKpi(m.users_id, sk.staff_kpi_id)}>
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </div>
                            ))
                        }
                      </div>

                      {/* Evaluations section */}
                      <div className="hrm-detail-section">
                        <div className="hrm-detail-header">
                          <p className="hrm-detail-label">Performance Evaluations</p>
                          <button
                            className="hrm-mini-btn"
                            onClick={() => setEvalFor(evalFor === m.users_id ? null : m.users_id)}
                          >
                            <Plus size={12} /> Add Evaluation
                          </button>
                        </div>

                        {evalFor === m.users_id && (
                          <div className="hrm-inline-form">
                            <select className="sm-input hrm-select" value={evalRating} onChange={e => setEvalRating(e.target.value)}>
                              <option value="">— Select Rating —</option>
                              {RATING_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label} ({o.points} pts)</option>
                              ))}
                            </select>
                            <select className="sm-input hrm-select" value={evalKpiId} onChange={e => setEvalKpiId(e.target.value)}>
                              <option value="">— Link to KPI (optional) —</option>
                              {(staffKpis[m.users_id] ?? []).map(sk => (
                                <option key={sk.staff_kpi_id} value={sk.staff_kpi_id}>{sk.title}</option>
                              ))}
                            </select>
                            <textarea className="sm-input hrm-notes" value={evalNotes} onChange={e => setEvalNotes(e.target.value)}
                              placeholder="Notes (optional)" rows={2} />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn-primary" style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
                                onClick={() => handleAddEval(m.users_id)} disabled={addingEval || !evalRating}>
                                {addingEval ? <Loader2 size={12} className="spin" /> : <Star size={12} />} Record
                              </button>
                              <button className="btn-secondary" style={{ fontSize: '0.78rem', padding: '0.4rem 0.7rem' }}
                                onClick={() => setEvalFor(null)}>
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        )}

                        {(staffEvals[m.users_id] ?? []).length === 0
                          ? <p className="hrm-empty">No evaluations yet.</p>
                          : (staffEvals[m.users_id] ?? []).map(ev => (
                              <div key={ev.id} className="hrm-eval-item">
                                <RatingBadge rating={ev.rating} />
                                {ev.kpi_title && <span className="hrm-eval-kpi">{ev.kpi_title}</span>}
                                {ev.notes && <span className="hrm-eval-notes">{ev.notes}</span>}
                                <span className="hrm-eval-date">{fmtDate(ev.evaluated_at)}</span>
                              </div>
                            ))
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
        <div className="table-card">
          <table className="saic-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Staff Member</th>
                <th>Role</th>
                <th>Performance</th>
                <th>KPI Points</th>
                <th>Tasks Done</th>
                <th>Last Evaluated</th>
              </tr>
            </thead>
            <tbody>
              {summary.length === 0 && (
                <tr><td colSpan={7}>
                  <div className="empty-state"><Award size={36} /><p>No evaluations recorded yet.</p></div>
                </td></tr>
              )}
              {summary.map((row, i) => {
                const pct = calcPerf(row.eval_count, row.total_points, row.task_total ?? 0, row.task_completed ?? 0);
                return (
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
                    <td><PerfBadge pct={pct} /></td>
                    <td><PointsBadge points={row.total_points} /></td>
                    <td style={{ fontSize: '0.82rem', color: '#4a6c4a', fontWeight: 600 }}>
                      {row.task_completed ?? 0}/{row.task_total ?? 0}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#9ab09a', whiteSpace: 'nowrap' }}>{fmtDate(row.last_evaluated)}</td>
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
