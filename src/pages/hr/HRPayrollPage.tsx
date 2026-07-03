import { useEffect, useState, useCallback } from 'react';
import {
  RefreshCw, AlertCircle, Settings,
} from 'lucide-react';
import {
  hrGetPayrollRegister,
  hrGetPayrollConfig,
  hrSavePayrollConfig,
  hrGetRolesWithoutPayroll,
  hrMarkPayrollPayment,
} from '../../api/role';
import type { PayrollEntry, PayrollConfig } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../shared/SharedPages.css';
import '../admin/AdminPayrollPage.css';
import './HRPayrollPage.css';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function calcPaye(gross: number): number {
  if (gross <= 30000) return 0;
  if (gross <= 60000) return (gross - 30000) * 0.20;
  return 30000 * 0.20 + (gross - 60000) * 0.30;
}

function derived(e: PayrollEntry) {
  const basic     = Number(e.basic_salary)        || 0;
  const transport = Number(e.transport_allowance)  || 0;
  const meals     = Number(e.meals_allowance)      || 0;
  const comm      = Number(e.comm_allowance)       || 0;
  const net       = basic + transport + meals + comm;
  const paye      = Math.round(calcPaye(basic));
  const pension   = Math.round(basic * 0.03);
  const cbh       = Math.round(basic * 0.005);
  const mat       = Math.round(basic * 0.003);
  const deduct    = paye + pension + cbh + mat;
  const totalCost = Math.round(basic * 1.008);
  return { net, paye, pension, cbh, mat, deduct, gross: basic, totalCost };
}

function fmtN(v: number) { return new Intl.NumberFormat('en-US').format(v); }
function initials(first?: string, last?: string) {
  return `${(first?.[0] ?? '').toUpperCase()}${(last?.[0] ?? '').toUpperCase()}` || '?';
}

interface UnconfiguredRole { id: number; role_name: string; department_name: string }

interface CfgForm {
  basic_salary: string;
  transport_allowance: string;
  meals_allowance: string;
  comm_allowance: string;
}
const EMPTY_CFG: CfgForm = { basic_salary: '', transport_allowance: '', meals_allowance: '', comm_allowance: '' };

export default function HRPayrollPage() {
  const now = new Date();
  const [month,   setMonth]   = useState(now.getMonth() + 1);
  const [year,    setYear]    = useState(now.getFullYear());
  const [entries, setEntries] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const [configs,      setConfigs]      = useState<PayrollConfig[]>([]);
  const [unconfigured, setUnconfigured] = useState<UnconfiguredRole[]>([]);

  const [cfgTarget, setCfgTarget] = useState<{ roleId: number; roleName: string } | null>(null);
  const [cfgForm,   setCfgForm]   = useState<CfgForm>(EMPTY_CFG);
  const [cfgSaving, setCfgSaving] = useState(false);

  const [payTarget, setPayTarget] = useState<PayrollEntry | null>(null);
  const [payDate,   setPayDate]   = useState('');
  const [payNotes,  setPayNotes]  = useState('');
  const [paySaving, setPaySaving] = useState(false);

  const loadRegister = useCallback(async () => {
    setLoading(true); setError('');
    try { setEntries(await hrGetPayrollRegister(month, year)); }
    catch { setError('Failed to load payroll data.'); }
    finally { setLoading(false); }
  }, [month, year]);

  const loadSetupData = useCallback(async () => {
    const [unc, cfg] = await Promise.all([hrGetRolesWithoutPayroll(), hrGetPayrollConfig()]);
    setUnconfigured(unc);
    setConfigs(cfg);
  }, []);

  useEffect(() => { loadRegister(); }, [loadRegister]);
  useEffect(() => { loadSetupData(); }, [loadSetupData]);

  const departments = Array.from(new Set(entries.map(e => e.department).filter(Boolean)));
  const filtered    = deptFilter ? entries.filter(e => e.department === deptFilter) : entries;
  const grouped: Record<string, PayrollEntry[]> = {};
  for (const e of filtered) {
    const d = e.department || 'Other';
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(e);
  }

  const totals = entries.reduce((acc, e) => {
    const d = derived(e);
    acc.staff     += e.is_active ? 1 : 0;
    acc.transport += Number(e.transport_allowance) || 0;
    acc.meals     += Number(e.meals_allowance)     || 0;
    acc.comm      += Number(e.comm_allowance)      || 0;
    acc.net       += d.net;
    acc.paye      += d.paye;
    acc.pension   += d.pension;
    acc.cbh       += d.cbh;
    acc.mat       += d.mat;
    acc.deduct    += d.deduct;
    acc.gross     += d.gross;
    acc.totalCost += d.totalCost;
    return acc;
  }, { staff: 0, transport: 0, meals: 0, comm: 0, net: 0, paye: 0, pension: 0, cbh: 0, mat: 0, deduct: 0, gross: 0, totalCost: 0 });

  function openCfgModal(roleId: number, roleName: string) {
    const existing = configs.find(c => c.role_id === roleId);
    setCfgForm(existing
      ? { basic_salary: String(existing.basic_salary || ''), transport_allowance: String(existing.transport_allowance || ''), meals_allowance: String(existing.meals_allowance || ''), comm_allowance: String(existing.comm_allowance || '') }
      : EMPTY_CFG
    );
    setCfgTarget({ roleId, roleName });
  }

  async function saveCfg() {
    if (!cfgTarget) return;
    setCfgSaving(true);
    try {
      await hrSavePayrollConfig(cfgTarget.roleId, {
        basic_salary:        parseFloat(cfgForm.basic_salary)        || 0,
        transport_allowance: parseFloat(cfgForm.transport_allowance) || 0,
        meals_allowance:     parseFloat(cfgForm.meals_allowance)     || 0,
        comm_allowance:      parseFloat(cfgForm.comm_allowance)      || 0,
      });
      setCfgTarget(null);
      await Promise.all([loadRegister(), loadSetupData()]);
    } catch { alert('Failed to save salary configuration.'); }
    finally { setCfgSaving(false); }
  }

  function openPayModal(e: PayrollEntry) {
    setPayTarget(e);
    setPayDate(e.paid_date ?? new Date().toISOString().slice(0, 10));
    setPayNotes(e.payment_notes ?? '');
  }

  async function markPayment(isPaid: boolean) {
    if (!payTarget?.users_id) return;
    setPaySaving(true);
    try {
      await hrMarkPayrollPayment({ users_id: payTarget.users_id, month, year, is_paid: isPaid, paid_date: isPaid ? payDate : undefined, notes: payNotes || undefined });
      setPayTarget(null);
      await loadRegister();
    } catch { alert('Failed to update payment status.'); }
    finally { setPaySaving(false); }
  }

  const cfgPreviewNet  = (parseFloat(cfgForm.basic_salary) || 0) + (parseFloat(cfgForm.transport_allowance) || 0) + (parseFloat(cfgForm.meals_allowance) || 0) + (parseFloat(cfgForm.comm_allowance) || 0);
  const cfgPreviewPaye = Math.round(calcPaye(parseFloat(cfgForm.basic_salary) || 0));
  const cfgPreviewCost = Math.round((parseFloat(cfgForm.basic_salary) || 0) * 1.008);

  return (
    <div className="apy-root">
      <PageHeader
        title="Payroll Register"
        subtitle={`${MONTHS[month - 1]} ${year} — SAIC Integrated Management`}
        actions={
          <button className="btn-secondary" onClick={loadRegister}>
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}><AlertCircle size={14} />{error}</div>}

      {/* Unconfigured positions bar */}
      {unconfigured.length > 0 && (
        <div className="hrp-uncfg-bar">
          <span className="hrp-uncfg-label">
            <Settings size={13} /> {unconfigured.length} position{unconfigured.length > 1 ? 's' : ''} not yet in payroll — click to configure:
          </span>
          <div className="hrp-chips">
            {unconfigured.map(r => (
              <button key={r.id} className="hrp-chip" onClick={() => openCfgModal(r.id, r.role_name)}>
                + {r.role_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="apy-controls">
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="atm-select" value={month} onChange={e => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select className="atm-select" value={year} onChange={e => setYear(Number(e.target.value))}>
            {Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {departments.length > 1 && (
            <select className="atm-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
        </div>
        <div className="apy-legend">
          <span className="apy-badge apy-active">● Active</span>
          <span className="apy-badge apy-vacant">● Vacant</span>
          <span className="apy-badge apy-paid">● Paid</span>
          <span className="apy-badge apy-unpaid">● Unpaid</span>
        </div>
      </div>

      {loading ? <LoadingSpinner message="Loading payroll register…" /> : (
        <>
          <div className="table-card apy-table-card">
            {/* Document header */}
            

            <div style={{ overflowX: 'auto' }}>
              <table className="saic-table apy-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>ACTIVE</th>
                    <th>POSITION / TITLE</th>
                    <th>DEPARTMENT</th>
                    <th className="apy-num">TRANSPORT(Frw)</th>
                    <th className="apy-num">MEALS.(Frw)</th>
                    <th className="apy-num">COMM.(Frw)</th>
                    <th className="apy-num apy-highlight">NET SALARY (Frw)</th>
                    <th className="apy-num">PAYE (Frw)</th>
                    <th className="apy-num">RSSB PENSION(Frw)</th>
                    <th className="apy-num">RSSB CBH(Frw)</th>
                    <th className="apy-num">RSSB MAT(Frw)</th>
                    <th className="apy-num apy-orange">TOTAL DEDUCT. (Frw)</th>
                    <th className="apy-num">GROSS SALARY (Frw)</th>
                    <th className="apy-num apy-bold">TOTAL COST TO ORG (Frw)</th>
                    <th>PAYMENT</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 && (
                    <tr><td colSpan={17}>
                      <div className="empty-state">
                        <AlertCircle size={38} />
                        <p>No payroll data. Click <strong>Setup</strong> above to configure positions.</p>
                      </div>
                    </td></tr>
                  )}
                  {Object.entries(grouped).map(([, rows]) =>
                    rows.map((e, ri) => {
                      const d        = derived(e);
                      const rowNum   = filtered.indexOf(e) + 1;
                      const isActive = !!e.is_active;
                      const isPaid   = e.is_paid === 1;
                      return [
                        <tr key={`${e.role_id}-${ri}`} className={`apy-row ${isActive ? 'apy-row-active' : 'apy-row-vacant'}`}>
                          <td className="col-num">{rowNum}</td>
                          <td>
                            <span className={`apy-active-badge ${isActive ? 'true' : 'false'}`}>
                              {isActive ? 'TRUE' : 'FALSE'}
                            </span>
                          </td>
                          <td className="apy-position-cell">
                            <div>{e.position}</div>
                            {isActive && e.first_name && (
                              <div className="apy-staff-name">{e.first_name} {e.last_name}</div>
                            )}
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#6a8c6a' }}>{e.department}</td>
                          <td className="apy-num">{fmtN(Number(e.transport_allowance) || 0)}</td>
                          <td className="apy-num">{fmtN(Number(e.meals_allowance) || 0)}</td>
                          <td className="apy-num">{fmtN(Number(e.comm_allowance) || 0)}</td>
                          <td className="apy-num apy-highlight">{fmtN(d.net)}</td>
                          <td className="apy-num apy-paye">{fmtN(d.paye)}</td>
                          <td className="apy-num">{fmtN(d.pension)}</td>
                          <td className="apy-num">{fmtN(d.cbh)}</td>
                          <td className="apy-num">{fmtN(d.mat)}</td>
                          <td className="apy-num apy-orange">{fmtN(d.deduct)}</td>
                          <td className="apy-num apy-paye">{fmtN(d.gross)}</td>
                          <td className="apy-num apy-bold">{fmtN(d.totalCost)}</td>
                          <td>
                            {isActive
                              ? isPaid
                                ? <span className="apy-pay-badge paid">✓ Paid{e.paid_date ? ` · ${e.paid_date}` : ''}</span>
                                : <span className="apy-pay-badge unpaid">Unpaid</span>
                              : <span style={{ color: '#b0c8b0', fontSize: '0.76rem' }}>—</span>}
                          </td>
                          <td>
                            {isActive && (
                              <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
                                <button className="apy-edit-btn" title="Edit salary config"
                                  onClick={() => openCfgModal(e.role_id, e.position)}>
                                  <Settings size={13} />
                                </button>
                                <button
                                  className={`apy-pay-btn ${isPaid ? 'unpay' : 'pay'}`}
                                  title={isPaid ? 'Mark unpaid' : 'Mark paid'}
                                  onClick={() => openPayModal(e)}>
                                  {isPaid ? '✕' : '✓'}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ];
                    })
                  )}
                </tbody>
                {entries.length > 0 && (
                  <tfoot>
                    <tr className="apy-total-row">
                      <td colSpan={4} style={{ fontWeight: 700 }}>TOTAL</td>
                      <td className="apy-num">{fmtN(totals.transport)}</td>
                      <td className="apy-num">{fmtN(totals.meals)}</td>
                      <td className="apy-num">{fmtN(totals.comm)}</td>
                      <td className="apy-num apy-highlight">{fmtN(totals.net)}</td>
                      <td className="apy-num apy-paye">{fmtN(totals.paye)}</td>
                      <td className="apy-num">{fmtN(totals.pension)}</td>
                      <td className="apy-num">{fmtN(totals.cbh)}</td>
                      <td className="apy-num">{fmtN(totals.mat)}</td>
                      <td className="apy-num apy-orange">{fmtN(totals.deduct)}</td>
                      <td className="apy-num apy-paye">{fmtN(totals.gross)}</td>
                      <td className="apy-num apy-bold">{fmtN(totals.totalCost)}</td>
                      <td /><td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          <p className="apy-footnote">
            NET = Basic + Transport + Meals + Comm &nbsp;|&nbsp;
            GROSS = Basic (taxable) &nbsp;|&nbsp;
            TOTAL COST = Gross + CBH ER (0.5%) + Mat ER (0.3%) &nbsp;|&nbsp;
            PAYE: 0–30k: 0% · 30–60k: 20% · 60k+: 30%
          </p>
        </>
      )}

      {/* ── Salary Config Modal ─────────────────────────────── */}
      {cfgTarget && (
        <div className="leave-modal-overlay" onClick={() => setCfgTarget(null)}>
          <div className="leave-modal" onClick={ev => ev.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="leave-modal-header">
              <div>
                <div style={{ fontSize: '0.7rem', opacity: 0.75, fontWeight: 400, marginBottom: 2 }}>Salary Configuration</div>
                <h3 style={{ margin: 0 }}>{cfgTarget.roleName}</h3>
              </div>
              <button className="leave-modal-close" onClick={() => setCfgTarget(null)}>&times;</button>
            </div>
            <div className="leave-modal-body">
              <div className="hrp-cfg-grid">
                {([
                  ['basic_salary',        'Basic Salary',        true ],
                  ['transport_allowance', 'Transport Allowance', false],
                  ['meals_allowance',     'Meals Allowance',     false],
                  ['comm_allowance',      'Comm Allowance',      false],
                ] as [keyof CfgForm, string, boolean][]).map(([field, label, required]) => (
                  <div key={field} className="hrp-cfg-field">
                    <label className="hrp-cfg-label">
                      {label}{required && <span className="hrp-cfg-req"> *</span>}
                    </label>
                    <div className="hrp-input-group">
                      <span className="hrp-input-prefix">FRW</span>
                      <input
                        type="number" min="0"
                        className="hrp-cfg-input"
                        placeholder="0"
                        value={cfgForm[field]}
                        onChange={e => setCfgForm(f => ({ ...f, [field]: e.target.value }))}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Preview strip — always visible */}
              <div className="hrp-cfg-preview-strip">
                <div className="hrp-cfg-prev-item">
                  <div className="hrp-cfg-prev-lbl">Net Salary</div>
                  <div className="hrp-cfg-prev-val">{fmtN(cfgPreviewNet)}</div>
                  <div className="hrp-cfg-prev-unit">Frw</div>
                </div>
                <div className="hrp-cfg-prev-divider" />
                <div className="hrp-cfg-prev-item">
                  <div className="hrp-cfg-prev-lbl">PAYE Tax</div>
                  <div className="hrp-cfg-prev-val">{fmtN(cfgPreviewPaye)}</div>
                  <div className="hrp-cfg-prev-unit">Frw</div>
                </div>
                <div className="hrp-cfg-prev-divider" />
                <div className="hrp-cfg-prev-item">
                  <div className="hrp-cfg-prev-lbl">Total Cost to Org</div>
                  <div className="hrp-cfg-prev-val hrp-cfg-prev-highlight">{fmtN(cfgPreviewCost)}</div>
                  <div className="hrp-cfg-prev-unit">Frw</div>
                </div>
              </div>
            </div>
            <div className="leave-modal-footer">
              <button className="btn-secondary" onClick={() => setCfgTarget(null)}>Cancel</button>
              <button className="btn-primary" onClick={saveCfg} disabled={cfgSaving || !cfgForm.basic_salary}>
                {cfgSaving ? 'Saving…' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Modal ────────────────────────────────────── */}
      {payTarget && (
        <div className="leave-modal-overlay" onClick={() => setPayTarget(null)}>
          <div className="leave-modal" onClick={ev => ev.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="leave-modal-header">
              <div>
                <div style={{ fontSize: '0.7rem', opacity: 0.75, fontWeight: 400, marginBottom: 2 }}>
                  {MONTHS[month - 1]} {year} — Payroll
                </div>
                <h3 style={{ margin: 0 }}>{payTarget.is_paid === 1 ? 'Update Payment' : 'Mark as Paid'}</h3>
              </div>
              <button className="leave-modal-close" onClick={() => setPayTarget(null)}>&times;</button>
            </div>
            <div className="leave-modal-body">

              {/* Employee card */}
              <div className="hrp-pay-card">
                <div className="hrp-pay-card-avatar">
                  {initials(payTarget.first_name ?? undefined, payTarget.last_name ?? undefined)}
                </div>
                <div className="hrp-pay-card-info">
                  <div className="hrp-pay-card-name">{payTarget.first_name} {payTarget.last_name}</div>
                  <div className="hrp-pay-card-role">{payTarget.position}</div>
                </div>
                <div className="hrp-pay-card-amount">
                  <div className="hrp-pay-card-lbl">Net Salary</div>
                  <div className="hrp-pay-card-val">{fmtN(derived(payTarget).net)}</div>
                  <div className="hrp-pay-card-unit">Frw</div>
                </div>
              </div>

              {/* Date field */}
              <div className="hrp-cfg-field">
                <label className="hrp-cfg-label">Payment Date</label>
                <div className="hrp-input-group">
                  <span className="hrp-input-prefix">DATE</span>
                  <input
                    type="date"
                    className="hrp-cfg-input"
                    value={payDate}
                    onChange={e => setPayDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Notes field */}
              <div className="hrp-cfg-field" style={{ marginTop: '0.85rem' }}>
                <label className="hrp-cfg-label">
                  Notes <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: '0.72rem' }}>(optional)</span>
                </label>
                <div className="hrp-input-group">
                  <span className="hrp-input-prefix">NOTE</span>
                  <input
                    type="text"
                    className="hrp-cfg-input"
                    value={payNotes}
                    onChange={e => setPayNotes(e.target.value)}
                    placeholder="e.g. Bank transfer ref #123"
                  />
                </div>
              </div>

            </div>
            <div className="leave-modal-footer">
              {payTarget.is_paid === 1 && (
                <button className="btn-danger" onClick={() => markPayment(false)} disabled={paySaving}>
                  {paySaving ? '…' : 'Mark Unpaid'}
                </button>
              )}
              <button className="btn-secondary" onClick={() => setPayTarget(null)}>Cancel</button>
              <button className="btn-primary" onClick={() => markPayment(true)} disabled={paySaving}>
                {paySaving ? 'Saving…' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
