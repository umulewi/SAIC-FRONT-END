import { useEffect, useState } from 'react';
import {
  Pencil, Trash2, CheckCircle, X, User, Mail,
  Phone, MapPin, Loader2, AlertCircle, UserPlus,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { adminGetStaff, adminCreateStaff, adminUpdateStaff, adminDeleteStaff } from '../../api/role';
import type { StaffMember } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../shared/SharedPages.css';
import './StaffManagementPage.css';

interface StaffManagementPageProps {
  roleId: number;
  label: string;
}

type StaffFormData = {
  email: string;
  first_name: string;
  last_name: string;
  telephone: string;
  gender: string;
  address: string;
};

const EMPTY_FORM: StaffFormData = {
  email: '', first_name: '', last_name: '',
  telephone: '', gender: '', address: '',
};

function initials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?';
}

export default function StaffManagementPage({ roleId, label }: StaffManagementPageProps) {
  const [staff,      setStaff]      = useState<StaffMember[]>([]);
  const [staffPage,  setStaffPage]  = useState(1);
  const STAFF_PAGE_SIZE = 10;
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editId,     setEditId]     = useState<number | null>(null);
  const [form,       setForm]       = useState<StaffFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState('');
  const [error,      setError]      = useState('');
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [deleting,     setDeleting]    = useState(false);

  const load = () =>
    adminGetStaff(roleId)
      .then(data => { setStaff(data); setStaffPage(1); })
      .catch(() => setError('Failed to load staff.'))
      .finally(() => setLoading(false));

  useEffect(() => {
    setLoading(true); setStaff([]); setError(''); setSuccess('');
    resetForm(); load();
  }, [roleId]);

  const resetForm = () => {
    setForm(EMPTY_FORM); setEditId(null); setShowForm(false);
    setError(''); setSuccess('');
  };

  const openEdit = (m: StaffMember) => {
    setEditId(m.staff_id);
    setForm({
      email:      m.email,
      first_name: m.first_name,
      last_name:  m.last_name,
      telephone:  m.telephone ?? '',
      gender:     m.gender ?? '',
      address:    m.address ?? '',
    });
    setError(''); setSuccess(''); setShowForm(true);
  };

  const handleChange = (field: keyof StaffFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!form.email.trim() || !form.first_name.trim() || !form.last_name.trim()) {
      setError('Email, first name, and last name are required.'); return;
    }
    const payload: Record<string, unknown> = {
      role_id:    roleId,
      email:      form.email.trim(),
      first_name: form.first_name.trim(),
      last_name:  form.last_name.trim(),
      telephone:  form.telephone.trim() || undefined,
      gender:     form.gender || undefined,
      address:    form.address.trim() || undefined,
    };

    setSubmitting(true); setError(''); setSuccess('');
    try {
      if (editId) {
        await adminUpdateStaff(editId, payload);
        setSuccess('Staff member updated successfully.');
      } else {
        await adminCreateStaff(payload);
        setSuccess('Staff member created successfully.');
      }
      resetForm(); setLoading(true); load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Operation failed.';
      setError(msg);
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminDeleteStaff(deleteTarget.staff_id);
      setStaff(prev => prev.filter(s => s.staff_id !== deleteTarget.staff_id));
      setDeleteTarget(null);
      setSuccess('Staff member deleted.');
    } catch {
      setError('Failed to delete staff member.');
      setDeleteTarget(null);
    } finally { setDeleting(false); }
  };

  if (loading) return <LoadingSpinner message={`Loading ${label}…`} />;

  const staffTotalPages = Math.ceil(staff.length / STAFF_PAGE_SIZE);
  const staffPaged = staff.slice((staffPage - 1) * STAFF_PAGE_SIZE, staffPage * STAFF_PAGE_SIZE);

  return (
    <div className="sm-root">
      <PageHeader
        title={label}
        subtitle={`${staff.length} member${staff.length !== 1 ? 's' : ''} registered`}
        actions={
          <button className="sm-add-btn" onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); setError(''); }}>
            <UserPlus size={15} /> New Staff
          </button>
        }
      />

      {success && <div className="alert alert-success"><CheckCircle size={14} />{success}</div>}
      {error   && !showForm && <div className="alert alert-error"><AlertCircle size={14} />{error}</div>}

      {/* ── Add / Edit form panel ── */}
      {showForm && (
        <div className="sm-form-panel">
          {/* Green header */}
          <div className="sm-form-header">
            <div className="sm-form-header-left">
              <div className="sm-form-avatar-icon">
                {editId ? <Pencil size={18} /> : <UserPlus size={18} />}
              </div>
              <div>
                <h3 className="sm-form-title">{editId ? 'Edit Staff Member' : 'New Staff Member'}</h3>
                <p className="sm-form-subtitle">{editId ? 'Update the staff member\'s information' : 'Fill in the details to create a new account'}</p>
              </div>
            </div>
            <button className="sm-close-btn" onClick={resetForm} type="button"><X size={18} /></button>
          </div>

          {/* Form body */}
          <div className="sm-form-body">
            {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}><AlertCircle size={13} />{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="sm-field-grid">
                <div className="sm-field">
                  <label className="sm-label"><User size={12} /> First Name *</label>
                  <input className="sm-input" value={form.first_name} onChange={handleChange('first_name')}
                    placeholder="First name" disabled={submitting} />
                </div>
                <div className="sm-field">
                  <label className="sm-label"><User size={12} /> Last Name *</label>
                  <input className="sm-input" value={form.last_name} onChange={handleChange('last_name')}
                    placeholder="Last name" disabled={submitting} />
                </div>
                <div className="sm-field sm-field-full">
                  <label className="sm-label"><Mail size={12} /> Email Address *</label>
                  <input className="sm-input" type="email" value={form.email} onChange={handleChange('email')}
                    placeholder="email@example.com" disabled={submitting || !!editId} />
                  {!editId && <p className="sm-field-hint">The email address will be used as the default password.</p>}
                </div>
                <div className="sm-field">
                  <label className="sm-label"><Phone size={12} /> Telephone</label>
                  <input className="sm-input" value={form.telephone} onChange={handleChange('telephone')}
                    placeholder="+250 7XX XXX XXX" disabled={submitting} />
                </div>
                <div className="sm-field">
                  <label className="sm-label">Gender</label>
                  <select className="sm-input sm-select" value={form.gender} onChange={handleChange('gender')} disabled={submitting}>
                    <option value="">— Select gender —</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="sm-field sm-field-full">
                  <label className="sm-label"><MapPin size={12} /> Address</label>
                  <input className="sm-input" value={form.address} onChange={handleChange('address')}
                    placeholder="Street, City, Country" disabled={submitting} />
                </div>
              </div>

              <div className="sm-form-footer">
                <button type="submit" className="sm-submit-btn" disabled={submitting}>
                  {submitting
                    ? <><Loader2 size={15} className="spin" /> Saving…</>
                    : <><CheckCircle size={15} /> {editId ? 'Update Staff Member' : 'Create Staff Member'}</>
                  }
                </button>
                <button type="button" className="sm-cancel-btn" onClick={resetForm} disabled={submitting}>
                  <X size={15} /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="table-card">
        <table className="saic-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Member</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 && (
              <tr><td colSpan={6}>
                <div className="empty-state"><User size={38} /><p>No {label} registered yet.</p></div>
              </td></tr>
            )}
            {staffPaged.map((m, i) => (
              <tr key={m.staff_id}>
                <td className="col-num">{(staffPage - 1) * STAFF_PAGE_SIZE + i + 1}</td>
                <td>
                  <div className="sm-staff-cell">
                    <div className="sm-staff-avatar">{initials(m.first_name, m.last_name)}</div>
                    <div>
                      <p className="sm-staff-name">{m.first_name} {m.last_name}</p>
                    </div>
                  </div>
                </td>
                <td className="sm-email-cell">{m.email}</td>
                <td className="sm-phone-cell">{m.telephone ?? '—'}</td>
                <td>
                  {m.gender
                    ? <span className={`sm-gender-badge sm-gender-${m.gender}`}>{m.gender}</span>
                    : <span className="sm-dash">—</span>
                  }
                </td>
                <td>
                  <div className="table-actions">
                    <button className="sm-btn-edit" onClick={() => openEdit(m)} title="Edit">
                      <Pencil size={13} /> Edit
                    </button>
                    <button className="sm-btn-delete" onClick={() => setDeleteTarget(m)} title="Delete">
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {staffTotalPages > 1 && (
        <div className="atm-pagination">
          <button className="atm-pg-btn" disabled={staffPage <= 1} onClick={() => setStaffPage(p => p - 1)}>
            <ChevronLeft size={15} />
          </button>
          <span className="atm-pg-info">Page {staffPage} of {staffTotalPages} ({staff.length} members)</span>
          <button className="atm-pg-btn" disabled={staffPage >= staffTotalPages} onClick={() => setStaffPage(p => p + 1)}>
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {deleteTarget && (
        <div className="sm-delete-overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="sm-delete-modal">
            {/* Red gradient header */}
            <div className="sm-delete-modal-header">
              <div className="sm-delete-modal-icon">
                <Trash2 size={30} />
              </div>
              <h3 className="sm-delete-modal-title">Delete Staff Member?</h3>
              <p className="sm-delete-modal-sub">This action is permanent and cannot be reversed</p>
            </div>

            {/* Body */}
            <div className="sm-delete-modal-body">
              <p className="sm-delete-body-text">
                You are about to permanently remove{' '}
                <strong className="sm-delete-name">{deleteTarget.first_name} {deleteTarget.last_name}</strong>.
                All associated data will be lost.
              </p>
              <div className="sm-delete-warning-strip">
                <AlertCircle size={14} />
                This cannot be undone. Please confirm carefully.
              </div>
              <div className="sm-delete-actions">
                <button className="sm-cancel-btn" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                  <X size={13} /> Cancel
                </button>
                <button className="sm-confirm-delete-btn" onClick={handleDelete} disabled={deleting}>
                  {deleting
                    ? <><Loader2 size={13} className="spin" /> Deleting…</>
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
