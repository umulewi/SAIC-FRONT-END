import { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle, Trash2 } from 'lucide-react';
import { adminGetPayrollRegister, adminDeletePayrollEntry } from '../../api/role';
import type { PayrollEntry } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../shared/SharedPages.css';
import './AdminPayrollPage.css';

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

function fmtN(v: number) {
  return new Intl.NumberFormat('en-US').format(v);
}

export default function AdminPayrollPage() {
  const now = new Date();
  const [month,   setMonth]   = useState(now.getMonth() + 1);
  const [year,    setYear]    = useState(now.getFullYear());
  const [entries, setEntries] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ roleId: number; position: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      setEntries(await adminGetPayrollRegister(month, year));
    } catch {
      setError('Failed to load payroll data.');
    } finally { setLoading(false); }
  };

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminDeletePayrollEntry(deleteTarget.roleId);
      setDeleteTarget(null);
      await load();
    } catch {
      alert('Failed to delete payroll entry.');
    } finally { setDeleting(false); }
  }

  useEffect(() => { load(); }, [month, year]);

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
  }, { transport: 0, meals: 0, comm: 0, net: 0, paye: 0, pension: 0, cbh: 0, mat: 0, deduct: 0, gross: 0, totalCost: 0 });

  return (
    <div className="apy-root">
      <PageHeader
        title="Payroll Register"
        subtitle={`${MONTHS[month - 1]} ${year} — SAIC Integrated Payroll (View Only)`}
        actions={
          <button className="btn-secondary" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}><AlertCircle size={14} />{error}</div>}

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
            <div style={{ overflowX: 'auto' }}>
              <table className="saic-table apy-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Active</th>
                    <th>Position / Title</th>
                    <th>Department</th>
                    <th className="apy-num">Transport (Frw)</th>
                    <th className="apy-num">Meals (Frw)</th>
                    <th className="apy-num">Comm (Frw)</th>
                    <th className="apy-num apy-highlight">Net Salary (Frw)</th>
                    <th className="apy-num">PAYE</th>
                    <th className="apy-num">RSSB 3%</th>
                    <th className="apy-num">CBH 0.5%</th>
                    <th className="apy-num">Mat 0.3%</th>
                    <th className="apy-num apy-orange">Total Deduct</th>
                    <th className="apy-num">Gross (Frw)</th>
                    <th className="apy-num apy-bold">Total Cost</th>
                    <th>Payment</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 && (
                    <tr><td colSpan={17}>
                      <div className="empty-state">
                        <AlertCircle size={38} />
                        <p>No payroll data. HR must configure positions first.</p>
                      </div>
                    </td></tr>
                  )}
                  {Object.entries(grouped).map(([, rows]) =>
                    rows.map((e, ri) => {
                      const d = derived(e);
                      const rowNum = filtered.indexOf(e) + 1;
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
                            <button
                              className="apy-delete-btn"
                              title="Remove from payroll"
                              onClick={() => setDeleteTarget({ roleId: e.role_id, position: e.position })}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ];
                    })
                  )}
                </tbody>
                {entries.length > 0 && (
                  <tfoot>
                    <tr className="apy-total-row">
                      <td colSpan={4} style={{ fontWeight: 700, color: '#1e3a1e' }}>TOTAL</td>
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
      {deleteTarget && (
        <div className="leave-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="leave-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="leave-modal-header" style={{ background: '#b91c1c' }}>
              <h3>Remove Payroll Entry</h3>
              <button className="leave-modal-close" onClick={() => setDeleteTarget(null)}>&times;</button>
            </div>
            <div className="leave-modal-body">
              <p style={{ margin: '0.5rem 0', fontSize: '0.88rem', color: '#4a5568' }}>
                Are you sure you want to remove <strong>{deleteTarget.position}</strong> from the payroll register?
                This will also delete all payment records for this position.
              </p>
            </div>
            <div className="leave-modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Removing…' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
