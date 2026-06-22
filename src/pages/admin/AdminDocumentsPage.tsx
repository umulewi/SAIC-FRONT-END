import { useEffect, useRef, useState } from 'react';
import {
  Upload, Trash2, X, CheckCircle, AlertCircle, Loader2,
  FolderOpen, FileText, UserPlus, Users, ExternalLink,
  RefreshCw, UserMinus,
} from 'lucide-react';
import {
  adminGetDocuments, adminUploadDocument, adminDeleteDocument,
  adminGetDocumentAssignments, adminAssignDocument, adminRemoveDocumentAssignment,
} from '../../api/documents';
import type { CompanyDocument, DocumentAssignment } from '../../api/documents';
import { adminGetStaff } from '../../api/role';
import type { StaffMember } from '../../types';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import '../shared/SharedPages.css';
import './StaffManagementPage.css';
import '../accountant/AccountantPettyCashPage.css';
import './AdminDocumentsPage.css';

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtSize(bytes?: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminDocumentsPage() {
  const [docs,    setDocs]    = useState<CompanyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  // Upload form
  const [showUpload,   setShowUpload]   = useState(false);
  const [uTitle,       setUTitle]       = useState('');
  const [uDesc,        setUDesc]        = useState('');
  const [uFile,        setUFile]        = useState<File | null>(null);
  const [uploading,    setUploading]    = useState(false);
  const [uploadErr,    setUploadErr]    = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<CompanyDocument | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  // Assign modal
  const [assignDoc,    setAssignDoc]    = useState<CompanyDocument | null>(null);
  const [assignments,  setAssignments]  = useState<DocumentAssignment[]>([]);
  const [allStaff,     setAllStaff]     = useState<StaffMember[]>([]);
  const [assignSearch, setAssignSearch] = useState('');
  const [selectedUids, setSelectedUids] = useState<Set<number>>(new Set());
  const [assigning,    setAssigning]    = useState(false);
  const [removing,     setRemoving]     = useState<number | null>(null);
  const [assignErr,    setAssignErr]    = useState('');

  const load = () => {
    setLoading(true); setError('');
    adminGetDocuments()
      .then(data => setDocs(data))
      .catch(() => setError('Failed to load documents.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!uTitle.trim()) { setUploadErr('Title is required.'); return; }
    if (!uFile)         { setUploadErr('Please choose a file to upload.'); return; }
    setUploading(true); setUploadErr('');
    try {
      const fd = new FormData();
      fd.append('title', uTitle.trim());
      if (uDesc.trim()) fd.append('description', uDesc.trim());
      fd.append('file', uFile);
      await adminUploadDocument(fd);
      setSuccess('Document uploaded successfully.');
      setShowUpload(false); setUTitle(''); setUDesc(''); setUFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Upload failed.';
      setUploadErr(msg);
    } finally { setUploading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminDeleteDocument(deleteTarget.id);
      setDeleteTarget(null);
      setSuccess('Document deleted.');
      load();
    } catch {
      setError('Failed to delete document.');
      setDeleteTarget(null);
    } finally { setDeleting(false); }
  };

  const openAssign = async (doc: CompanyDocument) => {
    setAssignDoc(doc);
    setAssignErr(''); setSelectedUids(new Set()); setAssignSearch('');
    const [asmts, staff] = await Promise.all([
      adminGetDocumentAssignments(doc.id),
      adminGetStaff(),
    ]);
    setAssignments(asmts);
    setAllStaff(staff.filter(s => s.role_name !== 'Admin'));
  };

  const handleAssign = async () => {
    if (!assignDoc || selectedUids.size === 0) return;
    setAssigning(true); setAssignErr('');
    try {
      await adminAssignDocument(assignDoc.id, Array.from(selectedUids));
      setSelectedUids(new Set());
      const asmts = await adminGetDocumentAssignments(assignDoc.id);
      setAssignments(asmts);
      setSuccess('Document assigned.');
      load();
    } catch {
      setAssignErr('Failed to assign document.');
    } finally { setAssigning(false); }
  };

  const handleRemoveAssignment = async (userId: number) => {
    if (!assignDoc) return;
    setRemoving(userId);
    try {
      await adminRemoveDocumentAssignment(assignDoc.id, userId);
      setAssignments(prev => prev.filter(a => a.users_id !== userId));
      load();
    } catch {
      setAssignErr('Failed to remove assignment.');
    } finally { setRemoving(null); }
  };

  const assignedIds = new Set(assignments.map(a => a.users_id));
  const filteredStaff = allStaff
    .filter(s => !assignedIds.has(s.users_id))
    .filter(s => {
      if (!assignSearch) return true;
      const q = assignSearch.toLowerCase();
      return `${s.first_name} ${s.last_name} ${s.email}`.toLowerCase().includes(q);
    });

  const toggleUid = (uid: number) =>
    setSelectedUids(prev => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid); else next.add(uid);
      return next;
    });

  if (loading) return <LoadingSpinner message="Loading documents…" />;

  return (
    <div className="adp-root">
      <PageHeader
        title="Document Management"
        subtitle={`${docs.length} document${docs.length !== 1 ? 's' : ''} uploaded`}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={load}><RefreshCw size={14} /> Refresh</button>
            <button className="btn-primary" onClick={() => { setShowUpload(true); setUploadErr(''); }}>
              <Upload size={14} /> Upload Document
            </button>
          </div>
        }
      />

      {success && <div className="alert alert-success"><CheckCircle size={14} />{success}</div>}
      {error   && <div className="alert alert-error"><AlertCircle size={14} />{error}</div>}

      {/* Upload form */}
      {showUpload && (
        <div className="adp-form-panel">
          <div className="adp-form-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="adp-form-icon"><Upload size={18} /></div>
              <div>
                <h3 className="adp-form-title">Upload New Document</h3>
                <p className="adp-form-subtitle">PDF, Word, Excel, images — up to 20 MB</p>
              </div>
            </div>
            <button className="sm-close-btn" onClick={() => setShowUpload(false)} type="button"><X size={18} /></button>
          </div>
          <div className="adp-form-body">
            {uploadErr && <div className="alert alert-error"><AlertCircle size={13} />{uploadErr}</div>}
            <form onSubmit={handleUpload}>
              <div className="adp-field-grid">
                <div className="adp-field adp-field-full">
                  <label className="sm-label">Document Title *</label>
                  <input className="sm-input" value={uTitle} onChange={e => setUTitle(e.target.value)}
                    placeholder="e.g. Company Policy 2025" disabled={uploading} />
                </div>
                <div className="adp-field adp-field-full">
                  <label className="sm-label">Description</label>
                  <textarea className="sm-input adp-textarea" value={uDesc} onChange={e => setUDesc(e.target.value)}
                    placeholder="Brief description of this document…" disabled={uploading} rows={2} />
                </div>
                <div className="adp-field adp-field-full">
                  <label className="sm-label">File *</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*"
                    className="pcp-file-input"
                    onChange={e => setUFile(e.target.files?.[0] ?? null)}
                    disabled={uploading}
                  />
                  {uFile && <p className="pcp-file-name"><FileText size={11} /> {uFile.name} ({fmtSize(uFile.size)})</p>}
                </div>
              </div>
              <div className="sm-form-footer" style={{ margin: '1.25rem 0 0' }}>
                <button type="submit" className="sm-submit-btn" disabled={uploading}>
                  {uploading ? <><Loader2 size={14} className="spin" /> Uploading…</> : <><Upload size={14} /> Upload Document</>}
                </button>
                <button type="button" className="sm-cancel-btn" onClick={() => setShowUpload(false)} disabled={uploading}>
                  <X size={14} /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documents table */}
      <div className="table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="saic-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Document</th>
                <th>Size</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.length === 0 && (
                <tr><td colSpan={7}>
                  <div className="empty-state"><FolderOpen size={38} /><p>No documents uploaded yet.</p></div>
                </td></tr>
              )}
              {docs.map((doc, i) => (
                <tr key={doc.id}>
                  <td className="col-num">{i + 1}</td>
                  <td>
                    <div className="adp-doc-cell">
                      <div className="adp-doc-icon"><FileText size={16} /></div>
                      <div>
                        <p className="adp-doc-title">{doc.title}</p>
                        {doc.description && <p className="adp-doc-desc">{doc.description}</p>}
                        <a href={`/uploads/${doc.file_name}`} target="_blank" rel="noopener noreferrer" className="adp-file-link">
                          {doc.original_name} <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#7a9a7a', whiteSpace: 'nowrap' }}>{fmtSize(doc.file_size)}</td>
                  <td style={{ fontSize: '0.82rem', color: '#4a6c4a' }}>
                    {doc.first_name ? `${doc.first_name} ${doc.last_name}` : doc.uploaded_by_email}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#6a8c6a', whiteSpace: 'nowrap' }}>{fmtDate(doc.created_at)}</td>
                  <td>
                    <span className="adp-assign-count">
                      <Users size={12} /> {doc.assigned_count ?? 0} user{doc.assigned_count !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="adp-btn-assign" onClick={() => openAssign(doc)} title="Manage assignments">
                        <UserPlus size={13} /> Assign
                      </button>
                      <button className="sm-btn-delete" onClick={() => setDeleteTarget(doc)} title="Delete">
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

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="sm-delete-overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="sm-delete-modal">
            <div className="sm-delete-modal-header">
              <div className="sm-delete-modal-icon"><Trash2 size={28} /></div>
              <h3 className="sm-delete-modal-title">Delete Document?</h3>
              <p className="sm-delete-modal-sub">All user assignments will also be removed</p>
            </div>
            <div className="sm-delete-modal-body">
              <p className="sm-delete-body-text">
                You are about to delete <strong className="sm-delete-name">{deleteTarget.title}</strong>.
                The file will be permanently removed from the server.
              </p>
              <div className="sm-delete-warning-strip"><AlertCircle size={14} />This cannot be undone.</div>
              <div className="sm-delete-actions">
                <button className="sm-cancel-btn" onClick={() => setDeleteTarget(null)} disabled={deleting}><X size={13} /> Cancel</button>
                <button className="sm-confirm-delete-btn" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <><Loader2 size={13} className="spin" /> Deleting…</> : <><Trash2 size={13} /> Yes, Delete</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign modal */}
      {assignDoc && (
        <div className="adp-modal-overlay" onClick={e => e.target === e.currentTarget && setAssignDoc(null)}>
          <div className="adp-modal">
            <div className="adp-modal-header">
              <div>
                <h3 className="adp-modal-title">Manage Assignments</h3>
                <p className="adp-modal-sub">{assignDoc.title}</p>
              </div>
              <button className="sm-close-btn" onClick={() => setAssignDoc(null)}><X size={16} /></button>
            </div>

            {assignErr && <div className="alert alert-error" style={{ margin: '0.75rem 1.25rem 0' }}><AlertCircle size={13} />{assignErr}</div>}

            <div className="adp-modal-body">
              {/* Currently assigned */}
              <p className="adp-modal-section-label">Currently Assigned ({assignments.length})</p>
              {assignments.length === 0
                ? <p className="adp-empty-msg">No users assigned yet.</p>
                : <div className="adp-assigned-list">
                    {assignments.map(a => (
                      <div key={a.users_id} className="adp-assigned-item">
                        <div className="adp-assigned-info">
                          <span className="adp-assigned-name">
                            {a.first_name ? `${a.first_name} ${a.last_name}` : a.email}
                          </span>
                          <span className="adp-assigned-role">{a.role_name ?? a.email}</span>
                        </div>
                        <button
                          className="adp-remove-btn"
                          onClick={() => handleRemoveAssignment(a.users_id)}
                          disabled={removing === a.users_id}
                          title="Remove access"
                        >
                          {removing === a.users_id ? <Loader2 size={12} className="spin" /> : <UserMinus size={12} />}
                        </button>
                      </div>
                    ))}
                  </div>
              }

              {/* Add users */}
              <p className="adp-modal-section-label" style={{ marginTop: '1.25rem' }}>Add Users</p>
              <input
                className="sm-input"
                placeholder="Search staff by name or email…"
                value={assignSearch}
                onChange={e => setAssignSearch(e.target.value)}
                style={{ marginBottom: '0.65rem' }}
              />
              <div className="adp-staff-list">
                {filteredStaff.length === 0
                  ? <p className="adp-empty-msg">No unassigned staff found.</p>
                  : filteredStaff.map(s => (
                      <label key={s.users_id} className={`adp-staff-item${selectedUids.has(s.users_id) ? ' selected' : ''}`}>
                        <input
                          type="checkbox"
                          checked={selectedUids.has(s.users_id)}
                          onChange={() => toggleUid(s.users_id)}
                        />
                        <div className="adp-staff-info">
                          <span className="adp-staff-name">{s.first_name} {s.last_name}</span>
                          <span className="adp-staff-role">{s.role_name ?? s.email}</span>
                        </div>
                      </label>
                    ))
                }
              </div>

              {selectedUids.size > 0 && (
                <button className="btn-primary" style={{ marginTop: '0.85rem', width: '100%' }} onClick={handleAssign} disabled={assigning}>
                  {assigning
                    ? <><Loader2 size={14} className="spin" /> Assigning…</>
                    : <><UserPlus size={14} /> Assign to {selectedUids.size} user{selectedUids.size !== 1 ? 's' : ''}</>
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
