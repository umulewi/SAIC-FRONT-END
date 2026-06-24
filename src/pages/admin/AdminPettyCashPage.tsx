import { useEffect, useState } from 'react';
import {
  RefreshCw, Search, X, DollarSign,
  AlertCircle, Users, TrendingUp, FileDown,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { adminGetPettyCash } from '../../api/role';
import type { PettyCash } from '../../types';
import { exportPettyCashPdf, getPresetDates, formatPeriodLabel } from '../../utils/exportPettyCashPdf';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../shared/SharedPages.css';
import './AdminPettyCashPage.css';

type Preset = 'all' | 'today' | 'week' | 'month' | 'last_month' | 'custom';

const PRESETS: { value: Preset; label: string }[] = [
  { value: 'all',        label: 'All Time'    },
  { value: 'today',      label: 'Today'       },
  { value: 'week',       label: 'This Week'   },
  { value: 'month',      label: 'This Month'  },
  { value: 'last_month', label: 'Last Month'  },
  { value: 'custom',     label: 'Custom…'     },
];

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtCash(v: number) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}
function initials(first?: string, last?: string, email?: string) {
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  return (email?.[0] ?? '?').toUpperCase();
}

export default function AdminPettyCashPage() {
  const [records,    setRecords]    = useState<PettyCash[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [apcPage,    setApcPage]    = useState(1);
  const APC_PAGE_SIZE = 10;

  const [search,    setSearch]    = useState('');
  const [preset,    setPreset]    = useState<Preset>('all');
  const [fromDate,  setFromDate]  = useState('');
  const [toDate,    setToDate]    = useState('');
  const [exporting, setExporting] = useState(false);

  const load = async (filters?: { search?: string; from_date?: string; to_date?: string }) => {
    setLoading(true); setError('');
    try {
      const { records: r, total } = await adminGetPettyCash(filters);
      setRecords(r); setGrandTotal(total); setApcPage(1);
    } catch {
      setError('Failed to load petty cash records.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const applyPreset = (p: Preset) => {
    setPreset(p);
    if (p === 'all') {
      setFromDate(''); setToDate('');
      load({ search });
    } else if (p !== 'custom') {
      const { from, to } = getPresetDates(p as 'today' | 'week' | 'month' | 'last_month');
      setFromDate(from); setToDate(to);
      load({ search, from_date: from, to_date: to });
    }
    // 'custom' — just show date pickers, don't reload yet
  };

  const handleSearch = () => load({ search, from_date: fromDate, to_date: toDate });

  const clearAll = () => {
    setSearch(''); setFromDate(''); setToDate(''); setPreset('all');
    load({});
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      exportPettyCashPdf(records, {
        title: 'Petty Cash Report',
        subtitle: 'All Accountants',
        period: formatPeriodLabel(fromDate, toDate),
        showAccountant: true,
      });
    } finally { setExporting(false); }
  };

  const byAccountant = records.reduce<Record<string, { name: string; total: number; count: number }>>((acc, r) => {
    const key  = String(r.users_id);
    const name = r.first_name && r.last_name ? `${r.first_name} ${r.last_name}` : (r.email ?? 'Unknown');
    if (!acc[key]) acc[key] = { name, total: 0, count: 0 };
    acc[key].total += Number(r.cash); acc[key].count += 1;
    return acc;
  }, {});

  const hasFilter = !!(search || fromDate || toDate);
  const apcTotalPages = Math.ceil(records.length / APC_PAGE_SIZE);
  const apcPaged = records.slice((apcPage - 1) * APC_PAGE_SIZE, apcPage * APC_PAGE_SIZE);

  return (
    <div className="apc-root">
      <PageHeader
        title="Petty Cash — All Records"
        subtitle="View all petty cash entries submitted by accountants"
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={() => load({ search, from_date: fromDate, to_date: toDate })}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button className="apc-export-btn" onClick={handleExport} disabled={exporting || records.length === 0}>
              <FileDown size={14} /> {exporting ? 'Exporting…' : 'Export PDF'}
            </button>
          </div>
        }
      />

      {error && <div className="alert alert-error"><AlertCircle size={14} />{error}</div>}

      {/* Stats */}
      <div className="apc-stats-row">
        <div className="apc-stat-card apc-stat-total">
          <DollarSign size={22} />
          <div>
            <p className="apc-stat-val">RWF {fmtCash(grandTotal)}</p>
            <p className="apc-stat-lbl">Grand Total</p>
          </div>
        </div>
        <div className="apc-stat-card apc-stat-entries">
          <TrendingUp size={22} />
          <div>
            <p className="apc-stat-val">{records.length}</p>
            <p className="apc-stat-lbl">Total Entries</p>
          </div>
        </div>
        <div className="apc-stat-card apc-stat-staff">
          <Users size={22} />
          <div>
            <p className="apc-stat-val">{Object.keys(byAccountant).length}</p>
            <p className="apc-stat-lbl">Accountants</p>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      {Object.values(byAccountant).length > 0 && (
        <div className="apc-breakdown">
          {Object.values(byAccountant).map(a => (
            <div key={a.name} className="apc-breakdown-chip">
              <span className="apc-breakdown-name">{a.name}</span>
              <span className="apc-breakdown-amt">RWF {fmtCash(a.total)}</span>
              <span className="apc-breakdown-count">{a.count} entries</span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="apc-filters-wrap">
        {/* Period presets */}
        <div className="apc-preset-row">
          {PRESETS.map(p => (
            <button key={p.value} className={`apc-preset-btn${preset === p.value ? ' active' : ''}`}
              onClick={() => applyPreset(p.value)}>{p.label}</button>
          ))}
        </div>

        <div className="apc-filters">
          <div className="atm-search-box" style={{ flex: 1, minWidth: 200, maxWidth: 340 }}>
            <Search size={15} className="atm-search-icon" />
            <input className="atm-search-input" placeholder="Search by name, email, or item…"
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            {search && <button className="atm-search-clear" onClick={() => { setSearch(''); load({ from_date: fromDate, to_date: toDate }); }}><X size={13} /></button>}
          </div>

          {/* Date pickers — always visible, highlighted when custom */}
          <div className="apc-date-group">
            <span className="apc-date-label">From</span>
            <input type="date" className="atm-select" value={fromDate}
              max={toDate || undefined}
              onChange={e => { setFromDate(e.target.value); setPreset('custom'); }} />
            <span className="apc-date-label">To</span>
            <input type="date" className="atm-select" value={toDate}
              min={fromDate || undefined}
              onChange={e => { setToDate(e.target.value); setPreset('custom'); }} />
            <button className="btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }} onClick={handleSearch}>
              <Search size={13} /> Apply
            </button>
            {hasFilter && (
              <button className="btn-secondary" onClick={clearAll}><X size={13} /> Clear</button>
            )}
          </div>
        </div>

        {/* Active period label */}
        {(fromDate || toDate) && (
          <p className="apc-period-label">
            Showing: <strong>{formatPeriodLabel(fromDate, toDate)}</strong>
          </p>
        )}
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner message="Loading petty cash…" /> : (
        <>
        <div className="table-card">
          <table className="saic-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Accountant</th>
                <th>Item / Description</th>
                <th>Amount (RWF)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && (
                <tr><td colSpan={5}>
                  <div className="empty-state"><DollarSign size={38} /><p>No petty cash records found.</p></div>
                </td></tr>
              )}
              {apcPaged.map((r, i) => {
                const fullName = r.first_name && r.last_name ? `${r.first_name} ${r.last_name}` : undefined;
                return (
                  <tr key={r.id}>
                    <td className="col-num">{(apcPage - 1) * APC_PAGE_SIZE + i + 1}</td>
                    <td>
                      <div className="apc-staff-cell">
                        <div className="apc-avatar">
                          {r.profile_photo
                            ? <img src={`/uploads/${r.profile_photo}`} alt="" className="apc-avatar-img" />
                            : initials(r.first_name, r.last_name, r.email)
                          }
                        </div>
                        <div>
                          <p className="apc-staff-name">{fullName ?? r.email}</p>
                          {fullName && <p className="apc-staff-email">{r.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#1e3a1e', fontSize: '0.85rem', fontWeight: 500 }}>{r.item}</td>
                    <td style={{ fontWeight: 700, color: '#2D5016', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                      RWF {fmtCash(Number(r.cash))}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#6a8c6a', whiteSpace: 'nowrap' }}>{fmtDate(r.date)}</td>
                  </tr>
                );
              })}
              {records.length > 0 && (
                <tr className="apc-total-row">
                  <td colSpan={3} style={{ fontWeight: 700, color: '#1e3a1e' }}>Grand Total</td>
                  <td style={{ fontWeight: 800, color: '#1e3a1e', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                    RWF {fmtCash(grandTotal)}
                  </td>
                  <td />
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {apcTotalPages > 1 && (
          <div className="atm-pagination">
            <button className="atm-pg-btn" disabled={apcPage <= 1} onClick={() => setApcPage(p => p - 1)}>
              <ChevronLeft size={15} />
            </button>
            <span className="atm-pg-info">Page {apcPage} of {apcTotalPages} ({records.length} records)</span>
            <button className="atm-pg-btn" disabled={apcPage >= apcTotalPages} onClick={() => setApcPage(p => p + 1)}>
              <ChevronRight size={15} />
            </button>
          </div>
        )}
        </>
      )}
    </div>
  );
}
