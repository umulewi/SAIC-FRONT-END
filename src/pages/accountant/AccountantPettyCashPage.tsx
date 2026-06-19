import { useEffect, useState } from 'react';
import {
  Plus, Pencil, Trash2, X, CheckCircle, AlertCircle,
  RefreshCw, Loader2, DollarSign, Search, FileDown,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { getPettyCash, createPettyCash, updatePettyCash, deletePettyCash } from '../../api/role';
import type { PettyCash } from '../../types';
import {
  exportPettyCashPdf, getPresetDates, formatPeriodLabel,
} from '../../utils/exportPettyCashPdf';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../shared/SharedPages.css';
import './AccountantPettyCashPage.css';

interface Props { apiBase: string; }

type Preset = 'all' | 'today' | 'week' | 'month' | 'last_month' | 'custom';

const PRESETS: { value: Preset; label: string }[] = [
  { value: 'all',        label: 'All Time'   },
  { value: 'today',      label: 'Today'      },
  { value: 'week',       label: 'This Week'  },
  { value: 'month',      label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'custom',     label: 'Custom…'    },
];

const TODAY = new Date().toISOString().split('T')[0];

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtCash(v: number) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}

export default function AccountantPettyCashPage({ apiBase }: Props) {
  const [records,  setRecords]  = useState<PettyCash[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [pcPage,   setPcPage]   = useState(1);
  const PC_PAGE_SIZE = 10;

  // Filters
  const [search,   setSearch]   = useState('');
  const [preset,   setPreset]   = useState<Preset>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate,   setToDate]   = useState('');
  const [exporting, setExporting] = useState(false);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editing,  setEditing]  = useState<PettyCash | null>(null);
  const [fItem,    setFItem]    = useState('');
  const [fCash,    setFCash]    = useState('');
  const [fDate,    setFDate]    = useState(TODAY);
  const [saving,   setSaving]   = useState(false);
  const [formErr,  setFormErr]  = useState('');
  const [success,  setSuccess]  = useState('');

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<PettyCash | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  const load = (filters?: { from_date?: string; to_date?: string; search?: string }) => {
    setLoading(true); setError('');
    getPettyCash(apiBase, filters)
      .then(data => { setRecords(data); setPcPage(1); })
      .catch(() => setError('Failed to load petty cash records.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [apiBase]);

  const applyPreset = (p: Preset) => {
    setPreset(p);
    if (p === 'all') {
      setFromDate(''); setToDate('');
      load({ search: search || undefined });
    } else if (p !== 'custom') {
      const { from, to } = getPresetDates(p as 'today' | 'week' | 'month' | 'last_month');
      setFromDate(from); setToDate(to);
      load({ search: search || undefined, from_date: from, to_date: to });
    }
  };

  const handleSearch = () =>
    load({ search: search || undefined, from_date: fromDate || undefined, to_date: toDate || undefined });

  const clearFilters = () => {
    setSearch(''); setFromDate(''); setToDate(''); setPreset('all');
    load({});
  };

  const handleExport = () => {
    setExporting(true);
    try {
      exportPettyCashPdf(records, {
        title: 'My Petty Cash Report',
        period: formatPeriodLabel(fromDate, toDate),
        showAccountant: false,
      });
    } finally { setExporting(false); }
  };

  const openCreate = () => {
    setEditing(null); setFItem(''); setFCash(''); setFDate(TODAY);
    setFormErr(''); setSuccess(''); setFormOpen(true);
  };

  const openEdit = (r: PettyCash) => {
    setEditing(r);
    setFItem(r.item);
    setFCash(String(r.cash));
    setFDate(r.date?.slice(0, 10) ?? TODAY);
    setFormErr(''); setSuccess(''); setFormOpen(true);
  };

  const closeForm = () => { setFormOpen(false); setEditing(null); };

  const handleSave = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!fItem.trim())                                           { setFormErr('Item description is required.'); return; }
    if (!fCash || isNaN(Number(fCash)) || Number(fCash) === 0) { setFormErr('Enter a valid cash amount.'); return; }
    if (!fDate)                                                  { setFormErr('Date is required.'); return; }
    setSaving(true); setFormErr(''); setSuccess('');
    try {
      const payload = { item: fItem.trim(), cash: Number(fCash), date: fDate };
      if (editing?.id) {
        await updatePettyCash(apiBase, editing.id, payload);
        setSuccess('Record updated.');
      } else {
        await createPettyCash(apiBase, payload);
        setSuccess('Record added.');
      }
      closeForm();
      load({ search: search || undefined, from_date: fromDate || undefined, to_date: toDate || undefined });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save.';
      setFormErr(msg);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await deletePettyCash(apiBase, deleteTarget.id);
      setDeleteTarget(null);
      setSuccess('Record deleted.');
      load({ search: search || undefined, from_date: fromDate || undefined, to_date: toDate || undefined });
    } catch {
      setError('Failed to delete record.');
    } finally { setDeleting(false); }
  };

  const total = records.reduce((sum, r) => sum + Number(r.cash), 0);
  const hasFilter = !!(search || fromDate || toDate);
  const pcTotalPages = Math.ceil(records.length / PC_PAGE_SIZE);
  const pcPaged = records.slice((pcPage - 1) * PC_PAGE_SIZE, pcPage * PC_PAGE_SIZE);

  return (
    <div className="pcp-root">
      <PageHeader
        title="Petty Cash"
        subtitle="Track and manage petty cash transactions"
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={() => load({ search: search || undefined, from_date: fromDate || undefined, to_date: toDate || undefined })}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button className="apc-export-btn" onClick={handleExport} disabled={exporting || records.length === 0}>
              <FileDown size={14} /> {exporting ? 'Exporting…' : 'Export PDF'}
            </button>
            <button className="btn-primary" onClick={openCreate}><Plus size={14} /> Add Entry</button>
          </div>
        }
      />

      {success && <div className="alert alert-success"><CheckCircle size={14} />{success}</div>}
      {error   && <div className="alert alert-error"><AlertCircle size={14} />{error}</div>}

      {/* Summary */}
      <div className="pcp-summary-row">
        <div className="pcp-summary-card">
          <DollarSign size={22} style={{ color: '#2D5016' }} />
          <div>
            <p className="pcp-sum-val">RWF {fmtCash(total)}</p>
            <p className="pcp-sum-lbl">{hasFilter ? 'Filtered' : 'Total'} ({records.length} entries)</p>
          </div>
        </div>
      </div>

      {/* Add / Edit drawer */}
      {formOpen && (
        <div className="pcp-drawer">
          <div className="pcp-drawer-head">
            <h3 className="pcp-drawer-title">{editing ? 'Edit Entry' : 'New Petty Cash Entry'}</h3>
            <button className="atm-close-btn" onClick={closeForm}><X size={16} /></button>
          </div>
          {formErr && <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}><AlertCircle size={13} />{formErr}</div>}
          <form onSubmit={handleSave} className="saic-form">
            <div className="form-row">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Item / Description *</label>
                <input type="text" value={fItem} placeholder="e.g. Office supplies, Transport…"
                  onChange={e => { setFItem(e.target.value); setFormErr(''); }} disabled={saving} />
              </div>
              <div className="form-group">
                <label>Amount (RWF) *</label>
                <input type="number" step="0.01" value={fCash} placeholder="0.00"
                  onChange={e => { setFCash(e.target.value); setFormErr(''); }} disabled={saving} />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input type="date" value={fDate}
                  onChange={e => { setFDate(e.target.value); setFormErr(''); }} disabled={saving} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <><Loader2 size={14} className="spin" /> Saving…</> : <><CheckCircle size={14} /> {editing ? 'Update' : 'Add Entry'}</>}
              </button>
              <button type="button" className="btn-secondary" onClick={closeForm} disabled={saving}>
                <X size={14} /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="apc-filters-wrap">
        <div className="apc-preset-row">
          {PRESETS.map(p => (
            <button key={p.value}
              className={`apc-preset-btn${preset === p.value ? ' active' : ''}`}
              onClick={() => applyPreset(p.value)}>{p.label}</button>
          ))}
        </div>

        <div className="apc-filters">
          <div className="atm-search-box" style={{ flex: 1, minWidth: 200, maxWidth: 320 }}>
            <Search size={15} className="atm-search-icon" />
            <input className="atm-search-input" placeholder="Search by item…"
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            {search && <button className="atm-search-clear" onClick={() => { setSearch(''); load({ from_date: fromDate || undefined, to_date: toDate || undefined }); }}><X size={13} /></button>}
          </div>

          <div className="apc-date-group">
            <span className="apc-date-label">From</span>
            <input type="date" className="atm-select" value={fromDate}
              onChange={e => { setFromDate(e.target.value); setPreset('custom'); }} />
            <span className="apc-date-label">To</span>
            <input type="date" className="atm-select" value={toDate}
              onChange={e => { setToDate(e.target.value); setPreset('custom'); }} />
            <button className="btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }} onClick={handleSearch}>
              <Search size={13} /> Apply
            </button>
            {hasFilter && (
              <button className="btn-secondary" onClick={clearFilters}><X size={13} /> Clear</button>
            )}
          </div>
        </div>

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
                  <th>Item / Description</th>
                  <th>Amount (RWF)</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 && (
                  <tr><td colSpan={5}>
                    <div className="empty-state"><DollarSign size={38} /><p>No petty cash entries yet.</p></div>
                  </td></tr>
                )}
                {pcPaged.map((r, i) => (
                  <tr key={r.id}>
                    <td className="col-num">{(pcPage - 1) * PC_PAGE_SIZE + i + 1}</td>
                    <td className="pcp-item-cell">{r.item}</td>
                    <td className="pcp-cash-cell">RWF {fmtCash(Number(r.cash))}</td>
                    <td style={{ fontSize: '0.82rem', color: '#6a8c6a', whiteSpace: 'nowrap' }}>{fmtDate(r.date)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="pcp-btn-edit" onClick={() => openEdit(r)} title="Edit"><Pencil size={13} /></button>
                        <button className="pcp-btn-delete" onClick={() => setDeleteTarget(r)} title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {records.length > 0 && (
                  <tr className="pcp-total-row">
                    <td colSpan={2} style={{ fontWeight: 700, color: '#1e3a1e' }}>Total</td>
                    <td className="pcp-cash-cell pcp-total-val">RWF {fmtCash(total)}</td>
                    <td colSpan={2} />
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pcTotalPages > 1 && (
            <div className="atm-pagination">
              <button className="atm-pg-btn" disabled={pcPage <= 1} onClick={() => setPcPage(p => p - 1)}>
                <ChevronLeft size={15} />
              </button>
              <span className="atm-pg-info">Page {pcPage} of {pcTotalPages} ({records.length} entries)</span>
              <button className="atm-pg-btn" disabled={pcPage >= pcTotalPages} onClick={() => setPcPage(p => p + 1)}>
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="leave-modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="leave-modal">
            <h3>Delete Entry?</h3>
            <p>
              <strong>{deleteTarget.item}</strong> — RWF {fmtCash(Number(deleteTarget.cash))}<br />
              <span style={{ fontSize: '0.8rem', color: '#9ab09a' }}>{fmtDate(deleteTarget.date)}</span>
            </p>
            <div className="leave-modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                <X size={13} /> Cancel
              </button>
              <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 size={13} className="spin" /> : <Trash2 size={13} />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
