import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PettyCash } from '../types';

export interface ExportOptions {
  title: string;
  subtitle?: string;
  period?: string;
  showAccountant?: boolean;
}

function fmt(v: number) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function exportPettyCashPdf(records: PettyCash[], opts: ExportOptions) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const BRAND   = '#2D5016';
  const PAGE_W  = doc.internal.pageSize.getWidth();
  const MARGIN  = 14;

  // ── Header bar ──────────────────────────────────────────────────
  doc.setFillColor(BRAND);
  doc.rect(0, 0, PAGE_W, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SAIC MIS', MARGIN, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Management Information System', MARGIN, 17);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(opts.title, PAGE_W - MARGIN, 11, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${fmtDate(new Date().toISOString().slice(0, 10))}`, PAGE_W - MARGIN, 17, { align: 'right' });

  // ── Meta row ─────────────────────────────────────────────────────
  let y = 34;
  doc.setTextColor(60, 60, 60);

  if (opts.subtitle) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(opts.subtitle, MARGIN, y);
    y += 5;
  }
  if (opts.period) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Period: ${opts.period}`, MARGIN, y);
    y += 5;
  }

  // ── Table ─────────────────────────────────────────────────────────
  const total = records.reduce((s, r) => s + Number(r.cash), 0);

  const columns = opts.showAccountant
    ? [
        { header: '#',              dataKey: 'num'  },
        { header: 'Accountant',     dataKey: 'who'  },
        { header: 'Item',           dataKey: 'item' },
        { header: 'Amount (RWF)',   dataKey: 'cash' },
        { header: 'Date',           dataKey: 'date' },
      ]
    : [
        { header: '#',              dataKey: 'num'  },
        { header: 'Item',           dataKey: 'item' },
        { header: 'Amount (RWF)',   dataKey: 'cash' },
        { header: 'Date',           dataKey: 'date' },
      ];

  const rows = records.map((r, i): Record<string, string | number> => {
    const name = r.first_name && r.last_name ? `${r.first_name} ${r.last_name}` : (r.email ?? '');
    const base: Record<string, string | number> = { num: i + 1, item: r.item, cash: `RWF ${fmt(Number(r.cash))}`, date: fmtDate(r.date) };
    if (opts.showAccountant) base.who = name;
    return base;
  });

  autoTable(doc, {
    startY: y + 2,
    columns,
    body: rows,
    headStyles: {
      fillColor: [45, 80, 22],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
    },
    bodyStyles: { fontSize: 8, textColor: [40, 40, 40] },
    alternateRowStyles: { fillColor: [245, 252, 245] },
    columnStyles: {
      num:  { cellWidth: 10, halign: 'center' },
      cash: { halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: MARGIN, right: MARGIN },
    foot: [[
      opts.showAccountant
        ? { content: `TOTAL (${records.length} entries)`, colSpan: 3, styles: { fontStyle: 'bold', fillColor: [224, 240, 224] } }
        : { content: `TOTAL (${records.length} entries)`, colSpan: 2, styles: { fontStyle: 'bold', fillColor: [224, 240, 224] } },
      { content: `RWF ${fmt(total)}`, styles: { fontStyle: 'bold', fillColor: [224, 240, 224], halign: 'right' } },
      { content: '', styles: { fillColor: [224, 240, 224] } },
    ]],
    showFoot: 'lastPage',
  });

  // ── Footer on each page ───────────────────────────────────────────
  const pageCount = (doc.internal as unknown as { getNumberOfPages(): number }).getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFillColor(240, 247, 240);
    doc.rect(0, doc.internal.pageSize.getHeight() - 10, PAGE_W, 10, 'F');
    doc.setFontSize(7);
    doc.setTextColor(100, 130, 100);
    doc.text('SAIC MIS — Confidential', MARGIN, doc.internal.pageSize.getHeight() - 4);
    doc.text(`Page ${p} of ${pageCount}`, PAGE_W - MARGIN, doc.internal.pageSize.getHeight() - 4, { align: 'right' });
  }

  const filename = `petty_cash_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

// ── Period helpers ────────────────────────────────────────────────────────────
function pad(n: number) { return String(n).padStart(2, '0'); }

export function getPresetDates(preset: 'today' | 'week' | 'month' | 'last_month') {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
  const iso = (dt: Date) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  const today = iso(now);

  if (preset === 'today') return { from: today, to: today };

  if (preset === 'week') {
    const day = now.getDay() === 0 ? 6 : now.getDay() - 1; // Mon=0
    const mon = new Date(y, m, d - day);
    return { from: iso(mon), to: today };
  }

  if (preset === 'month') {
    return { from: `${y}-${pad(m + 1)}-01`, to: today };
  }

  if (preset === 'last_month') {
    const lm   = m === 0 ? 11 : m - 1;
    const ly   = m === 0 ? y - 1 : y;
    const last = new Date(ly, lm + 1, 0);
    return { from: `${ly}-${pad(lm + 1)}-01`, to: iso(last) };
  }

  return { from: '', to: '' };
}

export function formatPeriodLabel(from: string, to: string) {
  if (!from && !to) return 'All time';
  const f = from ? new Date(from).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '…';
  const t = to   ? new Date(to).toLocaleDateString('en-GB',   { day: '2-digit', month: 'short', year: 'numeric' }) : '…';
  return from === to ? f : `${f} – ${t}`;
}
