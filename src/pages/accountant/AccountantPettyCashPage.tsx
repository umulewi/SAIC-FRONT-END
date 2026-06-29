import { useEffect, useRef, useState, Fragment } from 'react';
import {
  Plus, Pencil, X, CheckCircle, AlertCircle,
  RefreshCw, Loader2, DollarSign, Search, FileDown,
  ChevronLeft, ChevronRight, Paperclip, ExternalLink,
} from 'lucide-react';
import { getPettyCash, createPettyCash, updatePettyCash } from '../../api/role';
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

interface BatchRow {
  _id:  string;
  item: string;
  cash: string;
  date: string;
}

function emptyRow(): BatchRow {
  return { _id: crypto.randomUUID(), item: '', cash: '', date: TODAY };
}

interface PcGroup {
  key: string;
  receipt_file?: string | null;
  receipt_original?: string | null;
  items: PettyCash[];
  subtotal: number;
}

function buildGroups(records: PettyCash[]): PcGroup[] {
  const groups: PcGroup[] = [];
  const seen = new Map<string, PcGroup>();
  for (const r of records) {
    if (r.batch_id) {
      if (seen.has(r.batch_id)) {
        const g = seen.get(r.batch_id)!;
        g.items.push(r);
        g.subtotal += Number(r.cash);
      } else {
        const g: PcGroup = { key: r.batch_id, receipt_file: r.receipt_file, receipt_original: r.receipt_original, items: [r], subtotal: Number(r.cash) };
        seen.set(r.batch_id, g);
        groups.push(g);
      }
    } else {
      groups.push({ key: `solo-${r.id}`, receipt_file: r.receipt_file, receipt_original: r.receipt_original, items: [r], subtotal: Number(r.cash) });
    }
  }
  return groups;
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

  // Form state — single row for edit, multi-row for create
  const [formOpen, setFormOpen] = useState(false);
  const [editing,  setEditing]  = useState<PettyCash | null>(null);

  // Edit-mode single fields
  const [fItem,    setFItem]    = useState('');
  const [fCash,    setFCash]    = useState('');
  const [fDate,    setFDate]    = useState(TODAY);
  const [fReceipt, setFReceipt] = useState<File | null>(null); // replacement receipt (optional)
  const fReceiptRef = useRef<HTMLInputElement>(null);

  // Create-mode batch
  const [batchRows,    setBatchRows]    = useState<BatchRow[]>([emptyRow()]);
  const [batchReceipt, setBatchReceipt] = useState<File | null>(null); // one shared receipt
  const batchFileRef = useRef<HTMLInputElement>(null);

  const [saving,  setSaving]  = useState(false);
  const [formErr, setFormErr] = useState('');
  const [success, setSuccess] = useState('');


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
    setEditing(null);
    setBatchRows([emptyRow()]);
    setBatchReceipt(null);
    setFormErr(''); setSuccess(''); setFormOpen(true);
  };

  const openEdit = (r: PettyCash) => {
    setEditing(r);
    setFItem(r.item);
    setFCash(String(r.cash));
    setFDate(r.date?.slice(0, 10) ?? TODAY);
    setFReceipt(null);
    setFormErr(''); setSuccess(''); setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false); setEditing(null);
    setBatchRows([emptyRow()]); setBatchReceipt(null);
    setFReceipt(null);
  };

  // ── Batch row helpers ──────────────────────────────────────────────
  const updateRow = (id: string, field: keyof BatchRow, value: string) =>
    setBatchRows(prev => prev.map(r => r._id === id ? { ...r, [field]: value } : r));

  const addRow = () => setBatchRows(prev => [...prev, emptyRow()]);

  const removeRow = (id: string) =>
    setBatchRows(prev => prev.length > 1 ? prev.filter(r => r._id !== id) : prev);

  // ── Save (edit single) ─────────────────────────────────────────────
  const handleSaveEdit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!fItem.trim())                                           { setFormErr('Item description is required.'); return; }
    if (!fCash || isNaN(Number(fCash)) || Number(fCash) === 0) { setFormErr('Enter a valid cash amount.'); return; }
    if (!fDate)                                                  { setFormErr('Date is required.'); return; }
    setSaving(true); setFormErr('');
    try {
      const fd = new FormData();
      fd.append('item', fItem.trim());
      fd.append('cash', String(Number(fCash)));
      fd.append('date', fDate);
      if (fReceipt) fd.append('receipt', fReceipt);
      await updatePettyCash(apiBase, editing!.id!, fd);
      closeForm();
      load({ search: search || undefined, from_date: fromDate || undefined, to_date: toDate || undefined });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save.';
      setFormErr(msg);
    } finally { setSaving(false); }
  };

  // ── Save All (batch create) ± export PDF ──────────────────────────
  const doSaveBatch = async (exportAfter: boolean) => {
    for (let i = 0; i < batchRows.length; i++) {
      const r = batchRows[i];
      const n = i + 1;
      if (!r.item.trim())                                            { setFormErr(`Row ${n}: Item description is required.`); return; }
      if (!r.cash || isNaN(Number(r.cash)) || Number(r.cash) === 0) { setFormErr(`Row ${n}: Enter a valid cash amount.`); return; }
      if (!r.date)                                                   { setFormErr(`Row ${n}: Date is required.`); return; }
    }
    if (!batchReceipt) { setFormErr('Please attach a receipt file for this batch.'); return; }

    setSaving(true); setFormErr('');
    try {
      const snapshot = batchRows.map(r => ({ ...r }));
      const batchId = snapshot.length > 1 ? crypto.randomUUID() : null;
      for (const r of snapshot) {
        const fd = new FormData();
        fd.append('item',    r.item.trim());
        fd.append('cash',    String(Number(r.cash)));
        fd.append('date',    r.date);
        fd.append('receipt', batchReceipt); // same file for all entries
        if (batchId) fd.append('batch_id', batchId);
        await createPettyCash(apiBase, fd);
      }
      closeForm();
      const fresh = await getPettyCash(apiBase, {
        search: search || undefined, from_date: fromDate || undefined, to_date: toDate || undefined,
      });
      setRecords(fresh); setPcPage(1);
      if (exportAfter) {
        const batchAsPc: PettyCash[] = snapshot.map((r, i) => ({
          id: -(i + 1), item: r.item.trim(), cash: Number(r.cash), date: r.date,
        }));
        exportPettyCashPdf(batchAsPc, {
          title: 'Petty Cash Entry',
          period: formatPeriodLabel(
            snapshot.reduce((mn, r) => (!mn || r.date < mn ? r.date : mn), ''),
            snapshot.reduce((mx, r) => (!mx || r.date > mx ? r.date : mx), ''),
          ),
          showAccountant: false,
        });
      }
      setSuccess(`${snapshot.length} entr${snapshot.length !== 1 ? 'ies' : 'y'} added.${exportAfter ? ' PDF exported.' : ''}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save entries.';
      setFormErr(msg);
    } finally { setSaving(false); }
  };

  const total = records.reduce((sum, r) => sum + Number(r.cash), 0);
  const hasFilter = !!(search || fromDate || toDate);
  const allGroups = buildGroups(records);
  const pcTotalPages = Math.ceil(allGroups.length / PC_PAGE_SIZE);
  const pcPaged = allGroups.slice((pcPage - 1) * PC_PAGE_SIZE, pcPage * PC_PAGE_SIZE);
  const batchTotal = batchRows.reduce((s, r) => s + (Number(r.cash) || 0), 0);

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
            <button className="btn-primary" onClick={openCreate}><Plus size={14} /> New Entries</button>
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

      {/* ── Edit drawer (single entry) ── */}
      {formOpen && editing && (
        <div className="pcp-drawer">
          <div className="pcp-drawer-head">
            <h3 className="pcp-drawer-title">Edit Entry</h3>
            <button className="atm-close-btn" onClick={closeForm}><X size={16} /></button>
          </div>
          {formErr && <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}><AlertCircle size={13} />{formErr}</div>}
          <form onSubmit={handleSaveEdit} className="saic-form">
            <div className="form-row">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Item / Description *</label>
                <input type="text" value={fItem} placeholder="e.g. Office supplies"
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
                  max={TODAY}
                  onChange={e => { setFDate(e.target.value); setFormErr(''); }} disabled={saving} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Receipt File</label>
                <input
                  ref={fReceiptRef}
                  type="file"
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  onChange={e => { setFReceipt(e.target.files?.[0] ?? null); setFormErr(''); }}
                  disabled={saving}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {editing?.receipt_file && !fReceipt && (
                    <a href={`/uploads/${editing.receipt_file}`} target="_blank" rel="noopener noreferrer"
                      className="pcp-receipt-link" title={editing.receipt_original ?? 'Receipt'}>
                      <Paperclip size={12} />
                      <span className="pcp-receipt-name">{editing.receipt_original ?? 'Current receipt'}</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                  <button
                    type="button"
                    className={`pcp-batch-file-btn${fReceipt ? ' pcp-batch-file-btn--set' : ''}`}
                    onClick={() => fReceiptRef.current?.click()}
                    disabled={saving}
                  >
                    {fReceipt
                      ? <><CheckCircle size={13} />{fReceipt.name.length > 30 ? fReceipt.name.slice(0, 28) + '…' : fReceipt.name}</>
                      : <><Paperclip size={13} />{editing?.receipt_file ? 'Replace file…' : 'Attach file (PDF / image)'}</>
                    }
                  </button>
                  {fReceipt && (
                    <button type="button" className="pcp-batch-remove" onClick={() => setFReceipt(null)} disabled={saving} title="Remove">
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <><Loader2 size={14} className="spin" /> Saving…</> : <><CheckCircle size={14} /> Update</>}
              </button>
              <button type="button" className="btn-secondary" onClick={closeForm} disabled={saving}>
                <X size={14} /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Batch create drawer ── */}
      {formOpen && !editing && (
        <div className="pcp-drawer pcp-drawer--batch">
          <div className="pcp-drawer-head">
            <div>
              <h3 className="pcp-drawer-title">New Petty Cash Entries</h3>
              <p style={{ fontSize: '0.78rem', color: '#7a9a7a', margin: '2px 0 0' }}>
                Add multiple entries — attach one receipt file for the whole batch
              </p>
            </div>
            <button className="atm-close-btn" onClick={closeForm}><X size={16} /></button>
          </div>

          {formErr && <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}><AlertCircle size={13} />{formErr}</div>}

          <form onSubmit={e => { e.preventDefault(); doSaveBatch(false); }}>
            {/* Entry rows table */}
            <div className="pcp-batch-table-wrap">
              <table className="pcp-batch-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item / Description *</th>
                    <th>Amount (RWF) *</th>
                    <th>Date *</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {batchRows.map((row, i) => (
                    <BatchRowInput
                      key={row._id}
                      row={row}
                      index={i}
                      onChange={updateRow}
                      onRemove={removeRow}
                      canRemove={batchRows.length > 1}
                      disabled={saving}
                      maxDate={TODAY}
                    />
                  ))}
                </tbody>
                {batchRows.length > 1 && (
                  <tfoot>
                    <tr>
                      <td colSpan={2} style={{ fontWeight: 700, color: '#2D5016', padding: '0.5rem 0.6rem' }}>
                        Total ({batchRows.length} entries)
                      </td>
                      <td style={{ fontWeight: 700, color: '#2D5016', padding: '0.5rem 0.6rem' }}>
                        RWF {fmtCash(batchTotal)}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Add row button */}
            <div style={{ margin: '0.5rem 0 0.9rem' }}>
              <button type="button" className="btn-secondary" onClick={addRow} disabled={saving}>
                <Plus size={13} /> Add Another Row
              </button>
            </div>

            {/* Shared receipt upload */}
            <div className="pcp-batch-receipt-row">
              <span className="pcp-batch-receipt-label">
                <Paperclip size={14} />
                Receipt file (shared for all entries) *
              </span>
              <input
                ref={batchFileRef}
                type="file"
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={e => { setBatchReceipt(e.target.files?.[0] ?? null); setFormErr(''); }}
                disabled={saving}
              />
              <button
                type="button"
                className={`pcp-batch-file-btn${batchReceipt ? ' pcp-batch-file-btn--set' : ''}`}
                onClick={() => batchFileRef.current?.click()}
                disabled={saving}
              >
                {batchReceipt
                  ? <><CheckCircle size={13} />{batchReceipt.name.length > 30 ? batchReceipt.name.slice(0, 28) + '…' : batchReceipt.name}</>
                  : <><Paperclip size={13} />Choose file (PDF / image)</>
                }
              </button>
              {batchReceipt && (
                <button type="button" className="pcp-batch-remove" onClick={() => setBatchReceipt(null)} disabled={saving} title="Remove">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Action buttons */}
            <div className="pcp-batch-footer" style={{ marginTop: '0.85rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                <button type="button" className="btn-secondary" onClick={closeForm} disabled={saving}>
                  <X size={13} /> Cancel
                </button>
                <button type="submit" className="btn-secondary" disabled={saving}>
                  {saving ? <><Loader2 size={13} className="spin" /> Saving…</> : <><CheckCircle size={13} /> Save All</>}
                </button>
                <button type="button" className="btn-primary" disabled={saving} onClick={() => doSaveBatch(true)}>
                  {saving ? <><Loader2 size={13} className="spin" /> Saving…</> : <><FileDown size={13} /> Save All &amp; Export PDF</>}
                </button>
              </div>
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
            <div style={{ overflowX: 'auto' }}>
              <table className="saic-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item / Description</th>
                    <th>Amount (RWF)</th>
                    <th>Date</th>
                    <th>Receipt</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 && (
                    <tr><td colSpan={6}>
                      <div className="empty-state"><DollarSign size={38} /><p>No petty cash entries yet.</p></div>
                    </td></tr>
                  )}
                  {pcPaged.map((g, gi) => {
                    const rowIdx = (pcPage - 1) * PC_PAGE_SIZE + gi + 1;

                    if (g.items.length === 1) {
                      const r = g.items[0];
                      return (
                        <tr key={g.key}>
                          <td className="col-num">{rowIdx}</td>
                          <td className="pcp-item-cell">{r.item}</td>
                          <td className="pcp-cash-cell">RWF {fmtCash(Number(r.cash))}</td>
                          <td style={{ fontSize: '0.82rem', color: '#6a8c6a', whiteSpace: 'nowrap' }}>{fmtDate(r.date)}</td>
                          <td className="pcp-group-receipt-cell">
                            {r.receipt_file
                              ? <a href={`/uploads/${r.receipt_file}`} target="_blank" rel="noopener noreferrer"
                                  className="pcp-receipt-link" title={r.receipt_original ?? 'Receipt'}>
                                  <Paperclip size={12} />
                                  <span className="pcp-receipt-name">{r.receipt_original ?? 'Receipt'}</span>
                                  <ExternalLink size={11} />
                                </a>
                              : <span className="sm-dash">—</span>
                            }
                          </td>
                          <td>
                            <button className="pcp-btn-edit" onClick={() => openEdit(r)} title="Edit"><Pencil size={13} /></button>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <Fragment key={g.key}>
                        <tr className="pcp-group-header-row">
                          <td colSpan={6}>
                            <div className="pcp-group-header">
                              <span className="pcp-group-meta">
                                {g.items.length} items · RWF {fmtCash(g.subtotal)}
                              </span>
                            </div>
                          </td>
                        </tr>
                        {g.items.map((r, ii) => (
                          <tr key={r.id} className="pcp-group-item-row">
                            <td className="col-num">{rowIdx}.{ii + 1}</td>
                            <td className="pcp-item-cell">{r.item}</td>
                            <td className="pcp-cash-cell">RWF {fmtCash(Number(r.cash))}</td>
                            <td style={{ fontSize: '0.82rem', color: '#6a8c6a', whiteSpace: 'nowrap' }}>{fmtDate(r.date)}</td>
                            {ii === 0 && (
                              <td rowSpan={g.items.length} className="pcp-group-receipt-cell">
                                {g.receipt_file
                                  ? <a href={`/uploads/${g.receipt_file}`} target="_blank" rel="noopener noreferrer"
                                      className="pcp-receipt-link" title={g.receipt_original ?? 'Receipt'}>
                                      <Paperclip size={12} />
                                      <span className="pcp-receipt-name">{g.receipt_original ?? 'Receipt'}</span>
                                      <ExternalLink size={11} />
                                    </a>
                                  : <span className="sm-dash">—</span>
                                }
                              </td>
                            )}
                            <td>
                              <button className="pcp-btn-edit" onClick={() => openEdit(r)} title="Edit"><Pencil size={13} /></button>
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    );
                  })}
                  {records.length > 0 && (
                    <tr className="pcp-total-row">
                      <td colSpan={2} style={{ fontWeight: 700, color: '#1e3a1e' }}>Total</td>
                      <td className="pcp-cash-cell pcp-total-val">RWF {fmtCash(total)}</td>
                      <td colSpan={3} />
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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

    </div>
  );
}

// ── Batch row sub-component ────────────────────────────────────────────────────
interface BatchRowProps {
  row:      BatchRow;
  index:    number;
  onChange: (id: string, field: keyof BatchRow, value: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  disabled:  boolean;
  maxDate?:  string;
}

function BatchRowInput({ row, index, onChange, onRemove, canRemove, disabled, maxDate }: BatchRowProps) {
  return (
    <tr className="pcp-batch-row">
      <td className="pcp-batch-num">{index + 1}</td>
      <td>
        <input
          className="pcp-batch-input"
          type="text"
          placeholder="Item / description"
          value={row.item}
          onChange={e => onChange(row._id, 'item', e.target.value)}
          disabled={disabled}
        />
      </td>
      <td>
        <input
          className="pcp-batch-input pcp-batch-cash"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={row.cash}
          onChange={e => onChange(row._id, 'cash', e.target.value)}
          disabled={disabled}
        />
      </td>
      <td>
        <input
          className="pcp-batch-input"
          type="date"
          value={row.date}
          max={maxDate}
          onChange={e => onChange(row._id, 'date', e.target.value)}
          disabled={disabled}
        />
      </td>
      <td>
        {canRemove && (
          <button
            type="button"
            className="pcp-batch-remove"
            onClick={() => onRemove(row._id)}
            disabled={disabled}
            title="Remove row"
          >
            <X size={13} />
          </button>
        )}
      </td>
    </tr>
  );
}
