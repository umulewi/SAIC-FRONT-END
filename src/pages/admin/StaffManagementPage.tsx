import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, CheckCircle, X } from 'lucide-react';
import { adminGetStaff, adminCreateStaff, adminUpdateStaff, adminDeleteStaff } from '../../api/role';
import type { StaffMember } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import { Card } from '../../components/Common/Card';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../shared/SharedPages.css';

interface StaffManagementPageProps {
  roleId: number;
  label: string;
}

type StaffFormData = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  telephone: string;
  gender: string;
  address: string;
};

const EMPTY_FORM: StaffFormData = {
  email: '', password: '', first_name: '', last_name: '',
  telephone: '', gender: '', address: '',
};

export default function StaffManagementPage({ roleId, label }: StaffManagementPageProps) {
  const [staff, setStaff]       = useState<StaffMember[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState<number | null>(null);
  const [form, setForm]         = useState<StaffFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');

  const load = () =>
    adminGetStaff(roleId)
      .then(setStaff)
      .catch(() => setError('Failed to load staff.'))
      .finally(() => setLoading(false));

  useEffect(() => {
    setLoading(true);
    setStaff([]);
    setError('');
    setSuccess('');
    resetForm();
    load();
  }, [roleId]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  const openEdit = (m: StaffMember) => {
    setEditId(m.staff_id);
    setForm({
      email:      m.email,
      password:   '',
      first_name: m.first_name,
      last_name:  m.last_name,
      telephone:  m.telephone ?? '',
      gender:     m.gender ?? '',
      address:    m.address ?? '',
    });
    setShowForm(true);
  };

  const handleChange = (field: keyof StaffFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() || !form.first_name.trim() || !form.last_name.trim()) {
      setError('Email, first name, and last name are required.');
      return;
    }
    if (!editId && !form.password.trim()) {
      setError('Password is required for new staff.');
      return;
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
    if (form.password.trim()) payload.password = form.password;

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      if (editId) {
        await adminUpdateStaff(editId, payload);
        setSuccess('Staff member updated.');
      } else {
        await adminCreateStaff(payload);
        setSuccess('Staff member created.');
      }
      resetForm();
      setLoading(true);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Operation failed.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (m: StaffMember) => {
    if (!confirm(`Delete ${m.first_name} ${m.last_name}?`)) return;
    try {
      await adminDeleteStaff(m.staff_id);
      setStaff((prev) => prev.filter((s) => s.staff_id !== m.staff_id));
      setSuccess('Staff member deleted.');
    } catch {
      setError('Failed to delete staff member.');
    }
  };

  if (loading) return <LoadingSpinner message={`Loading ${label}…`} />;

  return (
    <div>
      <PageHeader
        title={label}
        subtitle={`${staff.length} member${staff.length !== 1 ? 's' : ''}`}
        actions={
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={15} /> Add Staff
          </button>
        }
      />

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          <CheckCircle size={16} /> {success}
        </div>
      )}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {showForm && (
        <Card title={editId ? `Edit ${label}` : `Add ${label}`} style={{ marginBottom: '1rem' }}>
          <form onSubmit={handleSubmit} className="saic-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input value={form.first_name} onChange={handleChange('first_name')} placeholder="First name" disabled={submitting} />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input value={form.last_name} onChange={handleChange('last_name')} placeholder="Last name" disabled={submitting} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={form.email} onChange={handleChange('email')} placeholder="email@example.com" disabled={submitting} />
              </div>
              <div className="form-group">
                <label>{editId ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                <input type="password" value={form.password} onChange={handleChange('password')} placeholder="••••••" disabled={submitting} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Telephone</label>
                <input value={form.telephone} onChange={handleChange('telephone')} placeholder="+250..." disabled={submitting} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select value={form.gender} onChange={handleChange('gender')} disabled={submitting}>
                  <option value="">— Select —</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <input value={form.address} onChange={handleChange('address')} placeholder="Address" disabled={submitting} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn-primary" disabled={submitting}>
                <CheckCircle size={15} /> {submitting ? 'Saving…' : editId ? 'Update' : 'Create'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                <X size={15} /> Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="table-card">
        <table className="saic-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#a0aec0' }}>
                  No {label} found.
                </td>
              </tr>
            )}
            {staff.map((m, i) => (
              <tr key={m.staff_id}>
                <td>{i + 1}</td>
                <td><strong>{m.first_name} {m.last_name}</strong></td>
                <td>{m.email}</td>
                <td>{m.role_name ?? '—'}</td>
                <td>{m.department_name ?? '—'}</td>
                <td>{m.telephone ?? '—'}</td>
                <td>{m.gender ?? '—'}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn-secondary" onClick={() => openEdit(m)}>
                      <Pencil size={13} /> Edit
                    </button>
                    <button className="btn-danger" onClick={() => handleDelete(m)}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
