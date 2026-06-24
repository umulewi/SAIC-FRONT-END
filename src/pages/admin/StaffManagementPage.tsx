import { useEffect, useRef, useState } from 'react';
import {
  getCellsBySector, getDistrictsByProvince, getProvinces,
  getSectorsByDistrict, getVillagesByCell,
} from 'rwanda-geo-structure';
import {
  Pencil, Trash2, CheckCircle, X, User, Mail,
  Phone, MapPin, Loader2, AlertCircle, UserPlus,
  ChevronLeft, ChevronRight, UserCog, Camera, Upload,
  Building2, CreditCard, Calendar, FileText, Paperclip, ExternalLink, Eye,
} from 'lucide-react';
import {
  adminGetStaff, adminCreateStaff, adminUpdateStaff,
  adminDeleteStaff, adminUploadStaffPhoto, adminUploadStaffContract,
} from '../../api/role';
import type { StaffMember, DirectoryStaff } from '../../types';
import { StaffDetailModal } from './AdminStaffDirectoryPage';
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
  manager_id: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  bank_name: string;
  bank_account_no: string;
  contract_start: string;
  contract_end: string;
  contract_status: string;
};

const EMPTY_FORM: StaffFormData = {
  email: '', first_name: '', last_name: '',
  telephone: '', gender: '', manager_id: '',
  province: '', district: '', sector: '', cell: '', village: '',
  bank_name: '', bank_account_no: '',
  contract_start: '', contract_end: '', contract_status: 'active',
};

const CONTRACT_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  probation: 'Probation',
  expired: 'Expired',
  terminated: 'Terminated',
};

function initials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?';
}

function ContractBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="sm-dash">—</span>;
  const cls = `sm-contract-badge sm-contract-${status}`;
  return <span className={cls}>{CONTRACT_STATUS_LABELS[status] ?? status}</span>;
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
  const [viewTarget,   setViewTarget]  = useState<DirectoryStaff | null>(null);

  // Profile photo upload
  const [currentPhoto,   setCurrentPhoto]   = useState<string | null>(null);
  const [photoFile,      setPhotoFile]      = useState<File | null>(null);
  const [photoPreview,   setPhotoPreview]   = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Contract file upload
  const [contractFile,       setContractFile]       = useState<File | null>(null);
  const [currentContractFile, setCurrentContractFile] = useState<string | null>(null);
  const [currentContractOrig, setCurrentContractOrig] = useState<string | null>(null);
  const [contractUploading,  setContractUploading]  = useState(false);
  const contractInputRef = useRef<HTMLInputElement>(null);

  // All staff — used to populate the Manager dropdown
  const [allManagers, setAllManagers] = useState<StaffMember[]>([]);
  useEffect(() => {
    adminGetStaff().then(setAllManagers).catch(() => {});
  }, []);

  // Geo-structure cascading options
  const [provinces,  setProvinces_]  = useState<string[]>([]);
  const [districts,  setDistricts]   = useState<string[]>([]);
  const [sectors,    setSectors]     = useState<string[]>([]);
  const [cells,      setCells]       = useState<string[]>([]);
  const [villages,   setVillages]    = useState<string[]>([]);

  useEffect(() => { setProvinces_(getProvinces()); }, []);

  const handleProvinceChange = (val: string) => {
    setForm(p => ({ ...p, province: val, district: '', sector: '', cell: '', village: '' }));
    setDistricts(val ? getDistrictsByProvince(val) : []);
    setSectors([]); setCells([]); setVillages([]);
  };
  const handleDistrictChange = (val: string) => {
    setForm(p => ({ ...p, district: val, sector: '', cell: '', village: '' }));
    setSectors(val ? getSectorsByDistrict(form.province, val) : []);
    setCells([]); setVillages([]);
  };
  const handleSectorChange = (val: string) => {
    setForm(p => ({ ...p, sector: val, cell: '', village: '' }));
    setCells(val ? getCellsBySector(form.province, form.district, val) : []);
    setVillages([]);
  };
  const handleCellChange = (val: string) => {
    setForm(p => ({ ...p, cell: val, village: '' }));
    setVillages(val ? getVillagesByCell(form.province, form.district, form.sector, val) : []);
  };

  const hydrateGeo = (m: StaffMember) => {
    const prov = m.province ?? '';
    const dist = m.district ?? '';
    const sect = m.sector ?? '';
    const cel  = m.cell ?? '';
    setDistricts(prov ? getDistrictsByProvince(prov) : []);
    setSectors(prov && dist ? getSectorsByDistrict(prov, dist) : []);
    setCells(prov && dist && sect ? getCellsBySector(prov, dist, sect) : []);
    setVillages(prov && dist && sect && cel ? getVillagesByCell(prov, dist, sect, cel) : []);
  };

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
    setCurrentPhoto(null); setPhotoFile(null); setPhotoPreview(null);
    setContractFile(null); setCurrentContractFile(null); setCurrentContractOrig(null);
  };

  const openEdit = (m: StaffMember) => {
    setEditId(m.staff_id);
    setCurrentPhoto(m.profile_photo ?? null);
    setPhotoFile(null); setPhotoPreview(null);
    setCurrentContractFile(m.contract_file ?? null);
    setCurrentContractOrig(m.contract_original ?? null);
    setContractFile(null);
    setForm({
      email:           m.email,
      first_name:      m.first_name,
      last_name:       m.last_name,
      telephone:       m.telephone ?? '',
      gender:          m.gender ?? '',
      manager_id:      m.manager_id != null ? String(m.manager_id) : '',
      province:        m.province ?? '',
      district:        m.district ?? '',
      sector:          m.sector ?? '',
      cell:            m.cell ?? '',
      village:         m.village ?? '',
      bank_name:       m.bank_name ?? '',
      bank_account_no: m.bank_account_no ?? '',
      contract_start:  m.contract_start ?? '',
      contract_end:    m.contract_end ?? '',
      contract_status: m.contract_status ?? 'active',
    });
    hydrateGeo(m);
    setError(''); setSuccess(''); setShowForm(true);
  };

  const handleChange = (field: keyof StaffFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const handlePhotoUpload = async () => {
    if (!editId || !photoFile) return;
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', photoFile);
      await adminUploadStaffPhoto(editId, fd);
      setSuccess('Profile photo updated.');
      setPhotoFile(null); setPhotoPreview(null);
      if (photoInputRef.current) photoInputRef.current.value = '';
      setLoading(true); load();
    } catch {
      setError('Failed to upload photo.');
    } finally { setPhotoUploading(false); }
  };

  const handleContractUpload = async (staffId: number) => {
    if (!contractFile) return;
    setContractUploading(true);
    try {
      const fd = new FormData();
      fd.append('contract', contractFile);
      const result = await adminUploadStaffContract(staffId, fd);
      setCurrentContractFile(result.file_name);
      setCurrentContractOrig(result.original_name);
      setContractFile(null);
      if (contractInputRef.current) contractInputRef.current.value = '';
    } catch {
      setError('Failed to upload contract file.');
    } finally { setContractUploading(false); }
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!form.email.trim() || !form.first_name.trim() || !form.last_name.trim()) {
      setError('Email, first name, and last name are required.'); return;
    }
    const payload: Record<string, unknown> = {
      role_id:         roleId,
      email:           form.email.trim(),
      first_name:      form.first_name.trim(),
      last_name:       form.last_name.trim(),
      telephone:       form.telephone.trim() || undefined,
      gender:          form.gender || undefined,
      manager_id:      form.manager_id ? Number(form.manager_id) : undefined,
      province:        form.province || undefined,
      district:        form.district || undefined,
      sector:          form.sector || undefined,
      cell:            form.cell || undefined,
      village:         form.village || undefined,
      bank_name:       form.bank_name.trim() || undefined,
      bank_account_no: form.bank_account_no.trim() || undefined,
      contract_start:  form.contract_start || undefined,
      contract_end:    form.contract_end || undefined,
      contract_status: form.contract_status || undefined,
    };

    setSubmitting(true); setError(''); setSuccess('');
    try {
      if (editId) {
        await adminUpdateStaff(editId, payload);
        if (contractFile) await handleContractUpload(editId);
        setSuccess('Staff member updated successfully.');
      } else {
        const res = await adminCreateStaff(payload);
        const newStaffId: number = res.staff?.id;
        if (contractFile && newStaffId) await handleContractUpload(newStaffId);
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
          <div className="sm-form-header">
            <div className="sm-form-header-left">
              <div className="sm-form-avatar-icon">
                {editId ? <Pencil size={18} /> : <UserPlus size={18} />}
              </div>
              <div>
                <h3 className="sm-form-title">{editId ? 'Edit Staff Member' : 'New Staff Member'}</h3>
                <p className="sm-form-subtitle">{editId ? "Update the staff member's information" : 'Fill in the details to create a new account'}</p>
              </div>
            </div>
            <button className="sm-close-btn" onClick={resetForm} type="button"><X size={18} /></button>
          </div>

          <div className="sm-form-body">
            {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}><AlertCircle size={13} />{error}</div>}

            {/* Profile photo upload — only when editing */}
            {editId && (
              <div className="sm-photo-section">
                <span className="sm-label"><Camera size={12} /> Profile Photo</span>
                <div className="sm-photo-row">
                  <div className="sm-photo-thumb">
                    {(photoPreview ?? (currentPhoto ? `/uploads/${currentPhoto}` : null))
                      ? <img src={photoPreview ?? `/uploads/${currentPhoto}`} alt="profile" className="sm-photo-img" />
                      : <div className="sm-photo-initials">{initials(form.first_name, form.last_name)}</div>
                    }
                  </div>
                  <div className="sm-photo-controls">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      id="sm-photo-file"
                      className="sm-photo-file-input"
                      onChange={handlePhotoFileChange}
                    />
                    <label htmlFor="sm-photo-file" className="sm-photo-pick-btn">
                      <Camera size={13} /> Choose Photo
                    </label>
                    {photoFile && (
                      <button
                        type="button"
                        className="sm-photo-upload-btn"
                        onClick={handlePhotoUpload}
                        disabled={photoUploading}
                      >
                        {photoUploading
                          ? <><Loader2 size={13} className="spin" /> Uploading…</>
                          : <><Upload size={13} /> Upload Photo</>
                        }
                      </button>
                    )}
                    {photoFile && (
                      <span className="sm-photo-name">{photoFile.name}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* ── Personal info ── */}
              <p className="sm-section-label">Personal Information</p>
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
                    placeholder="email@example.com" disabled={submitting} />
                  {editId
                    ? <p className="sm-field-hint">Changing the email updates the login address but not the password.</p>
                    : <p className="sm-field-hint">The email address will be used as the default password.</p>
                  }
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
                <div className="sm-field">
                  <label className="sm-label"><UserCog size={12} /> Manager</label>
                  <select className="sm-input sm-select" value={form.manager_id} onChange={handleChange('manager_id')} disabled={submitting}>
                    <option value="">— No manager —</option>
                    {allManagers
                      .filter(mgr => {
                        if (mgr.staff_id === editId) return false;
                        const role = mgr.role_name ?? '';
                        if (roleId === 6) return role === 'Admin';
                        return role.endsWith('Manager');
                      })
                      .map(mgr => (
                        <option key={mgr.staff_id} value={mgr.staff_id}>
                          {mgr.first_name} {mgr.last_name} ({mgr.role_name ?? mgr.email})
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>

              {/* ── Bank information ── */}
              <p className="sm-section-label" style={{ marginTop: '1.5rem' }}>Bank Information</p>
              <div className="sm-field-grid">
                <div className="sm-field">
                  <label className="sm-label"><Building2 size={12} /> Bank Name</label>
                  <input className="sm-input" value={form.bank_name} onChange={handleChange('bank_name')}
                    placeholder="e.g. Bank of Kigali" disabled={submitting} />
                </div>
                <div className="sm-field">
                  <label className="sm-label"><CreditCard size={12} /> Bank Account No.</label>
                  <input className="sm-input" value={form.bank_account_no} onChange={handleChange('bank_account_no')}
                    placeholder="Account number" disabled={submitting} />
                </div>
              </div>

              {/* ── Contract information ── */}
              <p className="sm-section-label" style={{ marginTop: '1.5rem' }}>Contract Information</p>
              <div className="sm-field-grid">
                <div className="sm-field">
                  <label className="sm-label"><Calendar size={12} /> Contract Start</label>
                  <input className="sm-input" type="date" value={form.contract_start} onChange={handleChange('contract_start')}
                    disabled={submitting} />
                </div>
                <div className="sm-field">
                  <label className="sm-label"><Calendar size={12} /> Contract End</label>
                  <input className="sm-input" type="date" value={form.contract_end}
                    min={form.contract_start || undefined}
                    onChange={handleChange('contract_end')} disabled={submitting} />
                </div>
                <div className="sm-field">
                  <label className="sm-label">Contract Status</label>
                  <select className="sm-input sm-select" value={form.contract_status} onChange={handleChange('contract_status')} disabled={submitting}>
                    <option value="active">Active</option>
                    <option value="probation">Probation</option>
                    <option value="expired">Expired</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
              </div>

              {/* ── Contract file upload ── */}
              <div className="sm-contract-upload" style={{ marginTop: '0.85rem' }}>
                <label className="sm-label"><FileText size={12} /> Contract Document</label>
                {currentContractFile && (
                  <a href={`/uploads/${currentContractFile}`} target="_blank" rel="noopener noreferrer"
                     className="sm-contract-link">
                    <ExternalLink size={12} /> {currentContractOrig ?? 'View current contract'}
                  </a>
                )}
                <div className="sm-photo-row" style={{ marginTop: '0.4rem' }}>
                  <input ref={contractInputRef} type="file" id="sm-contract-file"
                    accept=".pdf,.doc,.docx,image/*" className="sm-photo-file-input"
                    onChange={e => setContractFile(e.target.files?.[0] ?? null)}
                    disabled={submitting || contractUploading} />
                  <label htmlFor="sm-contract-file" className="sm-photo-pick-btn">
                    <Paperclip size={13} /> {contractFile ? 'Change file' : (currentContractFile ? 'Replace' : 'Choose file')}
                  </label>
                  {contractFile && (
                    <span className="sm-photo-name">{contractFile.name}</span>
                  )}
                </div>
                <p className="sm-field-hint">Accepted: PDF, Word, or image. Will be uploaded when you save.</p>
              </div>

              {/* ── Location ── */}
              <p className="sm-section-label" style={{ marginTop: '1.5rem' }}>Location</p>
              <div className="sm-field-grid">
                <div className="sm-field">
                  <label className="sm-label"><MapPin size={12} /> Province</label>
                  <select className="sm-input sm-select" value={form.province}
                    onChange={e => handleProvinceChange(e.target.value)} disabled={submitting}>
                    <option value="">— Select Province —</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="sm-field">
                  <label className="sm-label"><MapPin size={12} /> District</label>
                  <select className="sm-input sm-select" value={form.district}
                    onChange={e => handleDistrictChange(e.target.value)} disabled={submitting || !form.province}>
                    <option value="">— Select District —</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="sm-field">
                  <label className="sm-label"><MapPin size={12} /> Sector</label>
                  <select className="sm-input sm-select" value={form.sector}
                    onChange={e => handleSectorChange(e.target.value)} disabled={submitting || !form.district}>
                    <option value="">— Select Sector —</option>
                    {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="sm-field">
                  <label className="sm-label"><MapPin size={12} /> Cell</label>
                  <select className="sm-input sm-select" value={form.cell}
                    onChange={e => handleCellChange(e.target.value)} disabled={submitting || !form.sector}>
                    <option value="">— Select Cell —</option>
                    {cells.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm-field">
                  <label className="sm-label"><MapPin size={12} /> Village</label>
                  <select className="sm-input sm-select" value={form.village}
                    onChange={e => setForm(p => ({ ...p, village: e.target.value }))} disabled={submitting || !form.cell}>
                    <option value="">— Select Village —</option>
                    {villages.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
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
        <div style={{ overflowX: 'auto' }}>
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
                      <div className="sm-staff-avatar">
                        {m.profile_photo
                          ? <img src={`/uploads/${m.profile_photo}`} alt="photo" className="sm-avatar-img" />
                          : initials(m.first_name, m.last_name)
                        }
                      </div>
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
                      <button className="asd-view-btn" onClick={() => setViewTarget({ ...m, total_points: 0, eval_count: 0, kpi_count: 0, task_total: 0, task_completed: 0 })} title="View Details">
                        <Eye size={13} /> View
                      </button>
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

      {/* ── Staff detail modal ── */}
      {viewTarget && (
        <StaffDetailModal
          staff={viewTarget}
          isAdmin={true}
          onClose={() => setViewTarget(null)}
        />
      )}

      {/* ── Delete confirm modal ── */}
      {deleteTarget && (
        <div className="sm-delete-overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="sm-delete-modal">
            <div className="sm-delete-modal-header">
              <div className="sm-delete-modal-icon">
                <Trash2 size={30} />
              </div>
              <h3 className="sm-delete-modal-title">Delete Staff Member?</h3>
              <p className="sm-delete-modal-sub">This action is permanent and cannot be reversed</p>
            </div>
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
