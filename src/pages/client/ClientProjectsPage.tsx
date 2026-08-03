import { useState, useEffect } from 'react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import './ClientPages.css';

interface Project {
  id: number;
  title: string;
  description: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<Project['status'], string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed:   'Completed',
  on_hold:     'On Hold',
};
const STATUS_CLASS: Record<Project['status'], string> = {
  not_started: 'cp-badge-gray',
  in_progress: 'cp-badge-blue',
  completed:   'cp-badge-green',
  on_hold:     'cp-badge-amber',
};

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function ClientProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    setLoading(true);
    client.get('/client/projects')
      .then(r => setProjects(r.data.projects ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="cp-page">
      {/* ── Welcome banner ─────────────────────────────────────────────── */}
      <div className="cp-welcome">
        <div>
          <h1 className="cp-welcome-title">Welcome, {user?.first_name ?? 'Client'}</h1>
          <p className="cp-welcome-sub">Track your projects with SAIC</p>
        </div>
        <div className="cp-welcome-badge">Client Portal</div>
      </div>

      {/* ── Projects grid ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="cp-loading">Loading projects…</div>
      ) : projects.length === 0 ? (
        <div className="cp-empty">
          <div className="cp-empty-icon">📋</div>
          <p className="cp-empty-text">No projects yet.</p>
          <p className="cp-empty-sub">SAIC will add your projects here once work begins.</p>
        </div>
      ) : (
        <div className="cp-project-grid">
          {projects.map(p => (
            <div key={p.id} className="cp-project-card">
              <div className="cp-project-head">
                <h3 className="cp-project-title">{p.title}</h3>
                <span className={`cp-badge ${STATUS_CLASS[p.status]}`}>
                  {STATUS_LABELS[p.status]}
                </span>
              </div>
              {p.description && <p className="cp-project-desc">{p.description}</p>}
              <div className="cp-progress-section">
                <div className="cp-progress-label">
                  <span>Progress</span>
                  <span className="cp-progress-pct">{p.progress}%</span>
                </div>
                <div className="cp-progress-track">
                  <div
                    className={`cp-progress-fill ${p.progress === 100 ? 'cp-progress-done' : ''}`}
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
              <div className="cp-project-dates">
                {p.start_date && (
                  <span className="cp-date-item">
                    <span className="cp-date-lbl">Start</span>{fmtDate(p.start_date)}
                  </span>
                )}
                {p.end_date && (
                  <span className="cp-date-item">
                    <span className="cp-date-lbl">End</span>{fmtDate(p.end_date)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
