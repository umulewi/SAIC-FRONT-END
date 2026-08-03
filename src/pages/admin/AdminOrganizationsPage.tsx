import { useState, useEffect, useRef } from 'react';
import {
  Plus, Pencil, Trash2, X, Users, FolderKanban,
  MessageSquare, Send, ChevronRight, Search, AlertCircle, Loader2,
} from 'lucide-react';
import client from '../../api/client';
import './AdminOrganizationsPage.css';
import './StaffManagementPage.css';

interface Client {
  id: number;
  name: string;
  email: string;
  contact_person: string | null;
  phone: string | null;
  sector: string | null;
  address: string | null;
  project_count: number;
  unread_count: number;
  created_at: string;
}

interface Project {
  id: number;
  title: string;
  description: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;
  start_date: string | null;
  end_date: string | null;
}

interface Message {
  id: number;
  sender: 'client' | 'admin';
  message: string;
  is_read: number;
  created_at: string;
}

const STATUS_OPTS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed' },
  { value: 'on_hold',     label: 'On Hold' },
];
const STATUS_CLASS: Record<string, string> = {
  not_started: 'ao-badge-gray',
  in_progress: 'ao-badge-blue',
  completed:   'ao-badge-green',
  on_hold:     'ao-badge-amber',
};
const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed:   'Completed',
  on_hold:     'On Hold',
};

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d: string) =>
  new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });

const EMPTY_CLIENT  = { name: '', email: '', password: '', contact_person: '', phone: '', sector: '', address: '' };
const EMPTY_PROJECT = { title: '', description: '', status: 'not_started', progress: 0, start_date: '', end_date: '' };

export default function AdminOrganizationsPage() {
  const [clients, setClients]         = useState<Client[]>([]);
  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(true);

  // Client modal (create / edit)
  const [clientModal, setClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientForm, setClientForm]   = useState({ ...EMPTY_CLIENT });
  const [clientSaving, setClientSaving] = useState(false);
  const [clientErr, setClientErr]     = useState('');

  // Manage modal (projects + messages)
  const [manageClient, setManageClient] = useState<Client | null>(null);
  const [manageTab, setManageTab]     = useState<'projects' | 'messages'>('projects');

  // Projects
  const [projects, setProjects]       = useState<Project[]>([]);
  const [projLoading, setProjLoading] = useState(false);
  const [editingProj, setEditingProj] = useState<Project | null>(null);
  const [projForm, setProjForm]       = useState({ ...EMPTY_PROJECT });
  const [showProjForm, setShowProjForm] = useState(false);
  const [projSaving, setProjSaving]   = useState(false);
  const [projErr, setProjErr]         = useState('');

  // Messages
  const [messages, setMessages]       = useState<Message[]>([]);
  const [msgLoading, setMsgLoading]   = useState(false);
  const [reply, setReply]             = useState('');
  const [replying, setReplying]       = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Delete client confirmation
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  useEffect(() => { loadClients(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadClients() {
    setLoading(true);
    try {
      const res = await client.get('/admin/clients');
      setClients(res.data.organizations ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function loadProjects(clientId: number) {
    setProjLoading(true);
    try {
      const res = await client.get(`/admin/clients/${clientId}/projects`);
      setProjects(res.data.projects ?? []);
    } finally {
      setProjLoading(false);
    }
  }

  async function loadMessages(clientId: number) {
    setMsgLoading(true);
    try {
      const res = await client.get(`/admin/clients/${clientId}/messages`);
      setMessages(res.data.messages ?? []);
    } finally {
      setMsgLoading(false);
    }
  }

  function openManage(cl: Client) {
    setManageClient(cl);
    setManageTab('projects');
    setShowProjForm(false);
    setProjForm({ ...EMPTY_PROJECT });
    setEditingProj(null);
    setReply('');
    loadProjects(cl.id);
    loadMessages(cl.id);
  }

  function closeManage() {
    setManageClient(null);
    setProjects([]);
    setMessages([]);
  }

  // ─── Client CRUD ──────────────────────────────────────────────────────────

  function openNewClient() {
    setEditingClient(null);
    setClientForm({ ...EMPTY_CLIENT });
    setClientErr('');
    setClientModal(true);
  }

  function openEditClient(cl: Client) {
    setEditingClient(cl);
    setClientForm({
      name: cl.name,
      email: cl.email,
      password: '',
      contact_person: cl.contact_person ?? '',
      phone: cl.phone ?? '',
      sector: cl.sector ?? '',
      address: cl.address ?? '',
    });
    setClientErr('');
    setClientModal(true);
  }

  async function saveClient() {
    if (!clientForm.name.trim() || !clientForm.email.trim()) {
      setClientErr('Name and email are required.');
      return;
    }
    if (!editingClient && !clientForm.password.trim()) {
      setClientErr('Password is required for new clients.');
      return;
    }
    setClientSaving(true);
    setClientErr('');
    try {
      if (editingClient) {
        await client.put(`/admin/clients/${editingClient.id}`, clientForm);
      } else {
        await client.post('/admin/clients', clientForm);
      }
      setClientModal(false);
      await loadClients();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setClientErr(msg ?? 'Failed to save client.');
    } finally {
      setClientSaving(false);
    }
  }

  async function confirmDeleteClient() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await client.delete(`/admin/clients/${deleteTarget.id}`);
      setDeleteTarget(null);
      await loadClients();
    } catch {
      setDeleting(false);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  // ─── Project CRUD ─────────────────────────────────────────────────────────

  function openAddProject() {
    setEditingProj(null);
    setProjForm({ ...EMPTY_PROJECT });
    setProjErr('');
    setShowProjForm(true);
  }

  function openEditProject(p: Project) {
    setEditingProj(p);
    setProjForm({
      title: p.title,
      description: p.description ?? '',
      status: p.status,
      progress: p.progress,
      start_date: p.start_date ?? '',
      end_date: p.end_date ?? '',
    });
    setProjErr('');
    setShowProjForm(true);
  }

  async function saveProject() {
    if (!projForm.title.trim()) { setProjErr('Title is required.'); return; }
    if (!manageClient) return;
    setProjSaving(true);
    setProjErr('');
    try {
      if (editingProj) {
        await client.put(`/admin/clients/projects/${editingProj.id}`, projForm);
      } else {
        await client.post(`/admin/clients/${manageClient.id}/projects`, projForm);
      }
      setShowProjForm(false);
      setEditingProj(null);
      await loadProjects(manageClient.id);
      await loadClients();
    } catch {
      setProjErr('Failed to save project.');
    } finally {
      setProjSaving(false);
    }
  }

  async function deleteProject(pid: number) {
    if (!confirm('Delete this project?')) return;
    if (!manageClient) return;
    try {
      await client.delete(`/admin/clients/projects/${pid}`);
      await loadProjects(manageClient.id);
      await loadClients();
    } catch {}
  }

  // ─── Messages ─────────────────────────────────────────────────────────────

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || replying || !manageClient) return;
    setReplying(true);
    try {
      await client.post(`/admin/clients/${manageClient.id}/messages`, { message: reply.trim() });
      setReply('');
      await loadMessages(manageClient.id);
    } finally {
      setReplying(false);
    }
  }

  const filtered = clients.filter(cl =>
    cl.name.toLowerCase().includes(search.toLowerCase()) ||
    cl.email.toLowerCase().includes(search.toLowerCase()) ||
    (cl.sector ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="ao-page">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="ao-header">
        <div className="ao-header-left">
          <Users size={22} className="ao-header-icon" />
          <div>
            <h1 className="ao-title">Clients</h1>
            <p className="ao-subtitle">Manage client accounts, project progress and messages</p>
          </div>
        </div>
        <button className="ao-btn-primary" onClick={openNewClient}>
          <Plus size={15} /> Add Client
        </button>
      </div>

      {/* ── Search ─────────────────────────────────────────────────────── */}
      <div className="ao-search-row">
        <div className="ao-search-box">
          <Search size={15} className="ao-search-icon" />
          <input
            type="text"
            className="ao-search-input"
            placeholder="Search by name, email or sector…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="ao-count">{filtered.length} client{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="ao-loading">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="ao-empty">
          <Users size={36} className="ao-empty-icon" />
          <p>{clients.length === 0
            ? 'No clients yet. Click "Add Client" to get started.'
            : 'No results match your search.'
          }</p>
        </div>
      ) : (
        <div className="ao-table-wrap">
          <table className="saic-table ao-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Client Name</th>
                <th>Email</th>
                <th>Contact Person</th>
                <th>Sector</th>
                <th className="ao-num">Projects</th>
                <th className="ao-num">Unread</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cl, i) => (
                <tr key={cl.id}>
                  <td className="ao-row-num">{i + 1}</td>
                  <td className="ao-name-cell"><span className="ao-org-name">{cl.name}</span></td>
                  <td>{cl.email}</td>
                  <td>{cl.contact_person ?? '—'}</td>
                  <td>{cl.sector ?? '—'}</td>
                  <td className="ao-num">
                    <span className="ao-proj-count">{cl.project_count}</span>
                  </td>
                  <td className="ao-num">
                    {cl.unread_count > 0
                      ? <span className="ao-unread-badge">{cl.unread_count}</span>
                      : <span className="ao-zero">—</span>
                    }
                  </td>
                  <td>
                    <div className="ao-actions">
                      <button className="ao-btn-manage" onClick={() => openManage(cl)}>
                        Manage <ChevronRight size={13} />
                      </button>
                      <button className="ao-btn-icon" title="Edit" onClick={() => openEditClient(cl)}>
                        <Pencil size={14} />
                      </button>
                      <button className="ao-btn-icon ao-btn-danger" title="Delete" onClick={() => setDeleteTarget(cl)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── New / Edit Client Modal ────────────────────────────────────── */}
      {clientModal && (
        <div className="ao-overlay" onClick={e => e.target === e.currentTarget && setClientModal(false)}>
          <div className="ao-modal ao-modal-sm">
            <div className="ao-modal-head">
              <h2 className="ao-modal-title">
                {editingClient ? `Edit — ${editingClient.name}` : 'Add New Client'}
              </h2>
              <button className="ao-modal-close" onClick={() => setClientModal(false)}><X size={18} /></button>
            </div>
            <div className="ao-modal-body">
              {clientErr && <div className="ao-form-err">{clientErr}</div>}
              <div className="ao-form-grid">
                <div className="ao-form-field">
                  <label className="ao-form-label">Client / Company Name <span className="ao-req">*</span></label>
                  <input className="ao-input" placeholder="e.g. Rwanda Tea Council" value={clientForm.name}
                    onChange={e => setClientForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="ao-form-field">
                  <label className="ao-form-label">Login Email <span className="ao-req">*</span></label>
                  <input type="email" className="ao-input" placeholder="email they use to log in" value={clientForm.email}
                    onChange={e => setClientForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="ao-form-field">
                  <label className="ao-form-label">
                    Password {editingClient
                      ? <span className="ao-hint">(leave blank to keep current)</span>
                      : <span className="ao-req">*</span>}
                  </label>
                  <input type="password" className="ao-input"
                    placeholder={editingClient ? 'Leave blank to keep current' : 'Set login password'}
                    value={clientForm.password}
                    onChange={e => setClientForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <div className="ao-form-field">
                  <label className="ao-form-label">Contact Person</label>
                  <input className="ao-input" placeholder="Name of contact person" value={clientForm.contact_person}
                    onChange={e => setClientForm(f => ({ ...f, contact_person: e.target.value }))} />
                </div>
                <div className="ao-form-field">
                  <label className="ao-form-label">Phone</label>
                  <input className="ao-input" placeholder="+250 …" value={clientForm.phone}
                    onChange={e => setClientForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="ao-form-field">
                  <label className="ao-form-label">Sector</label>
                  <input className="ao-input" placeholder="e.g. Agriculture" value={clientForm.sector}
                    onChange={e => setClientForm(f => ({ ...f, sector: e.target.value }))} />
                </div>
                <div className="ao-form-field ao-span2">
                  <label className="ao-form-label">Address</label>
                  <textarea className="ao-input ao-textarea" placeholder="Physical address" rows={2} value={clientForm.address}
                    onChange={e => setClientForm(f => ({ ...f, address: e.target.value }))} />
                </div>
              </div>
              <div className="ao-modal-footer">
                <button className="ao-btn-secondary" onClick={() => setClientModal(false)}>Cancel</button>
                <button className="ao-btn-primary" onClick={saveClient} disabled={clientSaving}>
                  {clientSaving ? 'Saving…' : editingClient ? 'Save Changes' : 'Add Client'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Client Confirmation Modal ──────────────────────────── */}
      {deleteTarget && (
        <div className="sm-delete-overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="sm-delete-modal">
            <div className="sm-delete-modal-header">
              <div className="sm-delete-modal-icon">
                <Trash2 size={30} />
              </div>
              <h3 className="sm-delete-modal-title">Delete Client?</h3>
              <p className="sm-delete-modal-sub">This action is permanent and cannot be reversed</p>
            </div>
            <div className="sm-delete-modal-body">
              <p className="sm-delete-body-text">
                You are about to permanently remove{' '}
                <strong className="sm-delete-name">{deleteTarget.name}</strong>.
                All their projects and messages will also be deleted.
              </p>
              <div className="sm-delete-warning-strip">
                <AlertCircle size={14} />
                This cannot be undone. Please confirm carefully.
              </div>
              <div className="sm-delete-actions">
                <button className="sm-cancel-btn" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                  <X size={13} /> Cancel
                </button>
                <button className="sm-confirm-delete-btn" onClick={confirmDeleteClient} disabled={deleting}>
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

      {/* ── Manage Modal (Projects + Messages) ────────────────────────── */}
      {manageClient && (
        <div className="ao-overlay" onClick={e => e.target === e.currentTarget && closeManage()}>
          <div className="ao-modal ao-modal-lg">
            <div className="ao-modal-head">
              <div className="ao-manage-head-left">
                <Users size={18} />
                <h2 className="ao-modal-title">{manageClient.name}</h2>
              </div>
              <button className="ao-modal-close" onClick={closeManage}><X size={18} /></button>
            </div>

            {/* Tabs */}
            <div className="ao-manage-tabs">
              <button
                className={`ao-tab ${manageTab === 'projects' ? 'active' : ''}`}
                onClick={() => { setManageTab('projects'); setShowProjForm(false); }}
              >
                <FolderKanban size={14} /> Projects
                <span className="ao-tab-count">{projects.length}</span>
              </button>
              <button
                className={`ao-tab ${manageTab === 'messages' ? 'active' : ''}`}
                onClick={() => setManageTab('messages')}
              >
                <MessageSquare size={14} /> Messages
                {messages.filter(m => m.sender === 'client' && !m.is_read).length > 0 && (
                  <span className="ao-tab-dot" />
                )}
              </button>
            </div>

            <div className="ao-modal-body ao-manage-body">
              {manageTab === 'projects' ? (
                <>
                  {showProjForm ? (
                    <div className="ao-proj-form-wrap">
                      <div className="ao-proj-form-head">
                        <span className="ao-proj-form-title">{editingProj ? 'Edit Project' : 'Add Project'}</span>
                        <button className="ao-btn-ghost" onClick={() => { setShowProjForm(false); setEditingProj(null); }}>
                          <X size={15} /> Cancel
                        </button>
                      </div>
                      {projErr && <div className="ao-form-err">{projErr}</div>}
                      <div className="ao-form-grid">
                        <div className="ao-form-field ao-span2">
                          <label className="ao-form-label">Title <span className="ao-req">*</span></label>
                          <input className="ao-input" placeholder="Project / job title" value={projForm.title}
                            onChange={e => setProjForm(f => ({ ...f, title: e.target.value }))} />
                        </div>
                        <div className="ao-form-field ao-span2">
                          <label className="ao-form-label">Description</label>
                          <textarea className="ao-input ao-textarea" rows={2} placeholder="Brief description of the work…"
                            value={projForm.description}
                            onChange={e => setProjForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                        <div className="ao-form-field">
                          <label className="ao-form-label">Status</label>
                          <select className="ao-input" value={projForm.status}
                            onChange={e => setProjForm(f => ({ ...f, status: e.target.value }))}>
                            {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </div>
                        <div className="ao-form-field">
                          <label className="ao-form-label">Progress: <strong>{projForm.progress}%</strong></label>
                          <input type="range" min={0} max={100} className="ao-range" value={projForm.progress}
                            onChange={e => setProjForm(f => ({ ...f, progress: Number(e.target.value) }))} />
                        </div>
                        <div className="ao-form-field">
                          <label className="ao-form-label">Start Date</label>
                          <input type="date" className="ao-input" value={projForm.start_date}
                            onChange={e => setProjForm(f => ({ ...f, start_date: e.target.value }))} />
                        </div>
                        <div className="ao-form-field">
                          <label className="ao-form-label">End Date</label>
                          <input type="date" className="ao-input" value={projForm.end_date}
                            onChange={e => setProjForm(f => ({ ...f, end_date: e.target.value }))} />
                        </div>
                      </div>
                      <div className="ao-proj-form-footer">
                        <button className="ao-btn-primary" onClick={saveProject} disabled={projSaving}>
                          {projSaving ? 'Saving…' : editingProj ? 'Save Changes' : 'Add Project'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="ao-btn-add-proj" onClick={openAddProject}>
                      <Plus size={15} /> Add Project / Job
                    </button>
                  )}

                  {projLoading ? (
                    <div className="ao-loading">Loading…</div>
                  ) : projects.length === 0 ? (
                    <div className="ao-manage-empty">No projects yet. Click "Add Project / Job" above.</div>
                  ) : (
                    <div className="ao-proj-list">
                      {projects.map(p => (
                        <div key={p.id} className="ao-proj-item">
                          <div className="ao-proj-item-top">
                            <div className="ao-proj-item-left">
                              <span className="ao-proj-item-title">{p.title}</span>
                              <span className={`ao-badge ${STATUS_CLASS[p.status]}`}>
                                {STATUS_LABELS[p.status]}
                              </span>
                            </div>
                            <div className="ao-proj-item-actions">
                              <button className="ao-btn-icon" onClick={() => openEditProject(p)}><Pencil size={13} /></button>
                              <button className="ao-btn-icon ao-btn-danger" onClick={() => deleteProject(p.id)}><Trash2 size={13} /></button>
                            </div>
                          </div>
                          {p.description && <p className="ao-proj-item-desc">{p.description}</p>}
                          <div className="ao-proj-progress">
                            <div className="ao-prog-label">
                              <span>Progress</span>
                              <span className="ao-prog-pct">{p.progress}%</span>
                            </div>
                            <div className="ao-prog-track">
                              <div className="ao-prog-fill" style={{ width: `${p.progress}%` }} />
                            </div>
                          </div>
                          <div className="ao-proj-dates">
                            {p.start_date && <span>Start: {fmtDate(p.start_date)}</span>}
                            {p.end_date && <span>End: {fmtDate(p.end_date)}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="ao-chat-wrap">
                  <div className="ao-chat-body">
                    {msgLoading ? (
                      <div className="ao-loading">Loading…</div>
                    ) : messages.length === 0 ? (
                      <div className="ao-manage-empty">No messages yet from this client.</div>
                    ) : (
                      messages.map(m => (
                        <div key={m.id} className={`ao-bubble-row ${m.sender === 'admin' ? 'ao-row-right' : 'ao-row-left'}`}>
                          <div className={`ao-bubble ${m.sender === 'admin' ? 'ao-bubble-admin' : 'ao-bubble-client'}`}>
                            <div className="ao-bubble-sender">
                              {m.sender === 'admin' ? 'SAIC Team (You)' : manageClient.name}
                            </div>
                            <div className="ao-bubble-text">{m.message}</div>
                            <div className="ao-bubble-time">{fmtTime(m.created_at)}</div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={bottomRef} />
                  </div>
                  <form className="ao-reply-form" onSubmit={sendReply}>
                    <textarea
                      className="ao-reply-input"
                      placeholder="Type your reply… (Enter to send)"
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(e as unknown as React.FormEvent); }
                      }}
                      rows={2}
                      disabled={replying}
                    />
                    <button type="submit" className="ao-btn-send" disabled={replying || !reply.trim()}>
                      <Send size={15} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
