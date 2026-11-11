import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { LeaveRequest } from '../types';

const BRAND: [number, number, number]   = [45, 80, 22];
const TEAL:  [number, number, number]   = [0, 172, 193];
const LIGHT: [number, number, number]   = [240, 247, 240];
const BORDER: [number, number, number]  = [180, 210, 180];

function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

function sectionBar(doc: jsPDF, y: number, text: string, W: number, M: number): number {
  doc.setFillColor(...BRAND);
  doc.rect(M, y, W - M * 2, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(text, M + 3, y + 5);
  return y + 9;
}

function cell2(
  doc: jsPDF, y: number, h: number,
  l1: string, v1: string,
  l2: string, v2: string,
  W: number, M: number
): number {
  const half = (W - M * 2) / 2;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.rect(M,        y, half, h);
  doc.rect(M + half, y, half, h);
  doc.setFontSize(6.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BRAND);
  doc.text(l1, M + 2,        y + 4);
  doc.text(l2, M + half + 2, y + 4);
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(40, 40, 40);
  doc.text(v1.slice(0, 50), M + 2,        y + h - 2.5);
  doc.text(v2.slice(0, 50), M + half + 2, y + h - 2.5);
  return y + h;
}

function textBox(doc: jsPDF, y: number, label: string, content: string, W: number, M: number): number {
  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BRAND);
  doc.text(label, M, y + 4);
  y += 7;
  const wrapped = doc.splitTextToSize(content || '—', W - M * 2 - 4);
  const boxH = Math.max(12, wrapped.length * 4.5 + 5);
  doc.setDrawColor(...BORDER); doc.setLineWidth(0.3);
  doc.rect(M, y, W - M * 2, boxH);
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(40, 40, 40);
  doc.text(wrapped, M + 2, y + 5);
  return y + boxH + 4;
}

function buildLeaveFormDoc(l: LeaveRequest): { doc: jsPDF; filename: string } {
  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W    = doc.internal.pageSize.getWidth();
  const H    = doc.internal.pageSize.getHeight();
  const M    = 14;

  const fullName  = l.first_name && l.last_name ? `${l.first_name} ${l.last_name}` : (l.email ?? '—');
  const leaveType = l.leave_type ?? 'annual';

  const returnDate = l.end_date ? (() => {
    const d = new Date(l.end_date); d.setDate(d.getDate() + 1);
    return fmtDate(d.toISOString().slice(0, 10));
  })() : '—';

  const reasonText = leaveType === 'other'
    ? (l.reason.match(/^\[.+?\]\s+(.*)$/)?.[1] ?? l.reason)
    : l.reason;

  // ── TOP GREEN HEADER ──────────────────────────────────────────────────
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, W, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20); doc.setFont('helvetica', 'bold');
  doc.text('SAIC', W / 2, 14, { align: 'center' });
  doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
  doc.text('Stewardship Agribusiness Incubation Center', W / 2, 20, { align: 'center' });
  doc.setFontSize(7); doc.setTextColor(200, 230, 200);
  doc.text('www.stewardincubation.com', W / 2, 26, { align: 'center' });

  // ── TITLES ────────────────────────────────────────────────────────────
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.text('LEAVE REQUEST FORM', W / 2, 40, { align: 'center' });
  doc.setFontSize(9); doc.setFont('helvetica', 'bolditalic'); doc.setTextColor(80, 80, 80);
  doc.text('FORMULAIRE DE DEMANDE DE CONGÉ', W / 2, 47, { align: 'center' });
  doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(120, 120, 120);
  doc.text('Reference: Proc N°14 – Leave Application & Approval / Demande & Approbation de Congé', W / 2, 53, { align: 'center' });

  // divider
  doc.setDrawColor(...BRAND); doc.setLineWidth(0.5);
  doc.line(M, 57, W - M, 57);

  let y = 63;

  // ── SECTION 1: EMPLOYEE INFORMATION ──────────────────────────────────
  y = sectionBar(doc, y, 'SECTION 1: EMPLOYEE INFORMATION  /  SECTION 1 : INFORMATIONS SUR L\'EMPLOYÉ', W, M);
  y = cell2(doc, y, 12, 'Full Name / Nom Complet', fullName, 'Email', l.email ?? '—', W, M);
  y = cell2(doc, y, 12, 'Department / Département', l.department_name ?? '—', 'Position / Title', l.role_name ?? '—', W, M);
  y = cell2(doc, y, 12, 'Date Submitted / Date de Soumission', fmtDate(l.requested_at ?? l.created_at), 'Supervisor / Superviseur', l.manager_name ?? '—', W, M);
  y += 5;

  // ── SECTION 2: TYPE OF LEAVE ──────────────────────────────────────────
  y = sectionBar(doc, y, 'SECTION 2: TYPE OF LEAVE  /  SECTION 2 : TYPE DE CONGÉ', W, M);

  const leaveTypes = [
    { key: 'annual',    en: 'Annual Leave',                     fr: 'Congé Annuel'        },
    { key: 'sick',      en: 'Sick Leave',                       fr: 'Congé de Maladie'    },
    { key: 'maternity', en: 'Maternity Leave',                  fr: 'Congé de Maternité'  },
    { key: 'paternity', en: 'Paternity Leave',                  fr: 'Congé de Paternité'  },
    { key: 'emergency', en: 'Compassionate / Bereavement Leave',fr: 'Congé de Compassion' },
    { key: 'unpaid',    en: 'Unpaid Leave',                     fr: 'Congé sans Solde'    },
    { key: 'other',     en: 'Other (specify below)',            fr: 'Autre (préciser)'    },
  ];

  const half = (W - M * 2) / 2;
  leaveTypes.forEach((lt, idx) => {
    const col   = idx % 2;
    const row   = Math.floor(idx / 2);
    const cx    = M + col * half + 3;
    const cy    = y + row * 8 + 5;
    const checked = lt.key === leaveType;

    doc.setDrawColor(80, 120, 80); doc.setLineWidth(0.4);
    doc.rect(cx, cy - 3.5, 4, 4);
    if (checked) { doc.setFillColor(...BRAND); doc.rect(cx + 0.5, cy - 3, 3, 3, 'F'); }

    if (checked) { doc.setTextColor(...BRAND); doc.setFont('helvetica', 'bold'); }
    else         { doc.setTextColor(60, 60, 60); doc.setFont('helvetica', 'normal'); }
    doc.setFontSize(8);
    doc.text(`${lt.en} / ${lt.fr}`, cx + 6, cy);
  });

  y += Math.ceil(leaveTypes.length / 2) * 8 + 6;

  if (leaveType === 'other') {
    doc.setFontSize(7.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(80, 80, 80);
    doc.text('If "Other", please specify / Si « Autre », veuillez préciser :', M, y);
    y += 5;
    doc.setDrawColor(...BORDER); doc.setLineWidth(0.3);
    doc.rect(M, y, W - M * 2, 8);
    doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(40, 40, 40);
    doc.text(reasonText.slice(0, 80), M + 2, y + 5.5);
    y += 12;
  }
  y += 3;

  // ── SECTION 3: LEAVE PERIOD ───────────────────────────────────────────
  y = sectionBar(doc, y, 'SECTION 3: LEAVE PERIOD  /  SECTION 3 : PÉRIODE DU CONGÉ', W, M);
  y = cell2(doc, y, 12, 'Start Date / Date de Début', fmtDate(l.start_date), 'End Date / Date de Fin', fmtDate(l.end_date), W, M);
  y = cell2(doc, y, 12, 'Total Days Requested / Total de Jours Demandés', `${l.days_count ?? '—'} day(s)`, 'Date of Return / Date de Retour', returnDate, W, M);
  y += 5;

  // ── SECTION 4: REASON & CONTACT ───────────────────────────────────────
  y = sectionBar(doc, y, 'SECTION 4: REASON FOR LEAVE & CONTACT DETAILS  /  SECTION 4 : MOTIF DU CONGÉ', W, M);
  y = textBox(doc, y, 'Reason for Leave / Motif du Congé :', reasonText, W, M);
  const contactPhone   = l.telephone ?? '—';
  const contactAddress = [l.village, l.cell, l.sector, l.district, l.province].filter(Boolean).join(', ') || '—';
  y = cell2(doc, y, 12, 'Contact Phone / Téléphone de Contact', contactPhone, 'Contact Address / Adresse de Contact', contactAddress, W, M);
  y = cell2(doc, y, 12, 'Handover To / Transfert des Tâches à', '—', 'Emergency Contact / Contact d\'Urgence', '—', W, M);
  y += 5;

  // ── SECTION 5: APPROVAL ───────────────────────────────────────────────
  y = sectionBar(doc, y, 'SECTION 5: APPROVAL WORKFLOW  /  SECTION 5 : PROCESSUS D\'APPROBATION', W, M);

  const isApproved = (l.status ?? '').toLowerCase() === 'approved';
  const isRejected = (l.status ?? '').toLowerCase() === 'rejected';

  autoTable(doc, {
    startY: y,
    head: [['', 'Signature', 'Status / Statut', 'Date']],
    body: [
      ['Employee / Employé',                   fullName,                    'Submitted',                            fmtDate(l.requested_at ?? l.created_at)],
      ['HR Manager / Responsable RH (Final)',  l.approved_by_name ?? '—',  isApproved ? '✓ APPROVED' : isRejected ? '✗ REJECTED' : 'Pending', fmtDate(l.requested_at ?? l.created_at)],
    ],
    headStyles: { fillColor: BRAND, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8, halign: 'left' },
    bodyStyles: { fontSize: 8.5 },
    columnStyles: {
      2: {
        fontStyle: 'bold',
        textColor: isApproved ? [39, 103, 73] : isRejected ? [197, 48, 48] : [180, 130, 0],
      },
    },
    margin: { left: M, right: M },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? y + 30;
  y += 6;

  // ── SECTION 6: FOR HR USE ONLY ────────────────────────────────────────
  y = sectionBar(doc, y, 'SECTION 6: FOR HR USE ONLY  /  SECTION 6 : RÉSERVÉ AUX RESSOURCES HUMAINES', W, M);
  y = cell2(doc, y, 12,
    'Date Received / Date de Réception', fmtDate(l.requested_at ?? l.created_at),
    'Status / Statut',  isApproved ? '☑ Approved / Approuvé' : isRejected ? '☑ Rejected / Rejeté' : '☐ Pending',
    W, M
  );
  y = textBox(doc, y, 'HR Comments / Commentaires RH :', l.rejection_reason ?? '', W, M);

  doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(100, 100, 100);
  doc.text('Note: Upon return, employees must complete a Return-to-Work Form (Proc N°15).', M, y);

  // ── APPROVED WATERMARK ────────────────────────────────────────────────
  if (isApproved) {
    doc.saveGraphicsState();
    doc.setFontSize(52); doc.setFont('helvetica', 'bold');
    doc.setTextColor(210, 235, 215);
    doc.text('APPROVED', W / 2, H / 2 + 10, { align: 'center', angle: 45 });
    doc.restoreGraphicsState();
  }

  // ── BOTTOM TEAL BAR ───────────────────────────────────────────────────
  doc.setFillColor(...TEAL);
  doc.rect(0, H - 9, W, 9, 'F');
  doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
  doc.text('www.stewardincubation.com', M, H - 4);
  doc.text('www.stewardincubation@gmail.com', W / 2, H - 4, { align: 'center' });
  doc.text('+250798598710', W - M, H - 4, { align: 'right' });

  // ── GENERATED BY NOTE ─────────────────────────────────────────────────
  doc.setFillColor(...LIGHT);
  doc.rect(M, H - 18, W - M * 2, 7);
  doc.setTextColor(100, 130, 100); doc.setFontSize(6.5); doc.setFont('helvetica', 'italic');
  doc.text(`Generated by SAIC MIS on ${fmtDate(new Date().toISOString().slice(0, 10))}`, W / 2, H - 13.5, { align: 'center' });

  const safeName = fullName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  const filename = `SAIC_Leave_Form_${safeName}_${l.start_date ?? 'form'}.pdf`;

  return { doc, filename };
}

export function getLeaveFormPdfBlob(l: LeaveRequest): { blobUrl: string; filename: string } {
  const { doc, filename } = buildLeaveFormDoc(l);
  const blob = doc.output('blob');
  return { blobUrl: URL.createObjectURL(blob), filename };
}

export function exportLeaveFormPdf(l: LeaveRequest) {
  const { doc, filename } = buildLeaveFormDoc(l);
  doc.save(filename);
}
