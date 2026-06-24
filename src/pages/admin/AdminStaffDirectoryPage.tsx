import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Users, Search, Filter, Printer, X, ChevronDown, ChevronUp,
  TrendingUp, Star, AlertCircle, RefreshCw, Eye,
  Phone, Mail, MapPin, Briefcase, CreditCard, Calendar, FileText,
  ExternalLink, User, CheckSquare,
} from 'lucide-react';
import { adminGetStaffDirectory, adminGetStaffPerformance } from '../../api/role';
import { hrGetStaff } from '../../api/hr';
import type { DirectoryStaff, StaffPerformanceDetail } from '../../types';
import type { HRStaff } from '../../api/hr';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../shared/SharedPages.css';
import './StaffManagementPage.css';
import './AdminStaffDirectoryPage.css';

interface Props {
  role?: 'admin' | 'hr';
}

const RATING_COLOR: Record<string, string> = {
  well_done: '#16a34a',
  medium:    '#d97706',
  high:      '#2563eb',
  excellent: '#7c3aed',
};

/** KPI score (0-50) + Task score (0-50) = 0-100 */
function calcPerf(s: {
  total_points: number; eval_count: number;
  task_total: number;   task_completed: number;
}) {
  const kpi  = s.eval_count > 0 ? (s.total_points / (s.eval_count * 100)) * 50 : 0;
  const task = s.task_total > 0 ? (s.task_completed / s.task_total) * 50        : 50;
  return Math.round(kpi + task);
}

function perfColor(pct: number) {
  if (pct >= 80) return '#16a34a';
  if (pct >= 60) return '#d97706';
  if (pct >= 40) return '#2563eb';
  return '#dc2626';
}

function perfLabel(pct: number) {
  if (pct >= 80) return 'Excellent';
  if (pct >= 60) return 'Good';
  if (pct >= 40) return 'Fair';
  if (pct >  0)  return 'Poor';
  return 'N/A';
}

function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function initials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?';
}

function PerfBadge({ pct, evalCount, taskTotal }: { pct: number; evalCount: number; taskTotal: number }) {
  if (evalCount === 0 && taskTotal === 0) return <span className="asd-perf-na">N/A</span>;
  const color = perfColor(pct);
  return (
    <div className="asd-perf-cell">
      <div className="asd-perf-bar-track">
        <div className="asd-perf-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="asd-perf-pct" style={{ color }}>{pct}%</span>
      <span className="asd-perf-label" style={{ color }}>{perfLabel(pct)}</span>
    </div>
  );
}

function ContractBadge({ status }: { status?: string | null }) {
  return <span className={`asd-status asd-status-${status ?? 'none'}`}>{status ?? '—'}</span>;
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value?: string | null }) {
  return (
    <div className="asd-detail-row">
      <span className="asd-detail-icon">{icon}</span>
      <span className="asd-detail-label">{label}</span>
      <span className="asd-detail-value">{value || '—'}</span>
    </div>
  );
}

/* ─── Staff Detail Modal ─────────────────────────────────────────────────── */
interface ModalProps {
  staff: DirectoryStaff;
  isAdmin: boolean;
  dateFrom?: string;
  dateTo?: string;
  onClose: () => void;
}

export function StaffDetailModal({ staff, isAdmin, dateFrom, dateTo, onClose }: ModalProps) {
  const [perf,        setPerf]        = useState<StaffPerformanceDetail | null>(null);
  const [perfLoading, setPerfLoading] = useState(isAdmin);
  const [perfError,   setPerfError]   = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    const params = { date_from: dateFrom || undefined, date_to: dateTo || undefined };
    adminGetStaffPerformance(staff.staff_id, params)
      .then(setPerf)
      .catch(() => setPerfError('Failed to load performance data.'))
      .finally(() => setPerfLoading(false));
  }, [staff.staff_id, isAdmin, dateFrom, dateTo]);

  const s = perf?.summary;
  const pct   = s ? s.performance_pct : calcPerf(staff);
  const color = perfColor(pct);

  return (
    <div className="asd-modal-backdrop" onClick={onClose}>
      <div className="asd-detail-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="asd-detail-header">
          <div className="asd-detail-hero">
            <div className="asd-detail-avatar">
              {staff.profile_photo
                ? <img src={`/uploads/${staff.profile_photo}`} alt="" className="asd-avatar-img" />
                : <span>{initials(staff.first_name, staff.last_name)}</span>
              }
            </div>
            <div>
              <h3 className="asd-detail-name">{staff.first_name} {staff.last_name}</h3>
              <p className="asd-detail-role">{staff.role_name ?? '—'}</p>
              {staff.department_name && <p className="asd-detail-dept">{staff.department_name}</p>}
            </div>
          </div>
          <button className="asd-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="asd-detail-body">
          <div className="asd-detail-columns">

            {/* Left column */}
            <div className="asd-detail-col">
              <p className="asd-detail-section-title"><User size={13} /> Personal Information</p>
              <div className="asd-detail-card">
                <InfoRow icon={<Mail size={13} />}  label="Email"  value={staff.email} />
                <InfoRow icon={<Phone size={13} />} label="Phone"  value={staff.telephone} />
                <InfoRow icon={<User size={13} />}  label="Gender" value={staff.gender} />
                <InfoRow icon={<span style={{ width: 13 }} />} label="Active" value={staff.is_active ? 'Yes' : 'No'} />
              </div>

              <p className="asd-detail-section-title" style={{ marginTop: '1rem' }}><MapPin size={13} /> Location</p>
              <div className="asd-detail-card">
                <InfoRow icon={<MapPin size={13} />}              label="Province" value={staff.province} />
                <InfoRow icon={<span style={{ width: 13 }} />}   label="District" value={staff.district} />
                <InfoRow icon={<span style={{ width: 13 }} />}   label="Sector"   value={staff.sector} />
                <InfoRow icon={<span style={{ width: 13 }} />}   label="Cell"     value={staff.cell} />
                <InfoRow icon={<span style={{ width: 13 }} />}   label="Village"  value={staff.village} />
              </div>
            </div>

            {/* Right column */}
            <div className="asd-detail-col">
              <p className="asd-detail-section-title"><Briefcase size={13} /> Contract</p>
              <div className="asd-detail-card">
                <div className="asd-detail-row">
                  <span className="asd-detail-icon"><FileText size={13} /></span>
                  <span className="asd-detail-label">Status</span>
                  <span className="asd-detail-value"><ContractBadge status={staff.contract_status} /></span>
                </div>
                <InfoRow icon={<Calendar size={13} />}           label="Start Date" value={fmtDate(staff.contract_start)} />
                <InfoRow icon={<span style={{ width: 13 }} />}  label="End Date"   value={fmtDate(staff.contract_end)} />
                {staff.contract_file && (
                  <div className="asd-detail-row">
                    <span className="asd-detail-icon"><FileText size={13} /></span>
                    <span className="asd-detail-label">File</span>
                    <a href={`/uploads/${staff.contract_file}`} target="_blank" rel="noreferrer"
                      className="asd-contract-link" onClick={e => e.stopPropagation()}>
                      {staff.contract_original ?? 'View Contract'} <ExternalLink size={11} />
                    </a>
                  </div>
                )}
              </div>

              {isAdmin && (
                <>
                  <p className="asd-detail-section-title" style={{ marginTop: '1rem' }}><CreditCard size={13} /> Banking</p>
                  <div className="asd-detail-card">
                    <InfoRow icon={<CreditCard size={13} />}         label="Bank"    value={staff.bank_name} />
                    <InfoRow icon={<span style={{ width: 13 }} />}  label="Account" value={staff.bank_account_no} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Performance section (admin only) */}
          {isAdmin && (
            <div className="asd-detail-perf-section">
              <p className="asd-detail-section-title"><TrendingUp size={13} /> Performance
                {(dateFrom || dateTo) && (
                  <span className="asd-perf-date-note">
                    {dateFrom && dateTo ? `${fmtDate(dateFrom)} – ${fmtDate(dateTo)}`
                      : dateFrom ? `From ${fmtDate(dateFrom)}`
                      : `Until ${fmtDate(dateTo)}`}
                  </span>
                )}
              </p>

              {perfLoading && <LoadingSpinner message="Loading performance…" />}
              {perfError   && <div className="alert alert-error"><AlertCircle size={13} />{perfError}</div>}

              {s && (
                <>
                  {/* Score breakdown */}
                  <div className="asd-perf-summary">
                    <div className="asd-gauge-wrap">
                      <svg viewBox="0 0 120 70" className="asd-gauge-svg">
                        <path d="M10,65 A55,55 0 0,1 110,65" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
                        <path d="M10,65 A55,55 0 0,1 110,65" fill="none"
                          stroke={color} strokeWidth="12" strokeLinecap="round"
                          strokeDasharray={`${(pct / 100) * 172.8} 172.8`} />
                      </svg>
                      <div className="asd-gauge-label">
                        <span className="asd-gauge-pct" style={{ color }}>{pct}%</span>
                        <span className="asd-gauge-text">{perfLabel(pct)}</span>
                      </div>
                    </div>

                    <div className="asd-score-breakdown">
                      <div className="asd-score-row">
                        <span className="asd-score-label"><Star size={12} /> KPI Score</span>
                        <div className="asd-score-bar-wrap">
                          <div className="asd-score-bar" style={{ width: `${(s.kpi_score / 50) * 100}%`, background: '#7c3aed' }} />
                        </div>
                        <span className="asd-score-val">{s.kpi_score}<span className="asd-score-max">/50</span></span>
                      </div>
                      <div className="asd-score-row">
                        <span className="asd-score-label"><CheckSquare size={12} /> Task Score</span>
                        <div className="asd-score-bar-wrap">
                          <div className="asd-score-bar" style={{ width: `${(s.task_score / 50) * 100}%`, background: '#2563eb' }} />
                        </div>
                        <span className="asd-score-val">{s.task_score}<span className="asd-score-max">/50</span></span>
                      </div>
                      <div className="asd-score-stats">
                        <span><Star size={11} /> {s.eval_count} eval{s.eval_count !== 1 ? 's' : ''} · {s.total_points} pts</span>
                        <span><CheckSquare size={11} /> {s.task_completed}/{s.task_total} tasks done</span>
                      </div>
                    </div>
                  </div>

                  {/* KPIs & Evaluations */}
                  <div className="asd-detail-perf-cols">
                    <div className="asd-modal-section">
                      <p className="asd-modal-section-title">Assigned KPIs ({perf!.kpis.length})</p>
                      {perf!.kpis.length === 0
                        ? <p className="asd-empty-text">No KPIs assigned.</p>
                        : perf!.kpis.map(k => (
                          <div key={k.staff_kpi_id} className="asd-kpi-item">
                            <span className="asd-kpi-title">{k.title}</span>
                            {k.due_date && <span className="asd-kpi-due">Due {fmtDate(k.due_date)}</span>}
                          </div>
                        ))
                      }
                    </div>

                    <div className="asd-modal-section">
                      <p className="asd-modal-section-title">Evaluation History ({perf!.evaluations.length})</p>
                      {perf!.evaluations.length === 0
                        ? <p className="asd-empty-text">No evaluations recorded.</p>
                        : perf!.evaluations.map(ev => (
                          <div key={ev.id} className="asd-eval-item">
                            <span className="asd-eval-rating"
                              style={{ background: RATING_COLOR[ev.rating] + '20', color: RATING_COLOR[ev.rating] }}>
                              {ev.rating.replace('_', ' ')}
                            </span>
                            <span className="asd-eval-pts">{ev.points} pts</span>
                            {ev.kpi_title && <span className="asd-eval-kpi">{ev.kpi_title}</span>}
                            {ev.notes     && <span className="asd-eval-notes">{ev.notes}</span>}
                            <span className="asd-eval-date">{fmtDate(ev.evaluated_at)}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </>
              )}

              {!s && !perfLoading && !perfError && (
                <p className="asd-empty-text">No performance data available.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function AdminStaffDirectoryPage({ role = 'admin' }: Props) {
  const isAdmin = role === 'admin';

  const [staff,        setStaff]        = useState<DirectoryStaff[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const [filterDept,   setFilterDept]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom,     setDateFrom]     = useState<string>(() => {
    if (role !== 'admin') return '';
    const d = new Date(); d.setDate(d.getDate() - 14);
    return d.toISOString().split('T')[0];
  });
  const [dateTo,       setDateTo]       = useState<string>(() =>
    role === 'admin' ? new Date().toISOString().split('T')[0] : ''
  );
  const [sortField,    setSortField]    = useState<'name' | 'dept' | 'perf'>('name');
  const [sortAsc,      setSortAsc]      = useState(true);
  const [detailTarget, setDetailTarget] = useState<DirectoryStaff | null>(null);

  const load = (df = dateFrom, dt = dateTo) => {
    setLoading(true); setError('');
    const fn: () => Promise<DirectoryStaff[]> = isAdmin
      ? () => adminGetStaffDirectory({ date_from: df || undefined, date_to: dt || undefined })
      : () => hrGetStaff().then((s: HRStaff[]) => s.map(h => ({
          ...h,
          bank_name: null, bank_account_no: null,
          contract_file: null, contract_original: null,
        } as DirectoryStaff)));
    fn()
      .then(setStaff)
      .catch(() => setError('Failed to load staff directory.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [role]);

  const applyDateFilter = () => load(dateFrom, dateTo);

  const clearDateFilter = () => {
    setDateFrom(''); setDateTo('');
    load('', '');
  };

  const departments = useMemo(() => {
    const set = new Set(staff.map(s => s.department_name).filter(Boolean));
    return Array.from(set).sort() as string[];
  }, [staff]);

  const filtered = useMemo(() => {
    let list = staff.filter(s => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.telephone ?? '').includes(q);
      const matchDept   = !filterDept   || s.department_name === filterDept;
      const matchStatus = !filterStatus || s.contract_status === filterStatus;
      return matchSearch && matchDept && matchStatus;
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      else if (sortField === 'dept') cmp = (a.department_name ?? '').localeCompare(b.department_name ?? '');
      else if (sortField === 'perf') cmp = calcPerf(a) - calcPerf(b);
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [staff, search, filterDept, filterStatus, sortField, sortAsc]);

  const toggleSort = (field: 'name' | 'dept' | 'perf') => {
    if (sortField === field) setSortAsc(v => !v);
    else { setSortField(field); setSortAsc(false); }
  };

  const SortIcon = ({ field }: { field: 'name' | 'dept' | 'perf' }) =>
    sortField === field
      ? (sortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />)
      : <ChevronDown size={13} style={{ opacity: 0.3 }} />;

  if (loading) return <LoadingSpinner message="Loading staff directory…" />;

  const dateRangeActive = !!(dateFrom || dateTo);

  return (
    <div className="asd-root">
      <PageHeader
        title="Staff Directory"
        subtitle={`${filtered.length} of ${staff.length} staff members${dateRangeActive ? ' · filtered by date' : ''}`}
        actions={
          <button className="asd-print-btn" onClick={() => window.print()}>
            <Printer size={15} /> Print / Save PDF
          </button>
        }
      />

      {error && <div className="alert alert-error"><AlertCircle size={14} />{error}</div>}

      {/* ── Filters ── */}
      <div className="asd-filters no-print">
        <div className="asd-search-wrap">
          <Search size={15} className="asd-search-icon" />
          <input className="asd-search" placeholder="Search by name, email or phone…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="asd-clear-btn" onClick={() => setSearch('')}><X size={13} /></button>}
        </div>
        <div className="asd-filter-group">
          <Filter size={13} />
          <select className="asd-select" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="asd-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Contracts</option>
            <option value="active">Active</option>
            <option value="probation">Probation</option>
            <option value="expired">Expired</option>
            <option value="terminated">Terminated</option>
          </select>
          <button className="asd-refresh-btn" onClick={() => load()}><RefreshCw size={14} /></button>
        </div>
      </div>

      {/* ── Date range filter (admin only — affects performance score) ── */}
      {isAdmin && (
        <div className="asd-date-filter no-print">
          <div className="asd-date-filter-label">
            <TrendingUp size={13} />
            <span>Performance period filter</span>
          </div>
          <div className="asd-date-inputs">
            <div className="asd-date-field">
              <label>From</label>
              <input type="date" className="asd-date-input" value={dateFrom}
                onChange={e => setDateFrom(e.target.value)} max={dateTo || undefined} />
            </div>
            <div className="asd-date-field">
              <label>To</label>
              <input type="date" className="asd-date-input" value={dateTo}
                onChange={e => setDateTo(e.target.value)} min={dateFrom || undefined} />
            </div>
            <button className="asd-date-apply-btn" onClick={applyDateFilter}>
              Apply
            </button>
            {dateRangeActive && (
              <button className="asd-date-clear-btn" onClick={clearDateFilter}>
                <X size={12} /> Clear
              </button>
            )}
          </div>
          {dateRangeActive && (
            <span className="asd-date-active-note">
              Showing performance data for selected period only
            </span>
          )}
        </div>
      )}

      {/* ── Print-only header ── */}
      <div className="print-only asd-print-header">
        <h2 className="asd-print-title">SAIC — Staff Directory</h2>
        <p className="asd-print-date">Generated {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* ── Table ── */}
      <div className="table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="saic-table asd-table">
            <thead>
              <tr>
                <th className="col-num">#</th>
                <th className="asd-th-sort" onClick={() => toggleSort('name')}>
                  Staff Member <SortIcon field="name" />
                </th>
                <th className="asd-th-sort" onClick={() => toggleSort('dept')}>
                  Department <SortIcon field="dept" />
                </th>
                <th>Role</th>
                <th className="no-print">Contract</th>
                {isAdmin && (
                  <th className="asd-th-sort" onClick={() => toggleSort('perf')}>
                    Performance <SortIcon field="perf" />
                    <span className="asd-th-sub">KPI 50% + Task 50%</span>
                  </th>
                )}
                <th className="no-print" style={{ width: 120 }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '2.5rem', color: '#9ab09a' }}>
                    <Users size={34} style={{ display: 'block', margin: '0 auto 0.5rem' }} />
                    No staff members found.
                  </td>
                </tr>
              ) : filtered.map((s, i) => {
                const pct = calcPerf(s);
                return (
                  <tr key={s.staff_id}>
                    <td className="col-num">{i + 1}</td>
                    <td>
                      <div className="asd-name-cell">
                        <div className="asd-avatar">
                          {s.profile_photo
                            ? <img src={`/uploads/${s.profile_photo}`} alt="" className="asd-avatar-img" />
                            : <span>{initials(s.first_name, s.last_name)}</span>
                          }
                        </div>
                        <div>
                          <span className="asd-full-name">{s.first_name} {s.last_name}</span>
                          <span className="asd-sub-email no-print">{s.email}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{s.department_name ?? '—'}</td>
                    <td style={{ fontSize: '0.78rem', color: '#5a7a5a' }}>{s.role_name ?? '—'}</td>
                    <td className="no-print"><ContractBadge status={s.contract_status} /></td>
                    {isAdmin && (
                      <td>
                        <PerfBadge pct={pct} evalCount={s.eval_count} taskTotal={s.task_total} />
                      </td>
                    )}
                    <td className="no-print">
                      <button className="asd-view-btn" onClick={() => setDetailTarget(s)}>
                        <Eye size={13} /> View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Staff detail modal ── */}
      {detailTarget && (
        <StaffDetailModal
          staff={detailTarget}
          isAdmin={isAdmin}
          dateFrom={dateFrom || undefined}
          dateTo={dateTo || undefined}
          onClose={() => setDetailTarget(null)}
        />
      )}
    </div>
  );
}
