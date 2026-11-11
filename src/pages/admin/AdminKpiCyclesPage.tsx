import { Fragment, useEffect, useState } from 'react';
import {
  CalendarRange, Plus, Pencil, Trash2, Play, Square, RotateCcw,
  Eye, X, CheckCircle, XCircle, Loader2, AlertCircle, RefreshCw,
  Users, Clock, TrendingUp, ChevronLeft, ChevronDown,
} from 'lucide-react';
import {
  listKpiCycles, getKpiCycle, createKpiCycle, updateKpiCycle, deleteKpiCycle,
  openKpiCycle, closeKpiCycle, reopenKpiCycle,
  getCycleDashboard, getCycleEvaluations, reviewEvaluation,
  getCycleStaffKpis,
} from '../../api/kpiCycles';
import type { KpiCycle, CycleDashboard, CycleEvaluation, CycleKpiBreakdown } from '../../api/kpiCycles';
import { adminGetDepartments } from '../../api/role';
import type { Department } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../shared/SharedPages.css';
import './AdminKpiCyclesPage.css';
import './StaffManagementPage.css';

function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: KpiCycle['status'] }) {
  const map: Record<string, { label: string; cls: string }> = {
    draft:     { label: 'Draft',     cls: 'akc-status-draft' },
    scheduled: { label: 'Scheduled', cls: 'akc-status-scheduled' },
    open:      { label: 'Open',      cls: 'akc-status-open' },
    closed:    { label: 'Closed',    cls: 'akc-status-closed' },
  };
  const m = map[status] ?? map.draft;
  return <span className={`akc-status-badge ${m.cls}`}>{m.label}</span>;
}

function EvalStatusBadge({ status }: { status: CycleEvaluation['status'] }) {
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

function RatingBadge({ rating }: { rating: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    well_done: { label: 'Well Done', color: '#2563eb', bg: '#eff6ff' },
    medium:    { label: 'Medium',    color: '#d97706', bg: '#fffbeb' },
    high:      { label: 'High',      color: '#7c3aed', bg: '#f5f3ff' },
    excellent: { label: 'Excellent', color: '#16a34a', bg: '#f0fdf4' },
  };
  const m = map[rating] ?? { label: rating, color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700, color: m.color, background: m.bg }}>
      {m.label}
    </span>
  );
}

function ScoreBar({ score }: { score?: number | null }) {
  if (score == null) return <span style={{ color: '#b0b0b0', fontSize: '0.78rem' }}>N/A</span>;
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : score >= 40 ? '#2563eb' : '#dc2626';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 90 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: '0.78rem', fontWeight: 800, color }}>{score}%</span>
    </div>
  );
}

export default function AdminKpiCyclesPage() {
  const [cycles, setCycles]       = useState<KpiCycle[]>([]);
  const [cyclesPage, setCyclesPage] = useState(1);
  const CYCLES_PER_PAGE = 5;
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [successMsg, setSuccess]  = useState('');

  // Form state
  const [showForm, setShowForm]   = useState(false);
  const [editCycle, setEditCycle] = useState<KpiCycle | null>(null);
  const [departments, setDepts]   = useState<Department[]>([]);
  const [formError, setFormError] = useState('');
  const [formBusy, setFormBusy]   = useState(false);
  const [fName, setFName]         = useState('');
  const [fDesc, setFDesc]         = useState('');
  const [fStartDate, setFStartDate] = useState('');
  const [fStartTime, setFStartTime] = useState('08:00');
  const [fEndDate, setFEndDate]   = useState('');
  const [fEndTime, setFEndTime]   = useState('17:00');
  const [fScope, setFScope]       = useState<'all' | 'departments'>('all');
  const [fDeptIds, setFDeptIds]   = useState<number[]>([]);
  const [fAutoOpen, setFAutoOpen] = useState(true);
  const [fAutoClose, setFAutoClose] = useState(true);

  // Detail state
  const [viewCycle, setViewCycle]       = useState<KpiCycle | null>(null);
  const [dashboard, setDashboard]       = useState<CycleDashboard | null>(null);
  const [evaluations, setEvaluations]   = useState<CycleEvaluation[]>([]);
  const [detailLoading, setDetailLoad]  = useState(false);

  // Return modal
  const [returnTarget, setReturnTarget] = useState<{ evalId: number; staffName: string } | null>(null);
  const [returnComment, setReturnComment] = useState('');
  const [reviewing, setReviewing]       = useState(false);

  // KPI breakdown per eval row
  const [expandedEvalUser, setExpandedEvalUser] = useState<number | null>(null);
  const [kpiBreakdowns, setKpiBreakdowns]       = useState<Record<number, CycleKpiBreakdown[]>>({});
  const [loadingBreakdown, setLoadingBreakdown] = useState<number | null>(null);

  // Delete confirm modal
  const [deleteTarget, setDeleteTarget] = useState<KpiCycle | null>(null);
  const [deleting, setDeleting]         = useState(false);


  const flash = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 4000); };

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [cs, depts] = await Promise.all([listKpiCycles(), adminGetDepartments()]);
      setCycles(cs);
      setCyclesPage(1);
      setDepts(depts);
    } catch {
      setError('Failed to load KPI cycles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Re-fetch every 2 min so auto-open/close status changes appear without manual refresh
    const t = setInterval(() => {
      listKpiCycles().then(cs => { setCycles(cs); }).catch(() => {});
    }, 120_000);
    return () => clearInterval(t);
  }, []);

  const loadDetail = async (cycle: KpiCycle) => {
    setViewCycle(cycle);
    setDetailLoad(true);
    setExpandedEvalUser(null);
    setKpiBreakdowns({});
    try {
      const [dash, evals] = await Promise.all([
        getCycleDashboard(cycle.id),
        getCycleEvaluations(cycle.id),
      ]);
      setDashboard(dash);
      setEvaluations(evals);
    } catch { /* ignore */ }
    finally { setDetailLoad(false); }
  };

  const handleExpandEval = async (usersId: number) => {
    if (expandedEvalUser === usersId) { setExpandedEvalUser(null); return; }
    setExpandedEvalUser(usersId);
    if (kpiBreakdowns[usersId]) return; // already loaded
    if (!viewCycle) return;
    setLoadingBreakdown(usersId);
    try {
      const kpis = await getCycleStaffKpis(viewCycle.id, usersId);
      setKpiBreakdowns(prev => ({ ...prev, [usersId]: kpis }));
    } catch { /* ignore */ }
    finally { setLoadingBreakdown(null); }
  };

  const openForm = async (cycle?: KpiCycle) => {
    if (cycle) {
      let full = cycle;
      try { full = await getKpiCycle(cycle.id); } catch { /* use what we have */ }
      setEditCycle(full);
      setFName(full.name);
      setFDesc(full.description ?? '');
      const sd = new Date(full.start_date);
      const ed = new Date(full.end_date);
      setFStartDate(sd.toISOString().split('T')[0]);
      setFStartTime(sd.toTimeString().slice(0, 5));
      setFEndDate(ed.toISOString().split('T')[0]);
      setFEndTime(ed.toTimeString().slice(0, 5));
      setFScope(full.scope ?? 'all');
      setFDeptIds(full.department_ids ?? []);
      setFAutoOpen(!!full.auto_open);
      setFAutoClose(!!full.auto_close);
    } else {
      setEditCycle(null);
      setFName(''); setFDesc('');
      setFStartDate(''); setFStartTime('08:00');
      setFEndDate(''); setFEndTime('17:00');
      setFScope('all'); setFDeptIds([]);
      setFAutoOpen(true); setFAutoClose(true);
    }
    setFormError('');
    setShowForm(true);
  };

  const handleSubmitForm = async () => {
    if (!fName.trim()) { setFormError('Cycle name is required.'); return; }
    if (!fStartDate)   { setFormError('Start date is required.'); return; }
    if (!fEndDate)     { setFormError('End date is required.'); return; }
    setFormBusy(true); setFormError('');
    try {
      const payload = {
        name: fName.trim(),
        description: fDesc.trim() || undefined,
        start_date: `${fStartDate}T${fStartTime}:00`,
        end_date:   `${fEndDate}T${fEndTime}:00`,
        scope: fScope,
        auto_open:  fAutoOpen  ? 1 : 0,
        auto_close: fAutoClose ? 1 : 0,
        department_ids: fScope === 'departments' ? fDeptIds : [],
      };
      if (editCycle) {
        await updateKpiCycle(editCycle.id, payload);
        flash('Cycle updated successfully.');
      } else {
        await createKpiCycle(payload as Parameters<typeof createKpiCycle>[0]);
        flash('Cycle created. HR will be notified if it opened immediately.');
      }
      setShowForm(false);
      await load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg ?? 'Failed to save cycle.');
    } finally {
      setFormBusy(false);
    }
  };

  const handleOpen = async (cycle: KpiCycle) => {
    try {
      await openKpiCycle(cycle.id);
      flash(`Cycle "${cycle.name}" opened. HR has been notified.`);
      await load();
      if (viewCycle?.id === cycle.id) await loadDetail({ ...cycle, status: 'open' });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to open cycle.');
    }
  };

  const handleClose = async (cycle: KpiCycle) => {
    if (!confirm(`Close cycle "${cycle.name}"?\nHR will no longer be able to submit evaluations.`)) return;
    try {
      await closeKpiCycle(cycle.id);
      flash(`Cycle "${cycle.name}" closed.`);
      await load();
      if (viewCycle?.id === cycle.id) await loadDetail({ ...cycle, status: 'closed' });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to close cycle.');
    }
  };

  const handleReopen = async (cycle: KpiCycle) => {
    try {
      await reopenKpiCycle(cycle.id);
      flash(`Cycle "${cycle.name}" reopened.`);
      await load();
      if (viewCycle?.id === cycle.id) await loadDetail({ ...cycle, status: 'open' });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to reopen cycle.');
    }
  };

  const handleDelete = (cycle: KpiCycle) => setDeleteTarget(cycle);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteKpiCycle(deleteTarget.id);
      flash('Cycle deleted.');
      if (viewCycle?.id === deleteTarget.id) setViewCycle(null);
      setDeleteTarget(null);
      await load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to delete cycle.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleApprove = async (ev: CycleEvaluation) => {
    if (!viewCycle) return;
    setReviewing(true);
    try {
      await reviewEvaluation(viewCycle.id, ev.id, { action: 'approve' });
      flash('Evaluation approved.');
      await loadDetail(viewCycle);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to approve evaluation.');
    } finally { setReviewing(false); }
  };

  const handleApproveAll = async () => {
    if (!viewCycle) return;
    const pending = evaluations.filter(ev => ev.status === 'submitted');
    if (pending.length === 0) return;
    setReviewing(true);
    let approved = 0;
    for (const ev of pending) {
      try {
        await reviewEvaluation(viewCycle.id, ev.id, { action: 'approve' });
        approved++;
      } catch { /* skip already-approved or errored */ }
    }
    flash(`${approved} evaluation${approved !== 1 ? 's' : ''} approved.`);
    await loadDetail(viewCycle);
    setReviewing(false);
  };

  const handleReturn = async () => {
    if (!viewCycle || !returnTarget) return;
    setReviewing(true);
    try {
      await reviewEvaluation(viewCycle.id, returnTarget.evalId, {
        action: 'return',
        review_comment: returnComment.trim() || undefined,
      });
      flash('Evaluation returned for correction.');
      setReturnTarget(null); setReturnComment('');
      await loadDetail(viewCycle);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to return evaluation.');
    } finally { setReviewing(false); }
  };

  const toggleDept = (id: number) =>
    setFDeptIds(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);


  if (loading) return <LoadingSpinner message="Loading KPI cycles…" />;

  return (
    <div className="akc-root">
      <PageHeader
        title="KPI Evaluation Cycles"
        subtitle="Create and manage performance evaluation cycles"
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={load}><RefreshCw size={14} /> Refresh</button>
            <button className="btn-primary" onClick={() => openForm()}>
              <Plus size={14} /> Create Cycle
            </button>
          </div>
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
      {successMsg && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <CheckCircle size={15} /> {successMsg}
        </div>
      )}

      {/* ── Create / Edit Form ── */}
      {showForm && (
        <div className="akc-form-panel">
          <div className="akc-form-header">
            <h3><CalendarRange size={16} /> {editCycle ? 'Edit Cycle' : 'Create Evaluation Cycle'}</h3>
            <button className="akc-form-close" onClick={() => setShowForm(false)}><X size={16} /></button>
          </div>
          <div className="akc-form-body">
            {formError && (
              <div className="alert alert-error" style={{ marginBottom: '0.75rem', fontSize: '0.83rem' }}>{formError}</div>
            )}

            <div className="akc-form-row">
              <div className="akc-form-field akc-field-full">
                <label>Cycle Name *</label>
                <input type="text" value={fName} onChange={e => setFName(e.target.value)}
                  placeholder="e.g. Q2 KPI Evaluation 2026" />
              </div>
            </div>

            <div className="akc-form-row">
              <div className="akc-form-field akc-field-full">
                <label>Description</label>
                <textarea value={fDesc} onChange={e => setFDesc(e.target.value)}
                  rows={2} placeholder="Optional description…" />
              </div>
            </div>

            <div className="akc-form-row">
              <div className="akc-form-field">
                <label>Start Date *</label>
                <input type="date" value={fStartDate} onChange={e => setFStartDate(e.target.value)}
                  min={!editCycle ? new Date().toISOString().split('T')[0] : undefined} />
              </div>
              <div className="akc-form-field">
                <label>Start Time</label>
                <input type="time" value={fStartTime} onChange={e => setFStartTime(e.target.value)} />
              </div>
              <div className="akc-form-field">
                <label>End Date *</label>
                <input type="date" value={fEndDate} onChange={e => setFEndDate(e.target.value)}
                  min={fStartDate || new Date().toISOString().split('T')[0]} />
              </div>
              <div className="akc-form-field">
                <label>End Time</label>
                <input type="time" value={fEndTime} onChange={e => setFEndTime(e.target.value)} />
              </div>
            </div>

            <div className="akc-form-row">
              <div className="akc-form-field">
                <label>Scope</label>
                <select value={fScope} onChange={e => setFScope(e.target.value as 'all' | 'departments')}>
                  <option value="all">All Departments</option>
                  <option value="departments">Selected Departments Only</option>
                </select>
              </div>
            </div>

            {fScope === 'departments' && (
              <div className="akc-form-row">
                <div className="akc-form-field akc-field-full">
                  <label>Select Departments</label>
                  <div className="akc-dept-checks">
                    {departments.length === 0 && (
                      <span style={{ color: '#a0b8a0', fontSize: '0.8rem' }}>No departments found.</span>
                    )}
                    {departments.map(d => (
                      <label key={d.id} className="akc-dept-check">
                        <input type="checkbox" checked={fDeptIds.includes(d.id)} onChange={() => toggleDept(d.id)} />
                        {d.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="akc-form-row">
              <div className="akc-form-field">
                <label className="akc-check-label">
                  <input type="checkbox" checked={fAutoOpen} onChange={e => setFAutoOpen(e.target.checked)} />
                  Auto-open at start date &amp; time
                </label>
              </div>
              <div className="akc-form-field">
                <label className="akc-check-label">
                  <input type="checkbox" checked={fAutoClose} onChange={e => setFAutoClose(e.target.checked)} />
                  Auto-close at end date &amp; time
                </label>
              </div>
            </div>

            <div className="akc-form-actions">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmitForm} disabled={formBusy}>
                {formBusy ? <><Loader2 size={14} className="akc-spin" /> Saving…</> : (editCycle ? 'Update Cycle' : 'Create Cycle')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cycles Table ── */}
      <div className="table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="saic-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Period</th>
                <th>Status</th>
                <th>Scope</th>
                <th>Evaluated</th>
                <th>Approved</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cycles.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#a0b8a0', padding: '2.5rem' }}>
                    No KPI evaluation cycles yet. Create one to get started.
                  </td>
                </tr>
              )}
              {cycles.slice((cyclesPage - 1) * CYCLES_PER_PAGE, cyclesPage * CYCLES_PER_PAGE).map((c, i) => (
                <tr key={c.id} className={viewCycle?.id === c.id ? 'akc-row-active' : ''}>
                  <td style={{ color: '#a0b8a0', fontSize: '0.78rem' }}>{(cyclesPage - 1) * CYCLES_PER_PAGE + i + 1}</td>
                  <td>
                    <strong style={{ color: '#2D5016' }}>{c.name}</strong>
                    {c.description && (
                      <div style={{ fontSize: '0.74rem', color: '#6a8c6a', marginTop: 2 }}>{c.description}</div>
                    )}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#4a6a4a' }}>
                    <div>{fmtDateTime(c.start_date)}</div>
                    <div style={{ color: '#9ab89a' }}>→ {fmtDateTime(c.end_date)}</div>
                  </td>
                  <td><StatusBadge status={c.status} /></td>
                  <td style={{ fontSize: '0.8rem', color: '#6a8c6a' }}>
                    {c.scope === 'all' ? 'All Depts' : 'Selected'}
                  </td>
                  <td><span style={{ fontWeight: 700, color: '#2563eb' }}>{c.evaluated_count ?? 0}</span></td>
                  <td><span style={{ fontWeight: 700, color: '#16a34a' }}>{c.approved_count ?? 0}</span></td>
                  <td>
                    <div className="akc-actions">
                      <button className="akc-btn akc-btn-view" title="View Details" onClick={() => loadDetail(c)}>
                        <Eye size={12} /> View
                      </button>
                      {(c.status === 'draft' || c.status === 'scheduled') && (
                        <>
                          <button className="akc-btn akc-btn-open" onClick={() => handleOpen(c)}>
                            <Play size={12} /> Open
                          </button>
                          <button className="akc-btn akc-btn-edit" onClick={() => openForm(c)}>
                            <Pencil size={12} />
                          </button>
                        </>
                      )}
                      {c.status === 'open' && (
                        <>
                          <button className="akc-btn akc-btn-close" onClick={() => handleClose(c)}>
                            <Square size={12} /> Close
                          </button>
                          <button className="akc-btn akc-btn-edit" onClick={() => openForm(c)}>
                            <Pencil size={12} />
                          </button>
                        </>
                      )}
                      {c.status === 'closed' && (
                        <button className="akc-btn akc-btn-reopen" onClick={() => handleReopen(c)}>
                          <RotateCcw size={12} /> Reopen
                        </button>
                      )}
                      <button className="akc-btn akc-btn-delete" onClick={() => handleDelete(c)}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {cycles.length > CYCLES_PER_PAGE && (
          <div className="akc-pagination">
            <button className="akc-page-btn" disabled={cyclesPage === 1} onClick={() => setCyclesPage(p => p - 1)}>
              ‹ Prev
            </button>
            {Array.from({ length: Math.ceil(cycles.length / CYCLES_PER_PAGE) }, (_, i) => i + 1).map(p => (
              <button key={p} className={`akc-page-btn${p === cyclesPage ? ' akc-page-btn--active' : ''}`}
                onClick={() => setCyclesPage(p)}>
                {p}
              </button>
            ))}
            <button className="akc-page-btn" disabled={cyclesPage === Math.ceil(cycles.length / CYCLES_PER_PAGE)}
              onClick={() => setCyclesPage(p => p + 1)}>
              Next ›
            </button>
          </div>
        )}
      </div>

      {/* ── Detail Panel ── */}
      {viewCycle && (
        <div className="akc-detail-panel">
          <div className="akc-detail-header">
            <button className="akc-back-btn" onClick={() => setViewCycle(null)}>
              <ChevronLeft size={16} />
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, color: '#2D5016', fontSize: '1rem' }}>{viewCycle.name}</span>
                <StatusBadge status={viewCycle.status} />
              </div>
              <div style={{ fontSize: '0.78rem', color: '#6a8c6a', marginTop: 2 }}>
                {fmtDateTime(viewCycle.start_date)} &nbsp;→&nbsp; {fmtDateTime(viewCycle.end_date)}
              </div>
            </div>
          </div>

          {detailLoading ? (
            <div style={{ padding: '2rem' }}><LoadingSpinner message="Loading details…" /></div>
          ) : (
            <>
              {/* Dashboard stats */}
              {dashboard && (
                <div className="akc-stat-grid">
                  <div className="akc-stat-card">
                    <div className="akc-stat-icon"><Users size={20} /></div>
                    <div className="akc-stat-value">{dashboard.total_staff}</div>
                    <div className="akc-stat-label">Total Staff</div>
                  </div>
                  <div className="akc-stat-card akc-stat-pending">
                    <div className="akc-stat-icon"><Clock size={20} /></div>
                    <div className="akc-stat-value">{dashboard.pending_count}</div>
                    <div className="akc-stat-label">Pending</div>
                  </div>
                  <div className="akc-stat-card akc-stat-evaluated">
                    <div className="akc-stat-icon"><CalendarRange size={20} /></div>
                    <div className="akc-stat-value">{dashboard.evaluated_count}</div>
                    <div className="akc-stat-label">Evaluated</div>
                  </div>
                  <div className="akc-stat-card akc-stat-submitted">
                    <div className="akc-stat-icon"><Clock size={20} /></div>
                    <div className="akc-stat-value">{dashboard.submitted_count}</div>
                    <div className="akc-stat-label">Awaiting Review</div>
                  </div>
                  <div className="akc-stat-card akc-stat-approved">
                    <div className="akc-stat-icon"><CheckCircle size={20} /></div>
                    <div className="akc-stat-value">{dashboard.approved_count}</div>
                    <div className="akc-stat-label">Approved</div>
                  </div>
                  <div className="akc-stat-card akc-stat-returned">
                    <div className="akc-stat-icon"><XCircle size={20} /></div>
                    <div className="akc-stat-value">{dashboard.returned_count}</div>
                    <div className="akc-stat-label">Returned</div>
                  </div>
                  <div className="akc-stat-card akc-stat-completion">
                    <div className="akc-stat-icon"><TrendingUp size={20} /></div>
                    <div className="akc-stat-value">{dashboard.completion_pct}%</div>
                    <div className="akc-stat-label">Completion</div>
                  </div>
                </div>
              )}

              {/* Evaluations table */}
              <div style={{ padding: '0 1.25rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ margin: 0, color: '#2D5016', fontSize: '0.88rem', fontWeight: 700 }}>
                    Staff Evaluations ({evaluations.length})
                  </h4>
                  {evaluations.some(ev => ev.status === 'submitted') && (
                    <button
                      className="akc-btn akc-btn-approve"
                      onClick={handleApproveAll}
                      disabled={reviewing}
                      style={{ fontSize: '0.78rem', padding: '0.32rem 0.85rem' }}
                    >
                      {reviewing
                        ? <><Loader2 size={12} className="akc-spin" /> Approving…</>
                        : <><CheckCircle size={12} /> Approve All</>
                      }
                    </button>
                  )}
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="saic-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Staff Member</th>
                        <th>Department</th>
                        <th>KPI Score</th>
                        <th>Status</th>
                        <th>HR Evaluator</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evaluations.length === 0 && (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', color: '#a0b8a0', padding: '1.5rem' }}>
                            No evaluations submitted yet.
                          </td>
                        </tr>
                      )}
                      {evaluations.map((ev, i) => {
                        const isExpanded = expandedEvalUser === ev.users_id;
                        const breakdown  = kpiBreakdowns[ev.users_id];
                        const isLoading  = loadingBreakdown === ev.users_id;
                        return (
                          <Fragment key={ev.id}>
                            <tr className={isExpanded ? 'akc-row-active' : undefined}>
                              <td style={{ color: '#a0b8a0', fontSize: '0.78rem' }}>{i + 1}</td>
                              <td>
                                <strong>{ev.first_name} {ev.last_name}</strong>
                                <div style={{ fontSize: '0.74rem', color: '#6a8c6a' }}>{ev.email}</div>
                              </td>
                              <td style={{ fontSize: '0.8rem', color: '#6a8c6a' }}>{ev.department_name ?? '—'}</td>
                              <td><ScoreBar score={ev.kpi_score} /></td>
                              <td>
                                <EvalStatusBadge status={ev.status} />
                                {ev.review_comment && (
                                  <div style={{ fontSize: '0.72rem', color: '#dc2626', marginTop: 3, maxWidth: 180 }}>
                                    {ev.review_comment}
                                  </div>
                                )}
                              </td>
                              <td style={{ fontSize: '0.8rem', color: '#6a8c6a' }}>{ev.evaluator_name ?? '—'}</td>
                              <td style={{ fontSize: '0.78rem', color: '#6a8c6a' }}>{fmtDate(ev.submitted_at)}</td>
                              <td>
                                <div className="akc-actions">
                                  <button
                                    className={`akc-btn ${isExpanded ? 'akc-btn-view' : 'akc-btn-edit'}`}
                                    onClick={() => handleExpandEval(ev.users_id)}
                                    title={isExpanded ? 'Collapse KPI breakdown' : 'View KPI breakdown'}
                                  >
                                    {isLoading
                                      ? <Loader2 size={12} className="akc-spin" />
                                      : <ChevronDown size={12} style={{ transform: isExpanded ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }} />
                                    }
                                    KPIs
                                  </button>
                                  {ev.status === 'submitted' && (
                                    <>
                                      <button
                                        className="akc-btn akc-btn-approve"
                                        onClick={() => handleApprove(ev)}
                                        disabled={reviewing}
                                      >
                                        <CheckCircle size={12} /> Approve
                                      </button>
                                      <button
                                        className="akc-btn akc-btn-return-ev"
                                        onClick={() => { setReturnTarget({ evalId: ev.id, staffName: `${ev.first_name} ${ev.last_name}` }); setReturnComment(''); }}
                                      >
                                        <XCircle size={12} /> Return
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr key={`kpi-${ev.id}`} className="akc-kpi-breakdown-row">
                                <td colSpan={8} style={{ padding: 0 }}>
                                  <div className="akc-kpi-breakdown">
                                    {isLoading || !breakdown ? (
                                      <div className="akc-kpi-breakdown-loading">
                                        <Loader2 size={14} className="akc-spin" /> Loading KPI breakdown…
                                      </div>
                                    ) : breakdown.length === 0 ? (
                                      <div className="akc-kpi-breakdown-empty">
                                        No individual KPI ratings recorded for this cycle period.
                                      </div>
                                    ) : (
                                      <table className="akc-kpi-inner-table">
                                        <thead>
                                          <tr>
                                            <th>KPI</th>
                                            <th>Target</th>
                                            <th>Rating</th>
                                            <th>Points</th>
                                            <th>Notes</th>
                                            <th>Evaluated</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {breakdown.map(k => (
                                            <tr key={k.kpi_id}>
                                              <td style={{ fontWeight: 600, color: '#2D5016' }}>{k.title}</td>
                                              <td style={{ fontSize: '0.78rem', color: '#6a8c6a' }}>{k.target ?? '—'}</td>
                                              <td><RatingBadge rating={k.rating} /></td>
                                              <td>
                                                <span className="akc-kpi-points">{k.points}</span>
                                                <span style={{ fontSize: '0.7rem', color: '#9ab89a' }}> pts</span>
                                              </td>
                                              <td style={{ fontSize: '0.78rem', color: '#6a8c6a', maxWidth: 200 }}>{k.notes ?? '—'}</td>
                                              <td style={{ fontSize: '0.75rem', color: '#9ab89a' }}>{fmtDate(k.evaluated_at)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Return Modal ── */}
      {returnTarget && (
        <div className="akc-overlay">
          <div className="akc-modal">
            <div className="akc-modal-header">
              <h3>Return Evaluation</h3>
              <button onClick={() => setReturnTarget(null)}><X size={16} /></button>
            </div>
            <div className="akc-modal-body">
              <p style={{ color: '#4a5568', fontSize: '0.88rem', marginTop: 0 }}>
                Returning evaluation for <strong>{returnTarget.staffName}</strong>.
                Provide correction notes so HR knows what to fix:
              </p>
              <textarea
                value={returnComment}
                onChange={e => setReturnComment(e.target.value)}
                rows={3}
                placeholder="Explain what needs to be corrected (optional)…"
                className="akc-return-textarea"
              />
            </div>
            <div className="akc-modal-footer">
              <button className="btn-secondary" onClick={() => setReturnTarget(null)}>Cancel</button>
              <button className="akc-btn-danger" onClick={handleReturn} disabled={reviewing}>
                {reviewing
                  ? <><Loader2 size={14} className="akc-spin" /> Returning…</>
                  : <><XCircle size={14} /> Return for Correction</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {deleteTarget && (
        <div className="sm-delete-overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="sm-delete-modal">
            <div className="sm-delete-modal-header">
              <div className="sm-delete-modal-icon"><Trash2 size={30} /></div>
              <h3 className="sm-delete-modal-title">Delete Cycle?</h3>
              <p className="sm-delete-modal-sub">This action is permanent and cannot be reversed</p>
            </div>
            <div className="sm-delete-modal-body">
              <p className="sm-delete-body-text">
                You are about to permanently delete{' '}
                <strong className="sm-delete-name">{deleteTarget.name}</strong>.
                All evaluations linked to this cycle will be lost.
              </p>
              <div className="sm-delete-warning-strip">
                <AlertCircle size={14} />
                This cannot be undone. Please confirm carefully.
              </div>
              <div className="sm-delete-actions">
                <button className="sm-cancel-btn" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                  <X size={13} /> Cancel
                </button>
                <button className="sm-confirm-delete-btn" onClick={confirmDelete} disabled={deleting}>
                  {deleting
                    ? <><Loader2 size={13} className="akc-spin" /> Deleting…</>
                    : <><Trash2 size={13} /> Yes, Delete</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
