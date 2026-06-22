import { useEffect, useState } from 'react';
import { FileText, FolderOpen, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { getMyDocuments } from '../../api/documents';
import type { CompanyDocument } from '../../api/documents';
import PageHeader from '../../components/Common/PageHeader';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './SharedPages.css';

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtSize(bytes?: number | null) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MyDocumentsPage() {
  const [docs,    setDocs]    = useState<CompanyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = () => {
    setLoading(true); setError('');
    getMyDocuments()
      .then(setDocs)
      .catch(() => setError('Failed to load your documents.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner message="Loading your documents…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <PageHeader
        title="My Documents"
        subtitle={`${docs.length} document${docs.length !== 1 ? 's' : ''} assigned to you`}
        actions={
          <button className="btn-secondary" onClick={load}><RefreshCw size={14} /> Refresh</button>
        }
      />

      {error && <div className="alert alert-error"><AlertCircle size={14} />{error}</div>}

      {docs.length === 0 ? (
        <div className="table-card">
          <div className="empty-state">
            <FolderOpen size={42} />
            <p>No documents have been assigned to you yet.</p>
          </div>
        </div>
      ) : (
        <div className="myd-grid">
          {docs.map(doc => (
            <div key={doc.id} className="myd-card">
              <div className="myd-card-icon">
                <FileText size={24} />
              </div>
              <div className="myd-card-body">
                <h4 className="myd-card-title">{doc.title}</h4>
                {doc.description && <p className="myd-card-desc">{doc.description}</p>}
                <div className="myd-card-meta">
                  <span>Assigned {fmtDate(doc.assigned_at)}</span>
                  {fmtSize(doc.file_size) && <span>{fmtSize(doc.file_size)}</span>}
                </div>
              </div>
              <a
                href={`/uploads/${doc.file_name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="myd-open-btn"
                title={`Open ${doc.original_name}`}
              >
                <ExternalLink size={15} /> Open
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
